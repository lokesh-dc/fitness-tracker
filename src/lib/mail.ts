import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    const data = await resend.emails.send({
      from: 'TRAK.FIT <onboarding@resend.dev>', // Use verified domain on Resend
      to,
      subject,
      html,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify?token=${token}`;

  return sendEmail({
    to: email,
    subject: 'Verify your TRAK.FIT account',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: var(--brand-accent);">Welcome to TRAK.FIT!</h2>
        <p>You're almost ready to start tracking your peak performance. Please click the button below to verify your email address:</p>
        <div style="margin: 30px 0;">
          <a href="${verifyUrl}" style="background-color: var(--brand-accent); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Verify Email Address</a>
        </div>
        <p style="color: #666; font-size: 14px;">If you didn't create an account, you can safely ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="color: #999; font-size: 12px;">© 2026 TRAK.FIT Performance Systems</p>
      </div>
    `,
  });
}
