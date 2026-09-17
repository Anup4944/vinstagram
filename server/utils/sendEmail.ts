import transporter from "../config/nodemailer.js";

export async function sendResetPasswordEmail(to: string, resetLink: string) {
  await transporter.sendMail({
    from: `"Social App" <${process.env.SMTP_USER}>`,
    to,
    subject: "Reset your password",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Reset your password</h2>
        <p>We received a request to reset your password. Click the button below to choose a new one.</p>
        <a href="${resetLink}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 16px 0;">
          Reset Password
        </a>
        <p style="color: #666; font-size: 13px;">This link expires in 15 minutes. If you didn't request this, you can safely ignore this email.</p>
        <p style="color: #666; font-size: 13px;">Or copy this link: ${resetLink}</p>
      </div>
    `,
  });
}
