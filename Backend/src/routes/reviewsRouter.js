import express from "express";
import { verifyToken, verifyAdmin } from "../middleware/verifyUser.js";
import {
  createReview,
  getAllReviews,
  likeReview
} from "../controllers/reviewsController.js";

const router = express.Router();

router.route("/review/create/:id").post(verifyToken, createReview);
router.route("/reviews/all/:id").get(verifyToken, getAllReviews);
router.route("/review/like/:id").post(verifyToken, likeReview);


export default router;
