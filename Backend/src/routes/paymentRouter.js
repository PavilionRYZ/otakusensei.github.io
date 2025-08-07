import express from "express";
import {
  initiatePayment,
  verifyPayment,
  getSubscriptionPlans,
  setSubscriptionPlan,
  premiumUsers,
} from "../controllers/paymentController.js";
import { verifyAdmin, verifyToken } from "../middleware/verifyUser.js";

const router = express.Router();

router.route("/initiate-payment").post(verifyToken, initiatePayment);
router.route("/verify-payment").post(verifyToken, verifyPayment);
router.route("/get-subscription-plans").get(verifyToken, getSubscriptionPlans);
router.route("/update-subscription").post(verifyToken, setSubscriptionPlan);
router
  .route("/user-subscription")
  .get(verifyToken, verifyAdmin, premiumUsers);

export default router;
