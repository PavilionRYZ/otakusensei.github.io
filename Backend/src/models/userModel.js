import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      unique: true,
      sparse: true,
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
      required: false,
      minlength: 6,
      validate: {
        validator: function (value) {
          if (!value || value.startsWith("$2b$")) {
            return true;
          }
          return value.length <= 12;
        },
        message:
          "Password must be between 6 and 12 characters long before hashing",
      },
    },
    avatar: {
      type: String,
      default: "",
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
      reminderSent: {
        type: Boolean,
        default: false,
      },
    },
  },
  { timestamps: true }
);

// Check if the user has an active premium subscription
userSchema.methods.hasActivePremiumSubscription = function () {
  if (this.role === "admin") return true; // Admins always have access
  if (this.subscription.plan !== "premium") return false;
  const now = new Date();
  return (
    this.subscription.startDate <= now &&
    (!this.subscription.endDate || this.subscription.endDate >= now)
  );
};

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
