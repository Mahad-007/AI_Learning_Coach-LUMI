import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, message: 'Method Not Allowed' });

  const { to, senderName, link } = req.body || {};
  if (!to || !senderName || !link) return res.status(400).json({ ok: false, message: 'Missing fields' });

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `AI Learning Coach <${process.env.GMAIL_USER}>`,
      to,
      subject: `${senderName} sent you a friend request`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.5">
          <h2>New Friend Request</h2>
          <p><strong>${senderName}</strong> wants to connect with you on AI Learning Coach.</p>
          <p><a href="${link}" style="display:inline-block;padding:10px 16px;background:#6d28d9;color:#fff;border-radius:8px;text-decoration:none">View request</a></p>
          <p>If the button doesn't work, paste this URL in your browser:<br/>${link}</p>
        </div>
      `,
    });

    return res.status(200).json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ ok: false, message: e.message });
  }
}


