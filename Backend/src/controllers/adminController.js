import User from "../models/userModel.js";
import ErrorHandler from "../utils/errorHandler.js";

const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }
    res.status(200).json(user);
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(id, { role }, { new: true });
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }
    res.status(200).json(user);
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
};


export { getUsers, getUserById, updateUserRole };
