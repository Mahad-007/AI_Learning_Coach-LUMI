const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.EMAIL_SERVER_PORT || 4001;

// Middleware
app.use(cors());
app.use(express.json());

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Simple email template
const generateVerificationEmail = (name, verificationUrl) => {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Verify Your Email - Lumi</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #6366f1, #a855f7); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .button { display: inline-block; background: #6366f1; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧠 Welcome to Lumi!</h1>
            <p>Your AI Learning Coach</p>
        </div>
        <div class="content">
            <h2>Hi ${name},</h2>
            <p>Thank you for signing up! Please verify your email address to get started.</p>
            <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </div>
            <p>If the button doesn't work, copy and paste this link:</p>
            <p><a href="${verificationUrl}">${verificationUrl}</a></p>
        </div>
        <div class="footer">
            <p>This email was sent by Lumi. If you didn't create an account, please ignore this email.</p>
        </div>
    </div>
</body>
</html>`;
};

// Routes
app.post('/send-verification', async (req, res) => {
  try {
    const { email, name, token } = req.body;

    console.log('Received verification request:', { email, name, token: token ? 'present' : 'missing' });

    if (!email || !name || !token) {
      console.error('Missing required fields:', { email: !!email, name: !!name, token: !!token });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const verificationUrl = `${process.env.VITE_APP_URL || 'https://www.lumi-learn.app'}/verify?token=${token}`;
    console.log('Generated verification URL:', verificationUrl);
    
    const htmlContent = generateVerificationEmail(name, verificationUrl);

    const mailOptions = {
      from: `"Lumi" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Verify Your Email - Lumi',
      html: htmlContent,
      text: `Hi ${name},\n\nPlease verify your email address by clicking this link: ${verificationUrl}\n\nBest regards,\nThe Lumi Team`,
    };

    console.log('Sending email with options:', { 
      from: mailOptions.from, 
      to: mailOptions.to, 
      subject: mailOptions.subject 
    });

    await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully to:', email);
    res.json({ success: true, message: 'Verification email sent successfully' });
  } catch (error) {
    console.error('Send verification email error:', error);
    res.status(500).json({ error: 'Failed to send verification email: ' + error.message });
  }
});

app.post('/test-email', async (req, res) => {
  try {
    const { email } = req.body;

    console.log('Test email request for:', email);

    if (!email) {
      console.error('Email is required for test');
      return res.status(400).json({ error: 'Email is required' });
    }

    const mailOptions = {
      from: `"Lumi Test" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Test Email - Lumi',
      text: 'This is a test email from Lumi to verify the email service is working.',
    };

    console.log('Sending test email with options:', { 
      from: mailOptions.from, 
      to: mailOptions.to, 
      subject: mailOptions.subject 
    });

    await transporter.sendMail(mailOptions);
    
    console.log('Test email sent successfully to:', email);
    res.json({ success: true, message: 'Test email sent successfully' });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ error: 'Failed to send test email: ' + error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Email Service', 
    timestamp: new Date().toISOString(),
    port: PORT 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`📧 Email service running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📧 Gmail user: ${process.env.GMAIL_USER || 'Not configured'}`);
});

module.exports = app;
