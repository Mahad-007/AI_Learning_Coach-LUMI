import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";
import { AuthService } from "@/services/authService";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokenReady, setTokenReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Check for error parameters first
    const error = searchParams.get('error');
    const errorCode = searchParams.get('error_code');
    const errorDescription = searchParams.get('error_description');

    if (error) {
      console.error('Password reset error:', { error, errorCode, errorDescription });
      
      setHasError(true);
      if (errorCode === 'otp_expired') {
        setErrorMessage('Reset link has expired. Please request a new one.');
        toast.error('Reset link has expired. Please request a new one.');
      } else {
        setErrorMessage('Invalid reset link. Please request a new one.');
        toast.error('Invalid reset link. Please request a new one.');
      }
      
      // Redirect to forgot password page after a short delay
      setTimeout(() => {
        navigate('/forgot-password');
      }, 5000);
      return;
    }

    // Check if we have the necessary URL parameters for password reset
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const type = searchParams.get('type');

    if (type === 'recovery' && accessToken && refreshToken) {
      // Set the session with the tokens from the URL
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      }).then(({ error }) => {
        if (error) {
          console.error('Error setting session:', error);
          toast.error('Invalid or expired reset link');
          navigate('/forgot-password');
        } else {
          setTokenReady(true);
        }
      });
    } else {
      // Listen for auth state changes
      const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
          setTokenReady(true);
        }
      });
      
      return () => {
        sub.subscription.unsubscribe();
      };
    }
  }, [searchParams, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenReady) {
      toast.error("Invalid or expired reset link. Request a new one.");
      return;
    }
    if (!password || password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      // Verify we have a valid session before updating password
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error('Invalid session. Please request a new reset link.');
      }

      await AuthService.updatePassword(password);
      toast.success("Password updated successfully");
      navigate('/reset-success');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-24 pb-10">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold mb-2">Reset your password</h1>
        <p className="text-sm text-muted-foreground mb-6">Enter a new password for your account.</p>
        
        {hasError ? (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{errorMessage}</p>
            <p className="text-red-600 text-xs mt-2">Redirecting to forgot password page in a few seconds...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                id="confirm"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-9"
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Updating...' : 'Update password'}
          </Button>
        </form>
        )}
      </Card>
    </div>
  );
}


