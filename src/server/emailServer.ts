import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';

const app = express();
app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

app.post('/send-friend-request', async (req, res) => {
  const { to, senderName, link } = req.body;
  try {
    await transporter.sendMail({
      from: `Lumi <${process.env.GMAIL_USER}>`,
      to,
      subject: `${senderName} sent you a friend request`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.5">
          <h2>New Friend Request</h2>
          <p><strong>${senderName}</strong> wants to connect with you on Lumi.</p>
          <p><a href="${link}" style="display:inline-block;padding:10px 16px;background:#6d28d9;color:#fff;border-radius:8px;text-decoration:none">View request</a></p>
          <p>If the button doesn't work, paste this URL in your browser:<br/>${link}</p>
        </div>
      `,
    });
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ ok: false, message: e.message });
  }
});

app.post('/send-invite', async (req, res) => {
  const { to, inviterName, signupLink } = req.body;
  try {
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
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ ok: false, message: e.message });
  }
});

const port = Number(process.env.PORT || process.env.EMAIL_SERVER_PORT || 4001);
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => console.log(`Email server listening on ${port}`));
}

export default app;


