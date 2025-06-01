import crypto from "crypto";
import Otp from "../models/otpModel.js";

// Generate a 6-digit OTP
const generateOtp = () => {
  const randomBytes = crypto.randomBytes(3);
  const otp = (randomBytes.readUIntBE(0, 3) % 900000) + 100000;
  return otp.toString();
};

// Save OTP to database with 5-minute expiration
const saveOtp = async (email, otp) => {
  const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
  await Otp.findOneAndUpdate(
    { email },
    { email, otp, expires },
    { upsert: true, new: true }
  );
};

// Verify OTP
const verifyOtp = async (email, otp) => {
  const otpRecord = await Otp.findOne({ email, otp });
  if (!otpRecord) {
    throw new Error("Invalid OTP");
  }
  if (new Date() > otpRecord.expires) {
    throw new Error("OTP has expired");
  }
  // OTP is valid, delete it after verification
  await Otp.deleteOne({ email, otp });
  return true;
};

export { generateOtp, saveOtp, verifyOtp };
