// Email Service for sending verification emails
// Currently logs to console in development mode
// TODO: Integrate with email provider (SendGrid, Mailgun, etc.) for production

const sendVerificationEmail = async (email, otp) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`\n📧 EMAIL VERIFICATION`);
    console.log(`To: ${email}`);
    console.log(`Subject: Verify Your CyberSec LMS Account`);
    console.log(`OTP Code: ${otp}`);
    console.log(`Expires: 10 minutes\n`);
    return { success: true };
  }

  // TODO: Production email sending
  // Example with SendGrid:
  /*
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to: email,
    from: process.env.FROM_EMAIL,
    subject: 'Verify Your CyberSec LMS Account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #00ff41;">Verify Your Email</h2>
        <p>Your verification code is:</p>
        <div style="background: #1a1a1a; color: #00ff41; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${otp}
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't create an account, please ignore this email.</p>
      </div>
    `
  };

  try {
    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
  */

  return { success: true };
};

const sendPasswordResetEmail = async (email, resetToken) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`\n📧 PASSWORD RESET`);
    console.log(`To: ${email}`);
    console.log(`Subject: Reset Your CyberSec LMS Password`);
    console.log(`Reset URL: http://localhost:3000/reset-password/${resetToken}`);
    console.log(`Expires: 1 hour\n`);
    return { success: true };
  }

  // TODO: Production email sending for password reset
  return { success: true };
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail
};