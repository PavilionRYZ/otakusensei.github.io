import express from "express";
import {
  initiatePayment,
  verifyPayment,
  getSubscriptionPlans,
} from "../controllers/paymentController.js";
import { verifyToken } from "../middleware/verifyUser.js";

const router = express.Router();

router.route("/initiate-payment").post(verifyToken, initiatePayment);
router.route("/verify-payment").post(verifyToken, verifyPayment);
router.route("/get-subscription-plans").get(verifyToken, getSubscriptionPlans);

export default router;
