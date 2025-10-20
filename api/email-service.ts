import express from 'express';
import nodemailer from 'nodemailer';
import { EmailTemplates } from '../src/templates/emailTemplates';

const router = express.Router();

// Email configuration
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

/**
 * Send verification email
 */
router.post('/send-verification', async (req, res) => {
  try {
    const { email, name, token } = req.body;

    if (!email || !name || !token) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const verificationUrl = `${process.env.VITE_APP_URL || 'http://localhost:5173'}/verify?token=${token}`;
    
    const htmlContent = EmailTemplates.generateVerificationEmail({
      name,
      email,
      verificationUrl,
    });

    const mailOptions = {
      from: `"${process.env.APP_NAME || 'Lumi'}" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `Verify Your Email - ${process.env.APP_NAME || 'Lumi'}`,
      html: htmlContent,
      text: `Hi ${name},\n\nPlease verify your email address by clicking this link: ${verificationUrl}\n\nThis link will expire in 24 hours.\n\nIf you didn't create an account, please ignore this email.\n\nBest regards,\nThe ${process.env.APP_NAME || 'Lumi'} Team`,
    };

    await transporter.sendMail(mailOptions);
    
    res.json({ success: true, message: 'Verification email sent successfully' });
  } catch (error: any) {
    console.error('Send verification email error:', error);
    res.status(500).json({ error: 'Failed to send verification email' });
  }
});

/**
 * Send password reset email
 */
router.post('/send-password-reset', async (req, res) => {
  try {
    const { email, name, token } = req.body;

    if (!email || !name || !token) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const resetUrl = `${process.env.VITE_APP_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
    
    const htmlContent = EmailTemplates.generatePasswordResetEmail({
      name,
      email,
      verificationUrl: resetUrl,
    });

    const mailOptions = {
      from: `"${process.env.APP_NAME || 'Lumi'}" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `Reset Your Password - ${process.env.APP_NAME || 'Lumi'}`,
      html: htmlContent,
      text: `Hi ${name},\n\nYou requested to reset your password. Click this link to set a new password: ${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nThe ${process.env.APP_NAME || 'Lumi'} Team`,
    };

    await transporter.sendMail(mailOptions);
    
    res.json({ success: true, message: 'Password reset email sent successfully' });
  } catch (error: any) {
    console.error('Send password reset email error:', error);
    res.status(500).json({ error: 'Failed to send password reset email' });
  }
});

/**
 * Send friend invitation email
 */
router.post('/send-friend-invitation', async (req, res) => {
  try {
    const { email, inviterName, token } = req.body;

    if (!email || !inviterName || !token) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const invitationUrl = `${process.env.VITE_APP_URL || 'http://localhost:5173'}/signup?invite=${token}`;
    
    const htmlContent = EmailTemplates.generateFriendInvitationEmail({
      name: email.split('@')[0], // Use email prefix as name if not provided
      email,
      verificationUrl: invitationUrl,
      inviterName,
    });

    const mailOptions = {
      from: `"${inviterName} via ${process.env.APP_NAME || 'Lumi'}" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `${inviterName} invited you to join ${process.env.APP_NAME || 'Lumi'}!`,
      html: htmlContent,
      text: `Hi there!\n\n${inviterName} has invited you to join ${process.env.APP_NAME || 'Lumi'}, the AI-powered learning platform.\n\nClick this link to join: ${invitationUrl}\n\nBest regards,\nThe ${process.env.APP_NAME || 'Lumi'} Team`,
    };

    await transporter.sendMail(mailOptions);
    
    res.json({ success: true, message: 'Friend invitation sent successfully' });
  } catch (error: any) {
    console.error('Send friend invitation error:', error);
    res.status(500).json({ error: 'Failed to send friend invitation' });
  }
});

/**
 * Test email endpoint
 */
router.post('/test-email', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const testUrl = `${process.env.VITE_APP_URL || 'http://localhost:5173'}/verify?token=test-token`;
    
    const htmlContent = EmailTemplates.generateVerificationEmail({
      name: 'Test User',
      email,
      verificationUrl: testUrl,
    });

    const mailOptions = {
      from: `"${process.env.APP_NAME || 'Lumi'} Test" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `Test Email - ${process.env.APP_NAME || 'Lumi'}`,
      html: htmlContent,
      text: `This is a test email from ${process.env.APP_NAME || 'Lumi'}.`,
    };

    await transporter.sendMail(mailOptions);
    
    res.json({ success: true, message: 'Test email sent successfully' });
  } catch (error: any) {
    console.error('Test email error:', error);
    res.status(500).json({ error: 'Failed to send test email' });
  }
});

export default router;
