import nodemailer from "nodemailer";
import { env } from "@/config/env";

const isConfigured =
  Boolean(env.smtpHost) && Boolean(env.smtpUser) && Boolean(env.smtpPass);

const transporter = isConfigured
  ? nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpSecure, // true for 465, false for 587
      auth: {
        user: env.smtpUser,
        pass: env.smtpPass,
      },
    })
  : null;

export async function sendEmail(options: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<void> {
  if (!transporter) {
    // Fallback so local/dev still works without SMTP
    console.log("[EMAIL-STUB]", {
      to: options.to,
      subject: options.subject,
      text: options.text,
    });
    return;
  }

  await transporter.sendMail({
    from: env.emailFrom,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html ?? options.text.replace(/\n/g, "<br/>"),
  });
}

export async function sendOtpEmail(
  to: string,
  code: string,
  purpose: "register" | "reset",
): Promise<void> {
  const action =
    purpose === "register" ? "verify your HydroLink account" : "reset your password";

  const subject =
    purpose === "register"
      ? "Your HydroLink verification code"
      : "Your HydroLink password reset code";

  const text = [
    `Your HydroLink code is: ${code}`,
    ``,
    `Use this code to ${action}.`,
    `It expires in ${env.otpExpiresInMinutes} minutes.`,
    ``,
    `If you did not request this, you can ignore this email.`,
  ].join("\n");

  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #0B6BCB;">HydroLink</h2>
      <p>Your verification code is:</p>
      <p style="font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #0B6BCB;">
        ${code}
      </p>
      <p>Use this code to <strong>${action}</strong>.</p>
      <p style="color: #666;">This code expires in ${env.otpExpiresInMinutes} minutes.</p>
      <p style="color: #999; font-size: 12px;">
        If you did not request this, you can ignore this email.
      </p>
    </div>
  `;

  await sendEmail({ to, subject, text, html });
}