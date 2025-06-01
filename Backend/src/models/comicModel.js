import mongoose from "mongoose";

const comicSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 1000,
    },
    coverImage: {
      type: String,
      required: true,
      trim: true,
    },
    genres: [
      {
        type: String,
        required: true,
        trim: true,
        enum: [
          "Action",
          "Adventure",
          "Comedy",
          "Drama",
          "Fantasy",
          "Horror",
          "Mystery",
          "Romance",
          "Sci-Fi",
          "Slice of Life",
          "Thriller",
        ],
      },
    ],
    author: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    premium: {
      type: Boolean,
      default: false,
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    chapters: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chapter",
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

// Virtual for average rating
comicSchema.virtual("averageRating").get(function () {
  if (this.reviews.length === 0) return 0;
  return (
    this.reviews.reduce((sum, review) => sum + review.rating, 0) /
    this.reviews.length
  );
});

// Indexes for performance
comicSchema.index({ genres: 1, title: 1 });

export default mongoose.model("Comic", comicSchema);
