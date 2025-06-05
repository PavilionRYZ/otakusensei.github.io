import mongoose from "mongoose";

const subscriptionPlanSchema = new mongoose.Schema(
  {
    planType: {
      type: String,
      enum: ["monthly", "quarterly", "yearly"],
      required: true,
      unique: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    durationDays: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { timestamps: true }
);

export default mongoose.model("SubscriptionPlan", subscriptionPlanSchema);
