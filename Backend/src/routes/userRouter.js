import express from "express";
import passport from "../config/passportConfig.js";
import {
  signup,
  verifyOtp,
  login,
  logout,
  updateProfile,
  updatePassword,
  forgotPassword,
  resetPassword,
  sendResponseWithToken,
} from "../controllers/userController.js";
import { verifyToken } from "../middleware/verifyUser.js";
import rateLimit from "express-rate-limit";
import User from "../models/userModel.js";

const router = express.Router();
router.use(passport.initialize());
// router.use(passport.session());

// Rate limiting for login route
const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: "Too many login attempts, please try again after a minute",
});

const userLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: "Too many requests, please try again later",
});

const updateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10, // 10 updates per minute
  message: "Too many update requests, please try again later",
});

const resetLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: "Too many password reset requests, please try again after a minute",
});
// Manual routes
router.route("/user/signup").post(signup);
router.route("/user/verify-otp").post(verifyOtp);
router.route("/user/login").post(loginLimiter, login);
router.route("/user/logout").get(logout);
router
  .route("/user/update-profile")
  .patch(verifyToken, updateLimiter, updateProfile);
router
  .route("/user/update-password")
  .patch(verifyToken, updateLimiter, updatePassword);
router.route("/user/forgot-password").post(resetLimiter, forgotPassword);
router.route("/user/reset-password/:token").post(resetLimiter, resetPassword);

// Google login routes
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false }), // Disable session
  (req, res, next) => {
    try {
      if (!req.user) {
        return res.redirect(
          `${
            process.env.FRONTEND_LOGIN_URL || "http://localhost:5173/login"
          }?error=google_login_failed`
        );
      }
      // Issue a JWT and set the token cookie
      sendResponseWithToken(req.user, res);
    } catch (error) {
      console.error("Google callback error:", error);
      return res.redirect(
        `${
          process.env.FRONTEND_LOGIN_URL || "http://localhost:5173/login"
        }?error=google_login_failed`
      );
    }
  }
);

// Get current user
router.get("/user", userLimiter, verifyToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select(
      "-password -googleId -bookmarks -readingHistory"
    );
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }
    res.status(200).json({
      success: true,
      message: "User data retrieved successfully",
      user,
    });
  } catch (error) {
    return next(new ErrorHandler("Failed to retrieve user data", 500));
  }
});

export default router;
