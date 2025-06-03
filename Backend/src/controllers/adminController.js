import User from "../models/userModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import mongoose from "mongoose";

const getUsers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      role,
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
    const validSortFields = ["createdAt", "firstName"];
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

    // Build query
    const query = {};
    if (role && ["user", "admin"].includes(role)) {
      query.role = role;
    }

    // Fetch users with pagination and sorting
    const users = await User.find(query)
      .select("-password -email -phone") // Exclude sensitive fields
      .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    // Get total count for pagination metadata
    const totalUsers = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: {
        users,
        pagination: {
          total: totalUsers,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(totalUsers / limitNum),
        },
      },
    });
  } catch (error) {
    return next(
      new ErrorHandler(`Failed to fetch users: ${error.message}`, 500)
    );
  }
};

const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ErrorHandler("Invalid User ID", 400));
    }

    // Restrict access: user can only fetch their own data, or admin can fetch any user
    if (req.user._id.toString() !== id && req.user.role !== "admin") {
      return next(new ErrorHandler("Access denied", 403));
    }

    const user = await User.findById(id).select("-password"); // Exclude password
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    // Conditionally exclude sensitive fields based on role
    const userResponse = user.toObject();
    if (req.user.role !== "admin") {
      delete userResponse.email;
      delete userResponse.phone;
      delete userResponse.subscription;
    }

    res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      data: userResponse,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return next(new ErrorHandler("Invalid User ID", 400));
    }
    return next(
      new ErrorHandler(`Failed to fetch user: ${error.message}`, 500)
    );
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ErrorHandler("Invalid User ID", 400));
    }

    // Restrict to admins only (handled by middleware)

    // Validate role
    if (!role || !["user", "admin"].includes(role)) {
      return next(new ErrorHandler("Role must be 'user' or 'admin'", 400));
    }

    // Prevent admin from demoting themselves
    if (id === req.user._id.toString() && role !== "admin") {
      return next(new ErrorHandler("Admins cannot demote themselves", 400));
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    ).select("-password -email -phone"); // Exclude sensitive fields
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "User role updated successfully",
      data: user,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return next(new ErrorHandler("Invalid User ID", 400));
    }
    return next(
      new ErrorHandler(`Failed to update user role: ${error.message}`, 500)
    );
  }
};

export { getUsers, getUserById, updateUserRole };
