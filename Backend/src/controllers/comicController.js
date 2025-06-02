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

const getComics = async (req, res, next) => {
  try {
    // Extract query parameters
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
    } = req.query;

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

    // Build the query
    let query = {};

    // Search by title, author, or description
    if (search) {
      const searchRegex = exactMatch === "true" ? `^${search}$` : search;
      const searchOptions = exactMatch === "true" ? "" : "i";
      query.$or = [
        { title: { $regex: searchRegex, $options: searchOptions } },
        { author: { $regex: searchRegex, $options: searchOptions } },
        { description: { $regex: searchRegex, $options: searchOptions } },
      ];
    }

    // Filter by genres
    if (genres) {
      const genreArray = genres
        .split(",")
        .map((genre) => genre.trim())
        .filter((genre) => genre);
      if (genreArray.length === 0) {
        return next(new ErrorHandler("Genres must be a non-empty string", 400));
      }
      query.genres = { $in: genreArray };
    }

    // Filter by premium
    if (premium !== undefined) {
      if (!["true", "false"].includes(premium)) {
        return next(new ErrorHandler("Premium must be 'true' or 'false'", 400));
      }
      query.premium = premium === "true";
    }

    // Filter by createdAfter date
    if (createdAfter) {
      const date = new Date(createdAfter);
      if (isNaN(date.getTime())) {
        return next(new ErrorHandler("Invalid createdAfter date format", 400));
      }
      query.createdAt = { $gte: date };
    }

    // Aggregate to calculate averageRating and likesCount
    let comicsWithRatings = await Comic.aggregate([
      // Match the base query
      { $match: query },
      // Lookup reviews
      {
        $lookup: {
          from: "reviews",
          localField: "reviews",
          foreignField: "_id",
          as: "reviewsData",
        },
      },
      // Add averageRating field
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
      // Filter by minRating
      ...(minRating
        ? [
            {
              $match: {
                averageRating: { $gte: parseFloat(minRating) },
              },
            },
          ]
        : []),
      // Filter by minLikes
      ...(minLikes
        ? [
            {
              $match: {
                likesCount: { $gte: parseInt(minLikes, 10) },
              },
            },
          ]
        : []),
      // Sort
      {
        $sort: {
          [sortBy === "averageRating"
            ? "averageRating"
            : sortBy === "likesCount"
            ? "likesCount"
            : sortBy]: sortOrder === "asc" ? 1 : -1,
        },
      },
      // Pagination
      { $skip: (pageNum - 1) * limitNum },
      { $limit: limitNum },
      // Project to exclude large fields
      {
        $project: {
          reviews: 0,
          reviewsData: 0,
          chapters: 0,
          likes: 0,
        },
      },
    ]);

    // Get total count for pagination metadata
    const totalComics = await Comic.aggregate([
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
        },
      },
      ...(minRating
        ? [
            {
              $match: {
                averageRating: { $gte: parseFloat(minRating) },
              },
            },
          ]
        : []),
      ...(minLikes
        ? [
            {
              $match: {
                likesCount: { $size: "$likes" },
              },
            },
          ]
        : []),
      { $count: "total" },
    ]);

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

const getComicById = async (req, res, next) => {
  try {
    const comicId = req.params.id;

    // Validate comicId
    if (!mongoose.Types.ObjectId.isValid(comicId)) {
      return next(new ErrorHandler("Invalid Comic ID", 400));
    }

    // Build the query
    let query = Comic.findById(comicId);

    // Selective population based on query parameters
    const { populate } = req.query;
    const populateFields = populate
      ? populate.split(",").map((field) => field.trim())
      : [];

    // Populate reviews if requested
    if (populateFields.includes("reviews")) {
      query = query.populate({
        path: "reviews",
        select: "user rating comment createdAt",
        populate: { path: "user", select: "firstName lastName avatar" },
      });
    }

    // Populate chapters if requested (exclude pdfUrl)
    if (populateFields.includes("chapters")) {
      query = query.populate({
        path: "chapters",
        select: "title chapterNumber premium availableOffline createdAt", // Exclude pdfUrl
        options: { sort: { chapterNumber: 1 } },
      });
    }

    // Populate likes if requested
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

    // Compute averageRating manually if needed
    const comicResponse = comic.toObject();
    comicResponse.averageRating = comic.averageRating || 0;

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

export { addComic, getComics, getComicById };
