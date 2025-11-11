import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle, Mail, Loader2, ArrowLeft } from "lucide-react";
import { AuthService } from "@/services/authService";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { checkUser, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error' | 'expired' | 'already_verified'>('pending');
  const [errorMessage, setErrorMessage] = useState('');
  const [email, setEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const token = searchParams.get('token');
  const type = searchParams.get('type');

  useEffect(() => {
    // Handle Supabase auth email verification callback
    if (token && type === 'signup') {
      verifyEmailWithSupabase();
    } else if (user) {
      // Check if user is already verified when no token is present
      checkUserVerificationStatus();
    } else {
      // If no user is loaded yet, try to check user status
      checkUserVerificationStatus();
    }
  }, [token, type, user]);

  const verifyEmailWithSupabase = async () => {
    try {
      setLoading(true);
      
      // Supabase automatically handles email verification when user clicks the link
      // We just need to check if the user is now verified
      const { data: { user: authUser }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Auth error:', error);
        setVerificationStatus('error');
        setErrorMessage('Verification failed. Please try again.');
        return;
      }

      if (authUser?.email_confirmed_at) {
        setVerificationStatus('success');
        toast.success("Email verified successfully! Welcome to Lumi! 🎉");
        
        // Refresh user context to get the verified user
        await checkUser();
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } else {
        setVerificationStatus('error');
        setErrorMessage('Email verification failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      setVerificationStatus('error');
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const checkUserVerificationStatus = async () => {
    try {
      setLoading(true);
      await checkUser();
      
      // If user is verified, redirect to dashboard
      if (user?.email_verified) {
        setVerificationStatus('already_verified');
        toast.success("Your email is already verified! Redirecting to dashboard...");
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setVerificationStatus('pending');
      }
    } catch (error) {
      console.error('Error checking user verification status:', error);
      setVerificationStatus('pending');
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async () => {
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    try {
      setResendLoading(true);
      await AuthService.resendVerificationEmail(email);
      setResendSuccess(true);
      toast.success('Verification email sent! Check your inbox.');
    } catch (error: any) {
      console.error('Resend error:', error);
      toast.error(error.message || 'Failed to resend verification email');
    } finally {
      setResendLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Email Verification</h1>
          <p className="text-muted-foreground">
            {verificationStatus === 'pending' && 'Verifying your email address...'}
            {verificationStatus === 'success' && 'Your email has been verified!'}
            {verificationStatus === 'error' && 'Verification failed'}
            {verificationStatus === 'expired' && 'Verification link expired'}
            {verificationStatus === 'already_verified' && 'Your email is already verified!'}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Already Verified State */}
        {verificationStatus === 'already_verified' && (
          <div className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Your email has already been verified! You can access all features of Lumi.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-3">
              <Button onClick={handleGoToDashboard} className="w-full">
                Go to Dashboard
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Redirecting automatically in a few seconds...
              </p>
            </div>
          </div>
        )}

        {/* Success State */}
        {verificationStatus === 'success' && (
          <div className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Your email has been successfully verified! You can now access all features of Lumi.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-3">
              <Button onClick={handleGoToDashboard} className="w-full">
                Go to Dashboard
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Redirecting automatically in a few seconds...
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {verificationStatus === 'error' && (
          <div className="space-y-4">
            <Alert className="border-red-200 bg-red-50">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {errorMessage || 'Verification failed. Please try again.'}
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Enter your email to resend verification</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <Button 
                onClick={resendVerification} 
                disabled={resendLoading || resendSuccess}
                className="w-full"
              >
                {resendLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : resendSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Email Sent!
                  </>
                ) : (
                  'Resend Verification Email'
                )}
              </Button>
              
              <Button variant="outline" onClick={handleBackToLogin} className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Button>
            </div>
          </div>
        )}

        {/* Expired State */}
        {verificationStatus === 'expired' && (
          <div className="space-y-4">
            <Alert className="border-yellow-200 bg-yellow-50">
              <XCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                This verification link has expired. Please request a new one.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-expired">Enter your email to get a new verification link</Label>
                <Input
                  id="email-expired"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <Button 
                onClick={resendVerification} 
                disabled={resendLoading || resendSuccess}
                className="w-full"
              >
                {resendLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : resendSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    New Link Sent!
                  </>
                ) : (
                  'Send New Verification Link'
                )}
              </Button>
              
              <Button variant="outline" onClick={handleBackToLogin} className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Button>
            </div>
          </div>
        )}

        {/* No Token State - Only show if user is not verified */}
        {!token && verificationStatus === 'pending' && !user?.email_verified && (
          <div className="space-y-4">
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                No verification token found. Please check your email for the verification link.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-no-token">Enter your email to resend verification</Label>
                <Input
                  id="email-no-token"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <Button 
                onClick={resendVerification} 
                disabled={resendLoading || resendSuccess}
                className="w-full"
              >
                {resendLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : resendSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Email Sent!
                  </>
                ) : (
                  'Resend Verification Email'
                )}
              </Button>
              
              <Button variant="outline" onClick={handleBackToLogin} className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Need help? Contact our{' '}
            <a href="/help" className="text-primary hover:underline">
              support team
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
}
