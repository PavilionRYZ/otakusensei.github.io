import crypto from "crypto";
import ResetToken from "../models/resetTokenModel.js";

// Generate a secure reset token
const generateResetToken = () => {
  return crypto.randomBytes(32).toString("hex"); // Generates a 64-character hex string
};

// Save reset token to database with 15-minute expiration
const saveResetToken = async (email, token) => {
  const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
  await ResetToken.findOneAndUpdate(
    { email },
    { email, token, expires },
    { upsert: true, new: true }
  );
};

// Verify reset token
const verifyResetToken = async (email, token) => {
  const tokenRecord = await ResetToken.findOne({ email, token });
  if (!tokenRecord) {
    throw new Error("Invalid reset token");
  }
  if (new Date() > tokenRecord.expires) {
    throw new Error("Reset token has expired");
  }
  // Token is valid, delete it after verification
  await ResetToken.deleteOne({ email, token });
  return true;
};

export { generateResetToken, saveResetToken, verifyResetToken };
