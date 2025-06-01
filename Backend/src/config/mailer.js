import nodemailer from "nodemailer";

// Create a transporter for sending emails
const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to send OTP email for signup
const sendOtpEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "OtakuSensei Signup OTP",
    text: `Your OTP for signup is: ${otp}. It will expire in 5 minutes.`,
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #333; text-align: center;">Welcome to OtakuSensei!</h2>
        <p>Dear User,</p>
        <p>Thank you for signing up with OtakuSensei. Please use the following OTP to verify your email and complete your registration:</p>
        <div style="background-color: #f7f7f7; padding: 10px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${otp}
        </div>
        <p>This OTP will expire in 5 minutes.</p>
        <p>If you did not request this signup, please ignore this email or contact our support team.</p>
        <p>Best regards,<br>OtakuSensei Team</p>
    </div>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}`);
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP email");
  }
};

// Function to send password reset email with token link
const sendResetPasswordEmail = async (email, token) => {
  const resetUrl = `${
    process.env.FRONTEND_BASE_URL || "http://localhost:3000"
  }/reset-password/${token}`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "OtakuSensei Password Reset",
    text: `Click the following link to reset your password: ${resetUrl}\nThis link will expire in 15 minutes.`,
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
        <p>Dear User,</p>
        <p>We received a request to reset your password for your OtakuSensei account. Click the link below to reset your password:</p>
        <div style="text-align: center; margin: 20px 0;">
            <a href="${resetUrl}" style="background-color: #E8B5B8; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        </div>
        <p>This link will expire in 15 minutes.</p>
        <p>If you did not request a password reset, please ignore this email or contact our support team.</p>
        <p>Best regards,<br>OtakuSensei Team</p>
    </div>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error("Failed to send password reset email");
  }
};

export { sendOtpEmail, sendResetPasswordEmail };
