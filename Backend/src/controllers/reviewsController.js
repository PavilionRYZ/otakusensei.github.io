import Reviews from "../models/reviewsModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import Comic from "../models/comicModel.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";

const createReview = async (req, res, next) => {
  try {
    const { id: comicId } = req.params;
    const { rating, comment } = req.body;

    // Validate comicId
    if (!mongoose.Types.ObjectId.isValid(comicId)) {
      return next(new ErrorHandler("Invalid Comic ID", 400));
    }

    // Check if comic exists
    const comic = await Comic.findById(comicId);
    if (!comic) {
      return next(new ErrorHandler("Comic not found", 404));
    }

    // Get user ID from authenticated user
    const userId = req.user._id;
    if (!userId) {
      return next(new ErrorHandler("User not authenticated", 401));
    }

    const userExists = await User.findById(userId);
    if (!userExists) {
      return next(new ErrorHandler("User not found", 404));
    }

    // Check for duplicate review
    const existingReview = await Reviews.findOne({
      user: userId,
      comic: comicId,
    });
    if (existingReview) {
      return next(
        new ErrorHandler("You have already reviewed this comic", 400)
      );
    }

    // Validate rating
    if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
      return next(
        new ErrorHandler("Rating must be a number between 1 and 5", 400)
      );
    }

    // Validate comment
    if (!comment || typeof comment !== "string" || comment.trim() === "") {
      return next(new ErrorHandler("Comment must be a non-empty string", 400));
    }

    // Create the review
    const review = await Reviews.create({
      user: userId,
      rating,
      comment: comment.trim(),
      comic: comicId,
    });

    // Add review to comic's reviews array
    comic.reviews.push(review._id);
    await comic.save();

    res.status(201).json({
      success: true,
      message: "Review created successfully",
      review,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const message = Object.values(error.errors)
        .map((err) => err.message)
        .join(", ");
      return next(new ErrorHandler(`Validation failed: ${message}`, 400));
    }
    if (error.name === "CastError") {
      return next(new ErrorHandler("Invalid ID format", 400));
    }
    return next(
      new ErrorHandler(`Failed to create review: ${error.message}`, 500)
    );
  }
};

const getAllReviews = async (req, res, next) => {
  try {
    const { id: comicId } = req.params;
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Validate comicId
    if (!mongoose.Types.ObjectId.isValid(comicId)) {
      return next(new ErrorHandler("Invalid Comic ID", 400));
    }

    // Check if comic exists
    const comic = await Comic.findById(comicId);
    if (!comic) {
      return next(new ErrorHandler("Comic not found", 404));
    }

    // Validate pagination parameters
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    if (isNaN(pageNum) || pageNum < 1) {
      return next(new ErrorHandler("Page must be a positive integer", 400));
    }
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return next(new ErrorHandler("Limit must be between 1 and 100", 400));
    }

    // Validate sort parameters
    const validSortFields = ["createdAt", "rating"];
    if (!validSortFields.includes(sortBy)) {
      return next(
        new ErrorHandler(
          `SortBy must be one of: ${validSortFields.join(", ")}`,
          400
        )
      );
    }
    if (!["asc", "desc"].includes(sortOrder)) {
      return next(new ErrorHandler("SortOrder must be 'asc' or 'desc'", 400));
    }

    // Fetch reviews with pagination and sorting
    const reviews = await Reviews.find({ comic: comicId })
      .populate({
        path: "user",
        select: "firstName lastName avatar", // Exclude sensitive fields
      })
      .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    // Check if reviews exist
    if (reviews.length === 0) {
      return next(new ErrorHandler("No reviews found", 404));
    }

    // Get total count for pagination metadata
    const totalReviews = await Reviews.countDocuments({ comic: comicId });

    res.status(200).json({
      success: true,
      message: "Reviews retrieved successfully",
      data: {
        reviews,
        pagination: {
          total: totalReviews,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(totalReviews / limitNum),
        },
      },
    });
  } catch (error) {
    if (error.name === "CastError") {
      return next(new ErrorHandler("Invalid ID format", 400));
    }
    return next(
      new ErrorHandler(`Failed to fetch reviews: ${error.message}`, 500)
    );
  }
};

const likeReview = async (req, res, next) => {
  try {
    const { id: reviewId } = req.params;
    const userId = req.user._id;

    // Validate reviewId
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return next(new ErrorHandler("Invalid Review ID", 400));
    }

    // Check if review exists
    const review = await Reviews.findById(reviewId);
    if (!review) {
      return next(new ErrorHandler("Review not found", 404));
    }

    // Check if user exists (optional, since req.user should be valid)
    const userExists = await User.findById(userId);
    if (!userExists) {
      return next(new ErrorHandler("User not found", 404));
    }

    // Prevent users from liking their own review
    if (review.user.toString() === userId.toString()) {
      return next(new ErrorHandler("You cannot like your own review", 400));
    }

    // Check if user has already liked the review
    const hasLiked = review.likes.includes(userId);

    if (hasLiked) {
      // Unlike: Remove userId from likes
      review.likes = review.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      // Like: Add userId to likes
      review.likes.push(userId);
    }

    await review.save();

    res.status(200).json({
      success: true,
      message: hasLiked
        ? "Review unliked successfully"
        : "Review liked successfully",
      data: {
        likesCount: review.likes.length,
        hasLiked: !hasLiked,
      },
    });
  } catch (error) {
    if (error.name === "CastError") {
      return next(new ErrorHandler("Invalid ID format", 400));
    }
    return next(
      new ErrorHandler(`Failed to toggle like: ${error.message}`, 500)
    );
  }
};

export { createReview, getAllReviews, likeReview };
