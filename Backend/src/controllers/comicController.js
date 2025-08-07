import Comic from "../models/comicModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import mongoose from "mongoose";
import Review from "../models/reviewsModel.js";
import Chapter from "../models/chapterModel.js";
import User from "../models/userModel.js";

const addComic = async (req, res, next) => {
  try {
    const { title, author, description, genres, coverImage, premium } =
      req.body;
    const existingComic = await Comic.findOne({ title, author });
    if (existingComic) {
      return next(new ErrorHandler("Comic already exists", 400));
    }
    const comic = await Comic.create({
      title,
      author,
      description,
      genres,
      coverImage,
      premium,
    });

    res.status(201).json({
      success: true,
      message: "Comic added successfully",
      comic,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
};

const deleteComic = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ErrorHandler("Invalid comic ID", 400));
    }
    const comic = await Comic.findById(id);
    if (!comic) {
      return next(new ErrorHandler("Comic not found", 404));
    }

    await Review.deleteMany({ _id: { $in: comic.reviews } });
    await Chapter.deleteMany({ _id: { $in: comic.chapters } });
    await comic.deleteOne();
    res.status(200).json({
      success: true,
      message: "Comic deleted successfully",
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
};

const editComic = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ErrorHandler("Invalid comic ID", 400));
    }
    const comic = await Comic.findById(id);
    if (!comic) {
      return next(new ErrorHandler("Comic not found", 404));
    }
    const { title, author, description, genres, coverImage, premium } =
      req.body;

    const existingComic = await Comic.findOne({
      title,
      author,
      _id: { $ne: id },
    });
    if (existingComic) {
      return next(
        new ErrorHandler("Comic with this title and author already exists", 400)
      );
    }
    comic.title = title;
    comic.author = author;
    comic.description = description;
    comic.genres = genres;
    comic.coverImage = coverImage;
    comic.premium = premium;
    await comic.save();
    res.status(200).json({
      success: true,
      message: "Comic updated successfully",
      comic,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
};

const getComics = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      genres,
      premium,
      minRating,
      createdAfter,
      minLikes,
      exactMatch = "false",
      sortBy = "createdAt",
      sortOrder = "desc",
      matchAllGenres = "false",
    } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    if (isNaN(pageNum) || pageNum < 1) {
      return next(new ErrorHandler("Page must be a positive integer", 400));
    }
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return next(new ErrorHandler("Limit must be between 1 and 100", 400));
    }

    const validSortFields = [
      "createdAt",
      "title",
      "author",
      "averageRating",
      "likesCount",
    ];
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

    let query = {};

    if (search) {
      const searchRegex = exactMatch === "true" ? `^${search}$` : search;
      const searchOptions = exactMatch === "true" ? "" : "i";
      query.$or = [
        { title: { $regex: searchRegex, $options: searchOptions } },
        { author: { $regex: searchRegex, $options: searchOptions } },
        { description: { $regex: searchRegex, $options: searchOptions } },
      ];
    }

    if (genres) {
      const genreArray = genres
        .split(",")
        .map((genre) => genre.trim())
        .filter((genre) => genre);
      if (genreArray.length === 0) {
        return next(new ErrorHandler("Genres must be a non-empty string", 400));
      }
      query.genres =
        matchAllGenres === "true" ? { $all: genreArray } : { $in: genreArray };
    }

    if (premium !== undefined) {
      if (!["true", "false"].includes(premium)) {
        return next(new ErrorHandler("Premium must be 'true' or 'false'", 400));
      }
      query.premium = premium === "true";
    }

    if (createdAfter) {
      const date = new Date(createdAfter);
      if (isNaN(date.getTime())) {
        return next(new ErrorHandler("Invalid createdAfter date format", 400));
      }
      query.createdAt = { $gte: date };
    }

    let pipeline = [
      { $match: query },
      {
        $lookup: {
          from: "reviews",
          localField: "reviews",
          foreignField: "_id",
          as: "reviewsData",
        },
      },
      {
        $addFields: {
          averageRating: {
            $cond: {
              if: { $eq: [{ $size: "$reviewsData" }, 0] },
              then: 0,
              else: { $avg: "$reviewsData.rating" },
            },
          },
          likesCount: { $size: "$likes" },
        },
      },
    ];

    if (minRating) {
      pipeline.push({
        $match: { averageRating: { $gte: parseFloat(minRating) } },
      });
    }
    if (minLikes) {
      pipeline.push({
        $match: { likesCount: { $gte: parseInt(minLikes, 10) } },
      });
    }

    pipeline.push({
      $sort: {
        [sortBy === "averageRating"
          ? "averageRating"
          : sortBy === "likesCount"
          ? "likesCount"
          : sortBy]: sortOrder === "asc" ? 1 : -1,
      },
    });
    pipeline.push({ $skip: (pageNum - 1) * limitNum });
    pipeline.push({ $limit: limitNum });
    pipeline.push({
      $project: { reviews: 0, reviewsData: 0, chapters: 0, likes: 0 },
    });

    let comicsWithRatings = await Comic.aggregate(pipeline);

    const totalPipeline = [
      { $match: query },
      {
        $lookup: {
          from: "reviews",
          localField: "reviews",
          foreignField: "_id",
          as: "reviewsData",
        },
      },
      {
        $addFields: {
          averageRating: {
            $cond: {
              if: { $eq: [{ $size: "$reviewsData" }, 0] },
              then: 0,
              else: { $avg: "$reviewsData.rating" },
            },
          },
          likesCount: { $size: "$likes" },
        },
      },
    ];
    if (minRating) {
      totalPipeline.push({
        $match: { averageRating: { $gte: parseFloat(minRating) } },
      });
    }
    if (minLikes) {
      totalPipeline.push({
        $match: { likesCount: { $gte: parseInt(minLikes, 10) } },
      });
    }
    totalPipeline.push({ $count: "total" });

    const totalComics = await Comic.aggregate(totalPipeline);
    const total = totalComics.length > 0 ? totalComics[0].total : 0;

    res.status(200).json({
      success: true,
      message: "Comics retrieved successfully",
      data: {
        comics: comicsWithRatings,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    return next(
      new ErrorHandler(`Failed to fetch comics: ${error.message}`, 500)
    );
  }
};

const totalComics = async (req, res, next) => {
  try {
    const total = await Comic.countDocuments();
    res.status(200).json({
      success: true,
      message: "Total comics retrieved successfully",
      data: {
        total,
      },
    });
  } catch (error) {
    console.log(error);

    return next(
      new ErrorHandler(`Failed to fetch total comics: ${error.message}`, 500)
    );
  }
};

const getComicById = async (req, res, next) => {
  try {
    const comicId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(comicId)) {
      return next(new ErrorHandler("Invalid Comic ID", 400));
    }

    let query = Comic.findById(comicId);

    const { populate } = req.query;
    const populateFields = populate
      ? populate.split(",").map((field) => field.trim())
      : [];

    if (populateFields.includes("reviews")) {
      query = query.populate({
        path: "reviews",
        select: "user rating comment createdAt",
        populate: { path: "user", select: "firstName lastName avatar" },
      });
    }

    if (populateFields.includes("chapters")) {
      query = query.populate({
        path: "chapters",
        select: "title chapterNumber premium availableOffline createdAt",
        options: { sort: { chapterNumber: 1 } },
      });
    }

    if (populateFields.includes("likes")) {
      query = query.populate({
        path: "likes",
        select: "firstName lastName avatar",
      });
    }

    const comic = await query.exec();

    if (!comic) {
      return next(new ErrorHandler("Comic not found", 404));
    }

    // Compute averageRating using aggregation or populated reviews
    let averageRating = 0;
    if (populateFields.includes("reviews") && comic.reviews.length > 0) {
      averageRating =
        comic.reviews.reduce((sum, review) => sum + review.rating, 0) /
        comic.reviews.length;
    } else {
      const reviewAgg = await Review.aggregate([
        { $match: { _id: { $in: comic.reviews } } },
        { $group: { _id: null, avgRating: { $avg: "$rating" } } },
      ]);
      averageRating = reviewAgg.length > 0 ? reviewAgg[0].avgRating : 0;
    }

    const comicResponse = comic.toObject();
    comicResponse.averageRating = averageRating;

    res.status(200).json({
      success: true,
      message: "Comic retrieved successfully",
      data: comicResponse,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return next(new ErrorHandler("Invalid Comic ID", 400));
    }
    return next(
      new ErrorHandler(`Failed to fetch comic: ${error.message}`, 500)
    );
  }
};

const likeComic = async (req, res, next) => {
  try {
    const { id: comicId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(comicId)) {
      return next(new ErrorHandler("Invalid Comic ID", 400));
    }

    const comic = await Comic.findById(comicId);
    if (!comic) {
      return next(new ErrorHandler("Comic not found", 404));
    }

    const userExists = await User.findById(userId);
    if (!userExists) {
      return next(new ErrorHandler("User not found", 404));
    }

    const hasLiked = comic.likes.some((id) => id.equals(userId));

    if (hasLiked) {
      comic.likes = comic.likes.filter((id) => !id.equals(userId));
    } else {
      comic.likes.push(userId);
    }

    await comic.save();

    res.status(200).json({
      success: true,
      message: hasLiked
        ? "Comic unliked successfully"
        : "Comic liked successfully",
      data: {
        likesCount: comic.likes.length,
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

export {
  addComic,
  getComics,
  getComicById,
  likeComic,
  deleteComic,
  editComic,
  totalComics,
};
