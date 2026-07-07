const nodemailer = require('nodemailer');
const logger = require('./logger');

const createTransporter = () => nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to, subject, html
    });
    logger.info(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`Email error: ${error.message}`);
    throw error;
  }
};

const base = (content) => `
<div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0f;color:#fff;padding:40px;border-radius:16px;border:1px solid #1e293b">
  <div style="text-align:center;margin-bottom:32px">
    <h1 style="background:linear-gradient(135deg,#6366f1,#8b5cf6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-size:28px;margin:0">InterviewAI</h1>
  </div>
  ${content}
  <p style="color:#475569;font-size:13px;text-align:center;margin-top:32px;border-top:1px solid #1e293b;padding-top:20px">InterviewAI — Practice smarter, get hired faster.</p>
</div>`;

const sendWelcomeEmail = (user) => sendEmail({
  to: user.email,
  subject: 'Welcome to InterviewAI 🚀',
  html: base(`
    <h2 style="color:#e2e8f0">Welcome, ${user.name}! 🎉</h2>
    <p style="color:#94a3b8;line-height:1.6">Your account is ready. Start your AI-powered interview practice today.</p>
    <div style="text-align:center;margin:32px 0">
      <a href="${process.env.CLIENT_URL}/dashboard" style="background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600">Go to Dashboard →</a>
    </div>`)
});

const sendPasswordResetEmail = (user, resetUrl) => sendEmail({
  to: user.email,
  subject: 'Reset Your Password — InterviewAI',
  html: base(`
    <h2 style="color:#e2e8f0">Reset Your Password</h2>
    <p style="color:#94a3b8;line-height:1.6">This link expires in <strong style="color:#f59e0b">10 minutes</strong>.</p>
    <div style="text-align:center;margin:32px 0">
      <a href="${resetUrl}" style="background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600">Reset Password →</a>
    </div>
    <p style="color:#475569;font-size:13px">If you didn't request this, ignore this email.</p>`)
});

const sendPaymentConfirmation = (user, payment) => sendEmail({
  to: user.email,
  subject: 'Payment Received — InterviewAI',
  html: base(`
    <h2 style="color:#e2e8f0">Payment Submitted ✅</h2>
    <p style="color:#94a3b8">Your payment is under review. Plan activates within 24 hours.</p>
    <div style="background:#1e293b;padding:20px;border-radius:8px;margin:24px 0">
      <p style="color:#94a3b8;margin:0 0 8px">Amount: <strong style="color:#6366f1">₹${payment.amount}</strong></p>
      <p style="color:#94a3b8;margin:0">Transaction ID: <strong style="color:#fff">${payment.transactionId || 'N/A'}</strong></p>
    </div>`)
});

const sendPaymentApproved = (user, plan) => sendEmail({
  to: user.email,
  subject: '🎉 Plan Activated — InterviewAI',
  html: base(`
    <h2 style="color:#e2e8f0">Your ${plan.name} Plan is Active! 🎉</h2>
    <p style="color:#94a3b8">Payment approved. You now have full access to ${plan.name} features.</p>
    <div style="text-align:center;margin:32px 0">
      <a href="${process.env.CLIENT_URL}/dashboard" style="background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600">Start Practicing →</a>
    </div>`)
});

module.exports = { sendEmail, sendWelcomeEmail, sendPasswordResetEmail, sendPaymentConfirmation, sendPaymentApproved };
