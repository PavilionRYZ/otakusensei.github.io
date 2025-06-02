import Chapter from "../models/chapterModel.js";
import Comic from "../models/comicModel.js";
import mongoose from "mongoose";
import ErrorHandler from "../utils/errorHandler.js";

// Add a new chapter with PDF URL
const addChapter = async (req, res, next) => {
  try {
    const { comicId, title, chapterNumber, pdfUrl, premium, availableOffline } =
      req.body;

    // Input Validation
    if (!comicId || !title || !chapterNumber || !pdfUrl) {
      return next(
        new ErrorHandler(
          "Comic ID, title, chapter number, and PDF URL are required",
          400
        )
      );
    }

    // Validate comicId
    if (!mongoose.Types.ObjectId.isValid(comicId)) {
      return next(new ErrorHandler("Invalid Comic ID", 400));
    }
    const comic = await Comic.findById(comicId);
    if (!comic) {
      return next(new ErrorHandler("Comic not found", 404));
    }

    // Validate chapterNumber (ensure uniqueness within the comic)
    const existingChapter = await Chapter.findOne({
      comic: comicId,
      chapterNumber,
    });
    if (existingChapter) {
      return next(
        new ErrorHandler("A chapter with this number already exists", 400)
      );
    }

    // Validate pdfUrl
    const urlRegex = /^(https?:\/\/[^\s$.?#].[^\s]*)$/;
    if (typeof pdfUrl !== "string" || !urlRegex.test(pdfUrl)) {
      return next(new ErrorHandler("PDF URL must be a valid URL", 400));
    }

    // Create the chapter
    const chapter = await Chapter.create({
      comic: comicId,
      title,
      chapterNumber,
      pdfUrl,
      premium: premium || false,
      availableOffline: availableOffline || false,
    });

    // Update the comic's chapters array
    comic.chapters.push(chapter._id);
    await comic.save();

    res.status(201).json({
      success: true,
      message: "Chapter added successfully",
      chapter,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const message = Object.values(error.errors)
        .map((err) => err.message)
        .join(", ");
      return next(new ErrorHandler(`Validation failed: ${message}`, 400));
    }
    return next(
      new ErrorHandler(`Failed to add chapter: ${error.message}`, 500)
    );
  }
};

// Get PDF URL for a chapter (with access control)
const getChapterPdf = async (req, res, next) => {
  try {
    const chapterId = req.params.id;

    // Validate chapterId
    if (!mongoose.Types.ObjectId.isValid(chapterId)) {
      return next(new ErrorHandler("Invalid Chapter ID", 400));
    }

    const chapter = await Chapter.findById(chapterId).select(
      "comic premium pdfUrl"
    );
    if (!chapter) {
      return next(new ErrorHandler("Chapter not found", 404));
    }

    // Fetch the comic to check if it's premium
    const comic = await Comic.findById(chapter.comic);
    if (!comic) {
      return next(new ErrorHandler("Associated comic not found", 404));
    }

    // Access control
    const isPremiumContent = comic.premium || chapter.premium;
    if (
      isPremiumContent &&
      (!req.user || !req.user.hasActivePremiumSubscription())
    ) {
      return next(
        new ErrorHandler("Premium content requires an active subscription", 403)
      );
    }

    res.status(200).json({
      success: true,
      message: "PDF URL retrieved successfully",
      data: {
        pdfUrl: chapter.pdfUrl,
      },
    });
  } catch (error) {
    if (error.name === "CastError") {
      return next(new ErrorHandler("Invalid Chapter ID", 400));
    }
    return next(new ErrorHandler(`Failed to fetch PDF: ${error.message}`, 500));
  }
};

// edit Chapter
const editChapter = async (req, res, next) => {
  try {
    const chapterId = req.params.id;
    const updates = req.body;

    // Validate chapterId
    if (!mongoose.Types.ObjectId.isValid(chapterId)) {
      return next(new ErrorHandler("Invalid Chapter ID", 400));
    }

    // Check if chapter exists
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return next(new ErrorHandler("Chapter not found", 404));
    }

    // Validate updates
    if (Object.keys(updates).length === 0) {
      return next(new ErrorHandler("No updates provided", 400));
    }

    // Define allowed fields for update
    const allowedUpdates = [
      "title",
      "chapterNumber",
      "pdfUrl",
      "premium",
      "availableOffline",
    ];
    const updateKeys = Object.keys(updates);
    const isValidUpdate = updateKeys.every((key) =>
      allowedUpdates.includes(key)
    );
    if (!isValidUpdate) {
      return next(new ErrorHandler("Invalid fields in update", 400));
    }

    // Validate field values
    if (
      updates.title &&
      (typeof updates.title !== "string" || updates.title.trim() === "")
    ) {
      return next(new ErrorHandler("Title must be a non-empty string", 400));
    }
    if (
      updates.chapterNumber &&
      (typeof updates.chapterNumber !== "number" || updates.chapterNumber < 1)
    ) {
      return next(
        new ErrorHandler("Chapter number must be a positive number", 400)
      );
    }
    if (updates.pdfUrl) {
      const urlRegex = /^(https?:\/\/[^\s$.?#].[^\s]*)$/;
      if (
        typeof updates.pdfUrl !== "string" ||
        !urlRegex.test(updates.pdfUrl)
      ) {
        return next(new ErrorHandler("PDF URL must be a valid URL", 400));
      }
    }
    if (updates.premium !== undefined && typeof updates.premium !== "boolean") {
      return next(new ErrorHandler("Premium must be a boolean", 400));
    }
    if (
      updates.availableOffline !== undefined &&
      typeof updates.availableOffline !== "boolean"
    ) {
      return next(new ErrorHandler("AvailableOffline must be a boolean", 400));
    }

    // Check for duplicate chapterNumber
    if (
      updates.chapterNumber &&
      updates.chapterNumber !== chapter.chapterNumber
    ) {
      const existingChapter = await Chapter.findOne({
        comic: chapter.comic,
        chapterNumber: updates.chapterNumber,
        _id: { $ne: chapterId }, // Exclude the current chapter
      });
      if (existingChapter) {
        return next(
          new ErrorHandler("Chapter number already exists for this comic", 400)
        );
      }
    }

    // Update the chapter
    const chapterUpdate = await Chapter.findByIdAndUpdate(chapterId, updates, {
      new: true,
      runValidators: true, // Ensure schema validators run on update
    });

    res.status(200).json({
      success: true,
      message: "Chapter updated successfully",
      data: chapterUpdate,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return next(new ErrorHandler("Invalid Chapter ID", 400));
    }
    if (error.code === 11000) {
      return next(
        new ErrorHandler("Chapter number already exists for this comic", 400)
      );
    }
    return next(
      new ErrorHandler(`Failed to update chapter: ${error.message}`, 500)
    );
  }
};

//delete chapter
const deleteChapter = async (req, res, next) => {
  try {
    const chapterId = req.params.id;

    // Validate chapterId
    if (!mongoose.Types.ObjectId.isValid(chapterId)) {
      return next(new ErrorHandler("Invalid Chapter ID", 400));
    }

    // Check if chapter exists
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return next(new ErrorHandler("Chapter not found", 404));
    }

    // Delete the chapter
    await Chapter.findByIdAndDelete(chapterId);

    // Remove the chapter from the comic's chapters array
    const comic = await Comic.findById(chapter.comic);
    if (comic) {
      comic.chapters = comic.chapters.filter(
        (id) => id.toString() !== chapterId
      );
      await comic.save();
    }

    res.status(200).json({
      success: true,
      message: "Chapter deleted successfully",
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
};

export { addChapter, getChapterPdf, editChapter, deleteChapter };
