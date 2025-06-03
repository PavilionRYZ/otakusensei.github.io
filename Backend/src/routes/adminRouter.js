import express from "express";
import { verifyAdmin, verifyToken } from "../middleware/verifyUser.js";
import {
  getUserById,
  getUsers,
  updateUserRole,
} from "../controllers/adminController.js";

const router = express.Router();

router.route("/admin/getusers").get(verifyToken, verifyAdmin, getUsers);
router.route("/admin/getUserById/:id").get(verifyToken, getUserById);
router
  .route("/admin/updateUserRole/:id")
  .patch(verifyToken, verifyAdmin, updateUserRole);

export default router;
