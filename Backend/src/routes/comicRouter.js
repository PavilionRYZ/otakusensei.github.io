import express from "express";
import { verifyToken, verifyAdmin } from "../middleware/verifyUser.js";
import {
  addComic,
  getComics,
  getComicById,
} from "../controllers/comicController.js";
import rateLimit from "express-rate-limit";

const router = express.Router();

const comicLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: "Too many comic creation requests, please try again later",
});

router.route("/comic/add").post(verifyToken, verifyAdmin, addComic);
router.route("/comics").get(getComics);
router.route("/comic/:id").get(verifyToken, getComicById);

export default router;
