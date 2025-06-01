import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows null for non-Google users
    },
    provider: {
      type: String,
      enum: ["google", "local", "hybrid"],
      default: "local",
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
      required: false,
    },
    password: {
      type: String,
      required: false, // Optional for Google login
      minlength: 6,
      maxlength: 12,
    },
    avatar: {
      type: String,
      default: "",
    },
    premium: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    bookmarks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comic",
      },
    ],
    readingHistory: [
      {
        comic: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Comic",
        },
        chapter: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Chapter",
        },
        lastRead: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    subscription: {
      plan: {
        type: String,
        enum: ["basic", "premium", "none"],
        default: "none",
      },
      startDate: {
        type: Date,
      },
      endDate: {
        type: Date,
      },
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password") && this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) {
    throw new Error("Password not set for this user");
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", userSchema);