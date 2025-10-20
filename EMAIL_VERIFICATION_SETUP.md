# Email Verification System Setup Guide

## Overview
This implementation adds disposable email blocking and email verification to your Lumi app. Users must verify their email before they can log in.







## Features Implemented

### ✅ Disposable Email Blocking
- Uses `mailchecker` package to detect temporary/disposable email domains
- Blocks registration and login for disposable emails
- Comprehensive email validation

### ✅ Email Verification System
- Database schema with verification tokens
- Professional HTML email templates
- Email service with NodeMailer + Gmail
- Frontend verification page with resend functionality
- Automatic redirect for unverified users

### ✅ Security Features
- Tokens expire in 24 hours
- One-time use tokens
- Secure token generation
- Database cleanup functions

## Setup Instructions

### 1. Environment Variables
Create `.env` file with:
```env
# Frontend
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_APP_URL=http://localhost:5173
VITE_EMAIL_SERVER_URL=http://localhost:4001

# Email Service
GMAIL_USER=your_gmail@gmail.com
GMAIL_APP_PASSWORD=your_google_app_password
EMAIL_SERVER_PORT=4001
APP_NAME=Lumi
```

### 2. Gmail App Password Setup
1. Enable 2-factor authentication on your Gmail account
2. Go to Google Account → Security → App passwords
3. Generate app password for "Mail"
4. Use this password in `GMAIL_APP_PASSWORD`

### 3. Database Migration
The migration has already been applied and includes:
- `email_verified` field in users table
- `email_verification_tokens` table
- Database functions for token management
- Cleanup functions for expired tokens

### 4. Start Services

#### Start Email Service
```bash
npm run email:dev
```

#### Start Frontend
```bash
npm run dev
```

## User Flow

### Registration Flow
1. User signs up with email/password
2. System checks for disposable email → blocks if disposable
3. Account created with `email_verified: false`
4. Verification token generated and stored
5. Professional HTML email sent with verification link
6. User redirected to verification page

### Login Flow
1. User attempts to login
2. System checks for disposable email → blocks if disposable
3. System checks `email_verified` status
4. If unverified → returns `{"redirect": "/verify"}` → frontend redirects
5. If verified → normal login proceeds

### Verification Flow
1. User clicks email link → `/verify?token=abc123`
2. Frontend calls `AuthService.verifyEmail(token)`
3. Database function validates token and updates user
4. User redirected to dashboard
5. Success toast notification

## API Endpoints

### Email Service (`http://localhost:4001`)
- `POST /send-verification` - Send verification email
- `POST /send-password-reset` - Send password reset email
- `POST /send-friend-invitation` - Send friend invitation
- `POST /test-email` - Test email functionality
- `GET /health` - Health check

## Database Functions

### `verify_user_email(token_value)`
- Validates verification token
- Updates user verification status
- Marks token as used
- Returns success/error response

### `generate_verification_token(user_uuid)`
- Creates secure random token
- Stores in verification_tokens table
- Updates user with token
- Returns token value

### `cleanup_expired_tokens()`
- Removes expired unused tokens
- Can be run periodically for cleanup

## Email Templates

### Professional HTML Templates
- **Verification Email**: Welcome message with verification button
- **Password Reset**: Security-focused reset email
- **Friend Invitation**: Social invitation with features overview

### Features
- Responsive design
- Brand colors and styling
- Fallback text links
- Security notes
- Professional footer

## Testing

### Test Disposable Email Blocking
```javascript
// These should be blocked:
test@10minutemail.com
test@tempmail.org
test@guerrillamail.com
```

### Test Verification Flow
1. Sign up with real email
2. Check email for verification link
3. Click link → should verify and redirect
4. Try logging in without verification → should redirect to `/verify`

### Test Email Service
```bash
curl -X POST http://localhost:4001/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com"}'
```

## Security Considerations

### ✅ Implemented
- Disposable email blocking
- Token expiration (24 hours)
- One-time use tokens
- Secure token generation
- Database cleanup

### 🔒 Additional Recommendations
- Rate limiting on email sending
- CAPTCHA for registration
- Email domain whitelist (if needed)
- Monitoring for abuse patterns

## Troubleshooting

### Email Not Sending
1. Check Gmail app password
2. Verify email service is running
3. Check console logs for errors
4. Test with `/test-email` endpoint

### Verification Not Working
1. Check token in database
2. Verify token hasn't expired
3. Check database functions are working
4. Test with direct database query

### Disposable Email Not Blocked
1. Check `mailchecker` package is installed
2. Verify email validation is called
3. Test with known disposable domains

## Files Modified/Created

### New Files
- `src/lib/emailValidation.ts` - Disposable email checking
- `src/templates/emailTemplates.ts` - HTML email templates
- `src/pages/VerifyEmail.tsx` - Verification page
- `api/email-service.ts` - Email API endpoints
- `api/email-server.ts` - Email server entry point

### Modified Files
- `src/services/authService.ts` - Added verification logic
- `src/contexts/AuthContext.tsx` - Added redirect handling
- `src/types/user.d.ts` - Added verification fields
- `src/App.tsx` - Added verification route
- `package.json` - Added email scripts
- `env.example` - Added email variables

## Production Deployment

### Email Service
1. Deploy email service to your hosting platform
2. Set environment variables
3. Update `VITE_EMAIL_SERVER_URL` to production URL
4. Test email functionality

### Database
1. Run cleanup function periodically
2. Monitor verification success rates
3. Set up alerts for email failures

### Monitoring
1. Track verification completion rates
2. Monitor disposable email attempts
3. Set up email delivery monitoring

## Support

If you encounter issues:
1. Check console logs
2. Verify environment variables
3. Test email service health endpoint
4. Check database functions
5. Review this setup guide

The system is now ready for production use with comprehensive email verification and disposable email blocking!
