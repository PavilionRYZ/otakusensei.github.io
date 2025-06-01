import Comic from "../models/comicModel.js";
import ErrorHandler from "../utils/errorHandler.js";

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

export { addComic };
