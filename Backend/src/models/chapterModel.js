import mongoose from "mongoose";

const chapterSchema = new mongoose.Schema(
  {
    comic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comic",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    chapterNumber: {
      type: Number,
      required: true,
    },
    pdfUrl:{
      type: String,
      required: true,
    },
    premium: {
      type: Boolean,
      default: false,
    },
    availableOffline: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

chapterSchema.index({ comic: 1, chapterNumber: 1 });

export default mongoose.model("Chapter", chapterSchema);
