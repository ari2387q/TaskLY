import nodemailer from "nodemailer";

/**
 * Creates and returns a Nodemailer transporter.
 * Pre-configured for Brevo (Sendinblue) SMTP or any custom SMTP server.
 */
const createTransporter = () => {
  // Brevo SMTP defaults
  const host = process.env.SMTP_HOST || "smtp-relay.brevo.com";
  const port = Number(process.env.SMTP_PORT) || 587;
  const secure = process.env.SMTP_SECURE === "true" || port === 465;

  const user = process.env.SMTP_USER || process.env.BREVO_SMTP_USER || process.env.EMAIL_USER || process.env.SMTP_EMAIL;
  const pass = process.env.SMTP_PASS || process.env.BREVO_SMTP_KEY || process.env.SMTP_PASSWORD || process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.warn(
      "⚠️ SMTP credentials not configured. Please set SMTP_USER (your Brevo login email) and SMTP_PASS (your Brevo SMTP key) in server/.env"
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
    process.env.SMTP_FROM ||
    `"TaskLY" <no-reply@taskly.app>`;

  const transporter = createTransporter();

  try {
    const info = await transporter.sendMail({
      from: fromEmail,
      to,
      subject: "Verify your email - TaskLY",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 28px; background: #ffffff; border-radius: 16px; border: 1px solid #eaeaea; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          <div style="margin-bottom: 20px;">
            <h1 style="color: #111827; font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">Task<span style="color: #6366f1;">LY</span></h1>
          </div>
          <h2 style="color: #1f2937; margin-top: 0; margin-bottom: 12px; font-size: 20px; font-weight: 700;">Verify your email address</h2>
          <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
            Thank you for signing up for TaskLY! Click the button below to verify your email and activate your account. This link is valid for 1 hour.
          </p>
          <div style="margin-bottom: 28px;">
            <a href="${verificationLink}" style="display: inline-block; background-color: #6366f1; color: #ffffff; padding: 12px 28px; border-radius: 9999px; text-decoration: none; font-weight: 700; font-size: 14px;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #6b7280; font-size: 12px; margin-bottom: 8px;">
            Or copy and paste this link in your browser:
          </p>
          <p style="color: #6366f1; font-size: 12px; word-break: break-all; margin-bottom: 24px;">
            ${verificationLink}
          </p>
          <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 24px 0;" />
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            If you didn't create an account with TaskLY, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    console.log(`✉️ Verification email sent to ${to}: ${info.messageId}`);
  } catch (error) {
    console.error("BREVO / NODEMAILER ERROR:", error);
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
    process.env.SMTP_FROM ||
    `"TaskLY" <no-reply@taskly.app>`;

  const transporter = createTransporter();

  try {
    const info = await transporter.sendMail({
      from: fromEmail,
      to,
      subject: `You've been invited to join ${workspaceName} on TaskLY`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 28px; background: #ffffff; border-radius: 16px; border: 1px solid #eaeaea; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          <div style="margin-bottom: 20px;">
            <h1 style="color: #111827; font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">Task<span style="color: #6366f1;">LY</span></h1>
          </div>
          <h2 style="color: #1f2937; margin-top: 0; margin-bottom: 12px; font-size: 20px; font-weight: 700;">You're invited to collaborate!</h2>
          <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
            <strong>${inviterNameOrEmail}</strong> has invited you to join the <strong>${workspaceName}</strong> workspace on TaskLY.
          </p>
          <div style="margin-bottom: 28px;">
            <a href="${inviteLink}" style="display: inline-block; background-color: #6366f1; color: #ffffff; padding: 12px 28px; border-radius: 9999px; text-decoration: none; font-weight: 700; font-size: 14px;">
              Accept Invitation
            </a>
          </div>
          <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 24px 0;" />
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            TaskLY • Collaborative Workspace, Task & Skill Management
          </p>
        </div>
      `,
    });

    console.log(`✉️ Workspace invitation email sent to ${to}: ${info.messageId}`);
  } catch (error) {
    console.error("BREVO / NODEMAILER INVITE ERROR:", error);
    throw new Error("Failed to send invitation email");
  }
};