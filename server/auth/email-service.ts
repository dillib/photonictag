import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

const APP_URL = process.env.APP_URL || "http://localhost:5000";
const APP_NAME = "PhotonicTag";

// Email configuration
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587", 10);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || "noreply@photonictag.com";

let transporter: Transporter | null = null;

// Create a test transporter for development (uses Ethereal)
async function createDevTransporter(): Promise<Transporter> {
  // Create a test account on Ethereal
  const testAccount = await nodemailer.createTestAccount();

  console.log("[EmailService] Using Ethereal test account for development");
  console.log(`  - User: ${testAccount.user}`);
  console.log(`  - Preview emails at: https://ethereal.email`);

  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
}

// Get or create the email transporter
async function getTransporter(): Promise<Transporter> {
  if (transporter) {
    return transporter;
  }

  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    // Production SMTP configuration
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
    console.log(`[EmailService] Using SMTP server: ${SMTP_HOST}`);
  } else {
    // Development: use Ethereal
    transporter = await createDevTransporter();
  }

  return transporter;
}

// Common email template wrapper
function wrapEmail(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${APP_NAME}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      padding: 20px 0;
      border-bottom: 1px solid #eee;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #6366f1;
    }
    .content {
      padding: 30px 0;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #6366f1;
      color: white !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 500;
      margin: 20px 0;
    }
    .button:hover {
      background-color: #4f46e5;
    }
    .footer {
      text-align: center;
      padding: 20px 0;
      border-top: 1px solid #eee;
      color: #666;
      font-size: 14px;
    }
    .muted {
      color: #666;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">${APP_NAME}</div>
  </div>
  <div class="content">
    ${content}
  </div>
  <div class="footer">
    <p>${APP_NAME} - Digital Product Passports</p>
    <p class="muted">If you didn't request this email, you can safely ignore it.</p>
  </div>
</body>
</html>
  `.trim();
}

// Send email verification
export async function sendVerificationEmail(
  email: string,
  token: string,
  firstName?: string
): Promise<boolean> {
  const verifyUrl = `${APP_URL}/auth/verify-email?token=${token}`;
  const greeting = firstName ? `Hi ${firstName},` : "Hi,";

  const html = wrapEmail(`
    <p>${greeting}</p>
    <p>Thanks for signing up for ${APP_NAME}! Please verify your email address by clicking the button below:</p>
    <p style="text-align: center;">
      <a href="${verifyUrl}" class="button">Verify Email Address</a>
    </p>
    <p class="muted">Or copy and paste this link into your browser:</p>
    <p class="muted" style="word-break: break-all;">${verifyUrl}</p>
    <p class="muted">This link will expire in 24 hours.</p>
  `);

  try {
    const transport = await getTransporter();
    const info = await transport.sendMail({
      from: `"${APP_NAME}" <${EMAIL_FROM}>`,
      to: email,
      subject: `Verify your ${APP_NAME} email`,
      html,
    });

    // Log preview URL for Ethereal in development
    if (info.messageId && !SMTP_HOST) {
      console.log(`[EmailService] Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }

    return true;
  } catch (error) {
    console.error("[EmailService] Failed to send verification email:", error);
    return false;
  }
}

// Send password reset email
export async function sendPasswordResetEmail(
  email: string,
  token: string,
  firstName?: string
): Promise<boolean> {
  const resetUrl = `${APP_URL}/auth/reset-password?token=${token}`;
  const greeting = firstName ? `Hi ${firstName},` : "Hi,";

  const html = wrapEmail(`
    <p>${greeting}</p>
    <p>We received a request to reset your password for your ${APP_NAME} account. Click the button below to choose a new password:</p>
    <p style="text-align: center;">
      <a href="${resetUrl}" class="button">Reset Password</a>
    </p>
    <p class="muted">Or copy and paste this link into your browser:</p>
    <p class="muted" style="word-break: break-all;">${resetUrl}</p>
    <p class="muted">This link will expire in 1 hour. If you didn't request a password reset, you can ignore this email.</p>
  `);

  try {
    const transport = await getTransporter();
    const info = await transport.sendMail({
      from: `"${APP_NAME}" <${EMAIL_FROM}>`,
      to: email,
      subject: `Reset your ${APP_NAME} password`,
      html,
    });

    // Log preview URL for Ethereal in development
    if (info.messageId && !SMTP_HOST) {
      console.log(`[EmailService] Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }

    return true;
  } catch (error) {
    console.error("[EmailService] Failed to send password reset email:", error);
    return false;
  }
}

// Send welcome email after registration
export async function sendWelcomeEmail(
  email: string,
  firstName?: string
): Promise<boolean> {
  const loginUrl = `${APP_URL}/auth/login`;
  const docsUrl = `${APP_URL}/docs`;
  const greeting = firstName ? `Hi ${firstName},` : "Hi,";

  const html = wrapEmail(`
    <p>${greeting}</p>
    <p>Welcome to ${APP_NAME}! Your account is now active and ready to use.</p>
    <p>Here are some things you can do:</p>
    <ul>
      <li><strong>Create Digital Product Passports</strong> - Generate QR codes and track product lifecycle</li>
      <li><strong>Connect to SAP</strong> - Sync your product data with SAP S/4HANA</li>
      <li><strong>Track Compliance</strong> - Stay compliant with EU DPP regulations</li>
    </ul>
    <p style="text-align: center;">
      <a href="${loginUrl}" class="button">Go to Dashboard</a>
    </p>
    <p class="muted">Need help getting started? Check out our <a href="${docsUrl}">documentation</a>.</p>
  `);

  try {
    const transport = await getTransporter();
    const info = await transport.sendMail({
      from: `"${APP_NAME}" <${EMAIL_FROM}>`,
      to: email,
      subject: `Welcome to ${APP_NAME}!`,
      html,
    });

    if (info.messageId && !SMTP_HOST) {
      console.log(`[EmailService] Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }

    return true;
  } catch (error) {
    console.error("[EmailService] Failed to send welcome email:", error);
    return false;
  }
}

// Send organization invite email
export async function sendOrganizationInviteEmail(
  email: string,
  token: string,
  organizationName: string,
  inviterName?: string
): Promise<boolean> {
  const inviteUrl = `${APP_URL}/auth/accept-invite?token=${token}`;
  const inviterText = inviterName ? `${inviterName} has invited you` : "You've been invited";

  const html = wrapEmail(`
    <p>Hi,</p>
    <p>${inviterText} to join <strong>${organizationName}</strong> on ${APP_NAME}.</p>
    <p>Click the button below to accept the invitation and join the organization:</p>
    <p style="text-align: center;">
      <a href="${inviteUrl}" class="button">Accept Invitation</a>
    </p>
    <p class="muted">Or copy and paste this link into your browser:</p>
    <p class="muted" style="word-break: break-all;">${inviteUrl}</p>
    <p class="muted">This invitation will expire in 7 days.</p>
  `);

  try {
    const transport = await getTransporter();
    const info = await transport.sendMail({
      from: `"${APP_NAME}" <${EMAIL_FROM}>`,
      to: email,
      subject: `You've been invited to join ${organizationName} on ${APP_NAME}`,
      html,
    });

    if (info.messageId && !SMTP_HOST) {
      console.log(`[EmailService] Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }

    return true;
  } catch (error) {
    console.error("[EmailService] Failed to send organization invite email:", error);
    return false;
  }
}
