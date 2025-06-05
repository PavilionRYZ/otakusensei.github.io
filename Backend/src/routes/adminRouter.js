import express from "express";
import { verifyAdmin, verifyToken } from "../middleware/verifyUser.js";
import {
  getUserById,
  getUsers,
  updateUserRole,
} from "../controllers/adminController.js";
import { setSubscriptionPlan } from "../controllers/paymentController.js";
const router = express.Router();

router.route("/admin/getusers").get(verifyToken, verifyAdmin, getUsers);
router.route("/admin/getUserById/:id").get(verifyToken, getUserById);
router
  .route("/admin/updateUserRole/:id")
  .patch(verifyToken, verifyAdmin, updateUserRole);

router
  .route("/admin/setSubscriptionPlan")
  .post(verifyToken, verifyAdmin, setSubscriptionPlan);

export default router;
