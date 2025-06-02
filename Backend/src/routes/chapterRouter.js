import express from "express";
import {
  addChapter,
  getChapterPdf,
  editChapter,
  deleteChapter,
} from "../controllers/chapterController.js";
import { verifyToken, verifyAdmin } from "../middleware/verifyUser.js";
import rateLimit from "express-rate-limit";

const router = express.Router();

const chapterLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: "Too many chapter creation requests, please try again later",
});

const fetchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: "Too many fetch requests, please try again later",
});

router
  .route("/chapter/add")
  .post(verifyToken, verifyAdmin, chapterLimiter, addChapter);

router.route("/chapter/:id/pdf").get(verifyToken, fetchLimiter, getChapterPdf);
router.route("/chapter/update/:id").put(verifyToken, verifyAdmin, editChapter);
router
  .route("/chapter/delete/:id")
  .delete(verifyToken, verifyAdmin, deleteChapter);

export default router;
