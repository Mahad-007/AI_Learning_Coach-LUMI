import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, message: 'Method Not Allowed' });

  const { to, inviterName, signupLink } = req.body || {};
  if (!to || !inviterName || !signupLink) return res.status(400).json({ ok: false, message: 'Missing fields' });

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `Lumi <${process.env.GMAIL_USER}>`,
      to,
      subject: `${inviterName} invited you to Lumi`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.5">
          <h2>You're invited!</h2>
          <p><strong>${inviterName}</strong> is using Lumi and wants you to join.</p>
          <p><a href="${signupLink}" style="display:inline-block;padding:10px 16px;background:#10b981;color:#fff;border-radius:8px;text-decoration:none">Create your account</a></p>
          <p>If the button doesn't work, paste this URL in your browser:<br/>${signupLink}</p>
        </div>
      `,
    });

    return res.status(200).json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ ok: false, message: e.message });
  }
}


