import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

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

// Function to send subscription confirmation email
const sendSubscriptionConfirmationEmail = async (
  email,
  planType,
  startDate,
  endDate
) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "OtakuSensei Premium Subscription Confirmation",
    text: `Dear User,\n\nCongratulations on purchasing a ${planType} premium subscription!\n\nYour subscription starts on ${
      startDate.toISOString().split("T")[0]
    } and ends on ${
      endDate.toISOString().split("T")[0]
    }.\n\nEnjoy your premium comics!\n\nBest regards,\nOtakuSensei Team`,
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #333; text-align: center;">Congratulations on Your Premium Subscription!</h2>
        <p>Dear User,</p>
        <p>Thank you for purchasing a <strong>${planType}</strong> premium subscription with OtakuSensei!</p>
        <p>Your subscription details:</p>
        <ul>
            <li><strong>Start Date:</strong> ${
              startDate.toISOString().split("T")[0]
            }</li>
            <li><strong>End Date:</strong> ${
              endDate.toISOString().split("T")[0]
            }</li>
        </ul>
        <p>Enjoy unlimited access to premium comics during your subscription period!</p>
        <p>If you have any questions, please contact our support team.</p>
        <p>Best regards,<br>OtakuSensei Team</p>
    </div>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Subscription confirmation email sent to ${email}`);
  } catch (error) {
    console.error("Error sending subscription confirmation email:", error);
    throw new Error("Failed to send subscription confirmation email");
  }
};

// Function to send subscription reminder email
const sendSubscriptionReminderEmail = async (email, planType, endDate) => {
  const renewUrl = `${
    process.env.FRONTEND_BASE_URL || "http://localhost:3000"
  }/subscription`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "OtakuSensei Premium Subscription Reminder",
    text: `Dear User,\n\nThis is a reminder that your ${planType} premium subscription will end on ${
      endDate.toISOString().split("T")[0]
    }.\n\nPlease renew your subscription to continue enjoying premium comics!\n\nBest regards,\nOtakuSensei Team`,
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #333; text-align: center;">Premium Subscription Reminder</h2>
        <p>Dear User,</p>
        <p>This is a reminder that your <strong>${planType}</strong> premium subscription with OtakuSensei will end on:</p>
        <p style="text-align: center; font-size: 18px; font-weight: bold; margin: 10px 0;">${
          endDate.toISOString().split("T")[0]
        }</p>
        <p>Please renew your subscription to continue enjoying unlimited access to premium comics.</p>
        <div style="text-align: center; margin: 20px 0;">
            <a href="${renewUrl}" style="background-color: #E8B5B8; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Renew Subscription</a>
        </div>
        <p>If you have any questions, please contact our support team.</p>
        <p>Best regards,<br>OtakuSensei Team</p>
    </div>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Subscription reminder email sent to ${email}`);
  } catch (error) {
    console.error("Error sending subscription reminder email:", error);
    throw new Error("Failed to send subscription reminder email");
  }
};

export {
  sendOtpEmail,
  sendResetPasswordEmail,
  sendSubscriptionConfirmationEmail,
  sendSubscriptionReminderEmail,
};
