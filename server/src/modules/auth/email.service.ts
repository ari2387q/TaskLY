import nodemailer from "nodemailer";

/**
 * Creates and returns a Nodemailer transporter.
 * Supports standard Gmail SMTP (with App Password) or custom SMTP credentials.
 */
const createTransporter = () => {
  const user = process.env.SMTP_USER || process.env.EMAIL_USER || process.env.SMTP_EMAIL;
  const pass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD || process.env.EMAIL_PASS;
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT) || 587;
  const secure = process.env.SMTP_SECURE === "true" || port === 465;

  if (!user || !pass) {
    console.warn(
      "⚠️ SMTP credentials not configured. Please set SMTP_EMAIL (or SMTP_USER) and SMTP_PASSWORD (or SMTP_PASS) in server/.env"
    );
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
};

/**
 * Send an email verification link to a user.
 */
export const sendVerificationEmail = async (
  to: string,
  rawToken: string
): Promise<void> => {
  const verificationLink = `${process.env.CLIENT_URL || "http://localhost:3000"}/verify-email?token=${rawToken}`;
  const fromEmail =
    process.env.EMAIL_FROM ||
    process.env.SMTP_EMAIL ||
    process.env.SMTP_USER ||
    `"Skill Tracker" <no-reply@skilltracker.app>`;

  const transporter = createTransporter();

  try {
    const info = await transporter.sendMail({
      from: fromEmail,
      to,
      subject: "Verify your email - Skill Tracker",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background: #ffffff; border-radius: 12px; border: 1px solid #eaeaea;">
          <h2 style="color: #111827; margin-bottom: 12px; font-size: 22px;">Verify your email address</h2>
          <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
            Thank you for signing up for Skill Tracker! Click the button below to verify your email address. This link is valid for 1 hour.
          </p>
          <div style="margin-bottom: 28px;">
            <a href="${verificationLink}" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #6b7280; font-size: 12px; margin-bottom: 8px;">
            Or copy and paste this link in your browser:
          </p>
          <p style="color: #2563eb; font-size: 12px; word-break: break-all; margin-bottom: 24px;">
            ${verificationLink}
          </p>
          <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 24px 0;" />
          <p style="color: #9ca3af; font-size: 12px;">
            If you didn't create an account with Skill Tracker, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    console.log(`✉️ Verification email sent to ${to}: ${info.messageId}`);
  } catch (error) {
    console.error("NODEMAILER ERROR:", error);
    throw new Error("Failed to send verification email");
  }
};

/**
 * Send a workspace invitation email to a user.
 */
export const sendWorkspaceInviteEmail = async (
  to: string,
  workspaceName: string,
  inviterNameOrEmail: string,
  inviteLink: string
): Promise<void> => {
  const fromEmail =
    process.env.EMAIL_FROM ||
    process.env.SMTP_EMAIL ||
    process.env.SMTP_USER ||
    `"Skill Tracker" <no-reply@skilltracker.app>`;

  const transporter = createTransporter();

  try {
    const info = await transporter.sendMail({
      from: fromEmail,
      to,
      subject: `You've been invited to join ${workspaceName} on Skill Tracker`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background: #ffffff; border-radius: 12px; border: 1px solid #eaeaea;">
          <h2 style="color: #111827; margin-bottom: 12px; font-size: 22px;">You're invited to collaborate!</h2>
          <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
            <strong>${inviterNameOrEmail}</strong> has invited you to join the <strong>${workspaceName}</strong> workspace on Skill Tracker.
          </p>
          <div style="margin-bottom: 28px;">
            <a href="${inviteLink}" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
              Accept Invitation
            </a>
          </div>
          <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 24px 0;" />
          <p style="color: #9ca3af; font-size: 12px;">
            Skill Tracker • Collaborative Skill & Task Tracking
          </p>
        </div>
      `,
    });

    console.log(`✉️ Workspace invitation email sent to ${to}: ${info.messageId}`);
  } catch (error) {
    console.error("NODEMAILER INVITE ERROR:", error);
    throw new Error("Failed to send invitation email");
  }
};