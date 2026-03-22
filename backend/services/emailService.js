const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

const sendVerificationEmail = async (email, otp) => {
  console.log(`\n📧 EMAIL VERIFICATION`);
  console.log(`To: ${email}`);
  console.log(`OTP Code: ${otp}\n`);

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.log('⚠️ Warning: GMAIL credentials not configured in environment. Skipping email dispatch to prevent connection hang.');
    return { success: true };
  }

  try {
    await transporter.sendMail({
      from: `Hackademy <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Verify Your Hackademy Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0d1117; color: #e6edf3; padding: 40px; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #9fef00; font-size: 28px; margin: 0;">🛡️ HACKADEMY</h1>
            <p style="color: #8b949e; margin-top: 8px;">Cybersecurity Learning Platform</p>
          </div>

          <h2 style="color: #e6edf3; font-size: 22px;">Verify Your Email</h2>
          <p style="color: #8b949e; line-height: 1.6;">
            Thanks for signing up! Use the verification code below to activate your account.
          </p>

          <div style="background: #161b22; border: 2px solid #9fef00; border-radius: 10px; padding: 24px; text-align: center; margin: 32px 0;">
            <p style="color: #8b949e; margin: 0 0 8px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Your Verification Code</p>
            <div style="color: #9fef00; font-size: 48px; font-weight: bold; letter-spacing: 12px; font-family: monospace;">
              ${otp}
            </div>
            <p style="color: #8b949e; margin: 8px 0 0 0; font-size: 13px;">⏱ Expires in 10 minutes</p>
          </div>

          <p style="color: #8b949e; font-size: 13px; line-height: 1.6;">
            If you didn't create an account, you can safely ignore this email.
          </p>

          <div style="border-top: 1px solid #21262d; margin-top: 32px; padding-top: 16px; text-align: center;">
            <p style="color: #484f58; font-size: 12px; margin: 0;">© 2025 Hackademy. All rights reserved.</p>
          </div>
        </div>
      `
    });
    console.log(`✅ Verification email sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    return { success: false, error: error.message };
  }
};

const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
  
  console.log(`\n📧 PASSWORD RESET`);
  console.log(`To: ${email}`);
  console.log(`Reset URL: ${resetUrl}\n`);

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.log('⚠️ Warning: GMAIL credentials not configured in environment. Skipping email dispatch to prevent connection hang.');
    return { success: true };
  }

  try {
    await transporter.sendMail({
      from: `Hackademy <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Reset Your Hackademy Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0d1117; color: #e6edf3; padding: 40px; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #9fef00; font-size: 28px; margin: 0;">🛡️ HACKADEMY</h1>
            <p style="color: #8b949e; margin-top: 8px;">Cybersecurity Learning Platform</p>
          </div>

          <h2 style="color: #e6edf3; font-size: 22px;">Reset Your Password</h2>
          <p style="color: #8b949e; line-height: 1.6;">
            We received a request to reset your password. Click the button below to proceed.
          </p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}" style="background: #9fef00; color: #0d1117; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
              Reset Password
            </a>
          </div>

          <p style="color: #8b949e; font-size: 13px;">
            This link expires in 1 hour. If you didn't request a password reset, ignore this email.
          </p>

          <div style="border-top: 1px solid #21262d; margin-top: 32px; padding-top: 16px; text-align: center;">
            <p style="color: #484f58; font-size: 12px; margin: 0;">© 2025 Hackademy. All rights reserved.</p>
          </div>
        </div>
      `
    });
    console.log(`✅ Password reset email sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Password reset email failed:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
