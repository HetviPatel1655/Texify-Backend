import nodemailer from "nodemailer";
import { env } from "../../config/env.js";
import { AppError } from "../errors/appError.js";

function createTransporter() {
  if (!env.SMTP_USER || !env.SMTP_PASS) {
    throw new AppError("Email service not configured. Set SMTP_USER and SMTP_PASS.", 500);
  }

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });
}

export const EmailService = {
  async sendPasswordResetEmail(to: string, resetToken: string): Promise<void> {
    const transporter = createTransporter();
    const resetLink = `${env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${resetToken}`;

    await transporter.sendMail({
      from: `"Texify" <${env.SMTP_USER}>`,
      to,
      subject: "Reset your Texify password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #111;">Reset your password</h2>
          <p>You requested a password reset for your Texify account. Click the button below to set a new password:</p>
          <a href="${resetLink}" style="display: inline-block; background: #111; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 16px 0;">Reset Password</a>
          <p style="color: #666; font-size: 14px;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });
  },
};
