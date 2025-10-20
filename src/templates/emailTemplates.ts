/**
 * Professional HTML Email Templates
 * Used for verification emails and other notifications
 */

export interface EmailTemplateData {
  name: string;
  email: string;
  verificationUrl: string;
  appName?: string;
  appUrl?: string;
}

export class EmailTemplates {
  private static readonly APP_NAME = 'Lumi';
  private static readonly APP_URL = process.env.VITE_APP_URL || 'http://localhost:5173';
  private static readonly LOGO_URL = `${this.APP_URL}/logo.png`;

  /**
   * Generate email verification template
   */
  static generateVerificationEmail(data: EmailTemplateData): string {
    const { name, verificationUrl } = data;
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - ${this.APP_NAME}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background-color: #f8fafc;
            color: #334155;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        .logo {
            width: 60px;
            height: 60px;
            margin: 0 auto 20px;
            background-color: rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: bold;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
        }
        .header p {
            margin: 10px 0 0;
            opacity: 0.9;
            font-size: 16px;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 18px;
            margin-bottom: 20px;
            color: #1e293b;
        }
        .message {
            font-size: 16px;
            margin-bottom: 30px;
            color: #475569;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 20px 0;
            box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.3);
            transition: all 0.2s ease;
        }
        .cta-button:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 8px -1px rgba(99, 102, 241, 0.4);
        }
        .alternative-link {
            margin-top: 30px;
            padding: 20px;
            background-color: #f1f5f9;
            border-radius: 8px;
            border-left: 4px solid #6366f1;
        }
        .alternative-link p {
            margin: 0 0 10px;
            font-size: 14px;
            color: #64748b;
        }
        .alternative-link a {
            color: #6366f1;
            word-break: break-all;
            font-size: 12px;
        }
        .footer {
            background-color: #f8fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        .footer p {
            margin: 0;
            font-size: 14px;
            color: #64748b;
        }
        .footer a {
            color: #6366f1;
            text-decoration: none;
        }
        .security-note {
            margin-top: 30px;
            padding: 15px;
            background-color: #fef3c7;
            border-radius: 8px;
            border-left: 4px solid #f59e0b;
        }
        .security-note p {
            margin: 0;
            font-size: 14px;
            color: #92400e;
        }
        @media (max-width: 600px) {
            .container {
                margin: 0;
                border-radius: 0;
            }
            .header, .content, .footer {
                padding: 20px;
            }
            .header h1 {
                font-size: 24px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🧠</div>
            <h1>Welcome to ${this.APP_NAME}!</h1>
            <p>Your AI Learning Coach</p>
        </div>
        
        <div class="content">
            <div class="greeting">Hi ${name},</div>
            
            <div class="message">
                Thank you for signing up for ${this.APP_NAME}! We're excited to have you join our learning community. 
                To get started and access all features, please verify your email address by clicking the button below.
            </div>
            
            <div style="text-align: center;">
                <a href="${verificationUrl}" class="cta-button">Verify Email Address</a>
            </div>
            
            <div class="alternative-link">
                <p><strong>Button not working?</strong> Copy and paste this link into your browser:</p>
                <a href="${verificationUrl}">${verificationUrl}</a>
            </div>
            
            <div class="security-note">
                <p><strong>🔒 Security Note:</strong> This verification link will expire in 24 hours for your security. 
                If you didn't create an account with ${this.APP_NAME}, please ignore this email.</p>
            </div>
        </div>
        
        <div class="footer">
            <p>
                This email was sent by <a href="${this.APP_URL}">${this.APP_NAME}</a><br>
                If you have any questions, please contact our support team.
            </p>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Generate password reset template
   */
  static generatePasswordResetEmail(data: EmailTemplateData): string {
    const { name, verificationUrl } = data;
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password - ${this.APP_NAME}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background-color: #f8fafc;
            color: #334155;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        .logo {
            width: 60px;
            height: 60px;
            margin: 0 auto 20px;
            background-color: rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: bold;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
        }
        .header p {
            margin: 10px 0 0;
            opacity: 0.9;
            font-size: 16px;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 18px;
            margin-bottom: 20px;
            color: #1e293b;
        }
        .message {
            font-size: 16px;
            margin-bottom: 30px;
            color: #475569;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 20px 0;
            box-shadow: 0 4px 6px -1px rgba(220, 38, 38, 0.3);
            transition: all 0.2s ease;
        }
        .cta-button:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 8px -1px rgba(220, 38, 38, 0.4);
        }
        .alternative-link {
            margin-top: 30px;
            padding: 20px;
            background-color: #f1f5f9;
            border-radius: 8px;
            border-left: 4px solid #dc2626;
        }
        .alternative-link p {
            margin: 0 0 10px;
            font-size: 14px;
            color: #64748b;
        }
        .alternative-link a {
            color: #dc2626;
            word-break: break-all;
            font-size: 12px;
        }
        .footer {
            background-color: #f8fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        .footer p {
            margin: 0;
            font-size: 14px;
            color: #64748b;
        }
        .footer a {
            color: #dc2626;
            text-decoration: none;
        }
        .security-note {
            margin-top: 30px;
            padding: 15px;
            background-color: #fef2f2;
            border-radius: 8px;
            border-left: 4px solid #dc2626;
        }
        .security-note p {
            margin: 0;
            font-size: 14px;
            color: #991b1b;
        }
        @media (max-width: 600px) {
            .container {
                margin: 0;
                border-radius: 0;
            }
            .header, .content, .footer {
                padding: 20px;
            }
            .header h1 {
                font-size: 24px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🔐</div>
            <h1>Password Reset Request</h1>
            <p>Secure your ${this.APP_NAME} account</p>
        </div>
        
        <div class="content">
            <div class="greeting">Hi ${name},</div>
            
            <div class="message">
                We received a request to reset your password for your ${this.APP_NAME} account. 
                If you made this request, click the button below to set a new password.
            </div>
            
            <div style="text-align: center;">
                <a href="${verificationUrl}" class="cta-button">Reset Password</a>
            </div>
            
            <div class="alternative-link">
                <p><strong>Button not working?</strong> Copy and paste this link into your browser:</p>
                <a href="${verificationUrl}">${verificationUrl}</a>
            </div>
            
            <div class="security-note">
                <p><strong>🔒 Security Note:</strong> This password reset link will expire in 1 hour for your security. 
                If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
            </div>
        </div>
        
        <div class="footer">
            <p>
                This email was sent by <a href="${this.APP_URL}">${this.APP_NAME}</a><br>
                If you have any questions, please contact our support team.
            </p>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Generate friend invitation template
   */
  static generateFriendInvitationEmail(data: EmailTemplateData & { inviterName: string }): string {
    const { name, inviterName, verificationUrl } = data;
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>You're Invited to Join ${this.APP_NAME}!</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background-color: #f8fafc;
            color: #334155;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #059669 0%, #0d9488 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        .logo {
            width: 60px;
            height: 60px;
            margin: 0 auto 20px;
            background-color: rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: bold;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
        }
        .header p {
            margin: 10px 0 0;
            opacity: 0.9;
            font-size: 16px;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 18px;
            margin-bottom: 20px;
            color: #1e293b;
        }
        .message {
            font-size: 16px;
            margin-bottom: 30px;
            color: #475569;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #059669 0%, #0d9488 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 20px 0;
            box-shadow: 0 4px 6px -1px rgba(5, 150, 105, 0.3);
            transition: all 0.2s ease;
        }
        .cta-button:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 8px -1px rgba(5, 150, 105, 0.4);
        }
        .features {
            margin: 30px 0;
            padding: 20px;
            background-color: #f0fdf4;
            border-radius: 8px;
            border-left: 4px solid #059669;
        }
        .features h3 {
            margin: 0 0 15px;
            color: #059669;
            font-size: 18px;
        }
        .features ul {
            margin: 0;
            padding-left: 20px;
        }
        .features li {
            margin-bottom: 8px;
            color: #166534;
        }
        .footer {
            background-color: #f8fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        .footer p {
            margin: 0;
            font-size: 14px;
            color: #64748b;
        }
        .footer a {
            color: #059669;
            text-decoration: none;
        }
        @media (max-width: 600px) {
            .container {
                margin: 0;
                border-radius: 0;
            }
            .header, .content, .footer {
                padding: 20px;
            }
            .header h1 {
                font-size: 24px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">👥</div>
            <h1>You're Invited!</h1>
            <p>Join ${inviterName} on ${this.APP_NAME}</p>
        </div>
        
        <div class="content">
            <div class="greeting">Hi there!</div>
            
            <div class="message">
                <strong>${inviterName}</strong> has invited you to join ${this.APP_NAME}, the AI-powered learning platform 
                where you can learn anything with personalized AI tutoring, interactive lessons, and collaborative features.
            </div>
            
            <div class="features">
                <h3>🎯 What you'll get:</h3>
                <ul>
                    <li>AI-powered chat tutoring available 24/7</li>
                    <li>Personalized lessons tailored to your learning style</li>
                    <li>Interactive quizzes and progress tracking</li>
                    <li>Collaborative whiteboards for group learning</li>
                    <li>Gamification with XP, levels, and achievements</li>
                    <li>Connect with friends and learn together</li>
                </ul>
            </div>
            
            <div style="text-align: center;">
                <a href="${verificationUrl}" class="cta-button">Join ${this.APP_NAME} Now</a>
            </div>
            
            <div class="message">
                Ready to start your learning journey? Click the button above to create your free account and 
                start learning with ${inviterName}!
            </div>
        </div>
        
        <div class="footer">
            <p>
                This invitation was sent by <a href="${this.APP_URL}">${this.APP_NAME}</a><br>
                If you have any questions, please contact our support team.
            </p>
        </div>
    </div>
</body>
</html>`;
  }
}

export default EmailTemplates;
