import express from "express";
import { verifyToken, verifyAdmin } from "../middleware/verifyUser.js";
import {
  addComic,
  getComics,
  getComicById,
  likeComic,
  deleteComic,
  editComic,
  totalComics,
} from "../controllers/comicController.js";
import rateLimit from "express-rate-limit";

const router = express.Router();

const comicLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: "Too many comic creation requests, please try again later",
});

const fetchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: "Too many fetch requests, please try again later",
});

router.route("/comic/add").post(verifyToken, verifyAdmin, addComic);
router.route("/comics").get(fetchLimiter, getComics);
router.route("/comic/total").get(totalComics);
router.route("/comic/:id").get(fetchLimiter, getComicById);
router.route("/comic/like/:id").post(verifyToken, likeComic);
router.route("/comic/delete/:id").delete(verifyToken, verifyAdmin, deleteComic);
router.route("/comic/edit/:id").put(verifyToken, verifyAdmin, editComic);

export default router;
