import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import ErrorHandler from "../utils/errorHandler.js";

export const verifyToken = async (req, res, next) => {
  try {
    const token =
      req.cookies.token || req.header("Authorization")?.split(" ")[1];

    if (!token) {
      return next(new ErrorHandler("Unauthorized: No token provided", 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.id) {
      return next(new ErrorHandler("Invalid token payload", 401));
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new ErrorHandler("User not found", 401));
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Token verification error:", error.message);
    return next(new ErrorHandler("Forbidden: Invalid or expired token", 401));
  }
};
export const verifyAdmin = (req, res, next) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return next(new ErrorHandler("Unauthorized: Admin access required", 403));
    }
    next();
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
};
