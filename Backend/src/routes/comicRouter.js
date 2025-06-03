import express from "express";
import { verifyToken, verifyAdmin } from "../middleware/verifyUser.js";
import {
  addComic,
  getComics,
  getComicById,
  likeComic,
} from "../controllers/comicController.js";
import rateLimit from "express-rate-limit";

const router = express.Router();

const comicLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: "Too many comic creation requests, please try again later",
});

const fetchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: "Too many fetch requests, please try again later",
});

router.route("/comic/add").post(verifyToken, verifyAdmin, addComic);
router.route("/comics").get(fetchLimiter, getComics);
router.route("/comic/:id").get(verifyToken, fetchLimiter, getComicById);
router.route("/comic/like/:id").post(verifyToken, likeComic);

export default router;
