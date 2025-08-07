import Stripe from "stripe";
import User from "../models/userModel.js";
import SubscriptionPlan from "../models/subscriptionPlanModel.js";
import Payment from "../models/paymentModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import { sendSubscriptionConfirmationEmail } from "../config/mailer.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Initiate payment for a subscription plan
const initiatePayment = async (req, res, next) => {
  try {
    const { planType } = req.body;
    const userId = req.user.id;

    if (!planType || !["monthly", "quarterly", "yearly"].includes(planType)) {
      return next(new ErrorHandler("Invalid plan type", 400));
    }

    // Check if user has any pending payments
    const pendingPayment = await Payment.findOne({
      user: userId,
      status: "pending",
    });
    if (pendingPayment) {
      return next(
        new ErrorHandler(
          "You have a pending payment. Please complete or cancel it before initiating a new payment.",
          400
        )
      );
    }

    // Check if user already has an active premium subscription
    const user = await User.findById(userId);
    if (user.hasActivePremiumSubscription()) {
      return next(
        new ErrorHandler(
          "You already have an active premium subscription. You cannot purchase another until it expires.",
          400
        )
      );
    }

    // Fetch plan pricing
    const plan = await SubscriptionPlan.findOne({ planType });
    if (!plan) {
      return next(new ErrorHandler(`Plan ${planType} not found`, 404));
    }

    // Create a Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: plan.price * 100, // Amount in cents
      currency: "usd",
      metadata: { userId: userId.toString(), planType },
      description: `Payment for ${planType} subscription`,
    });

    // Save payment record
    const payment = await Payment.create({
      user: userId,
      planType,
      amount: plan.price,
      paymentId: paymentIntent.id,
      status: "pending",
    });

    res.status(200).json({
      success: true,
      message: "Payment initiated successfully",
      clientSecret: paymentIntent.client_secret,
      paymentId: payment._id,
    });
  } catch (error) {
    return next(
      new ErrorHandler(`Failed to initiate payment: ${error.message}`, 500)
    );
  }
};

// Verify payment and update subscription
const verifyPayment = async (req, res, next) => {
  try {
    const { paymentId } = req.body;
    const userId = req.user.id;

    if (!paymentId) {
      return next(new ErrorHandler("Payment ID is required", 400));
    }

    // Fetch payment record
    const payment = await Payment.findById(paymentId);
    if (!payment || payment.user.toString() !== userId) {
      return next(new ErrorHandler("Payment not found or unauthorized", 404));
    }

    if (payment.status !== "pending") {
      return next(new ErrorHandler("Payment already processed", 400));
    }

    // Fetch Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(
      payment.paymentId
    );
    if (paymentIntent.status !== "succeeded") {
      payment.status = "failed";
      await payment.save();
      return next(new ErrorHandler("Payment verification failed", 400));
    }

    // Update payment status
    payment.status = "success";
    await payment.save();

    // Update user subscription
    const user = await User.findById(userId);
    const plan = await SubscriptionPlan.findOne({ planType: payment.planType });

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + plan.durationDays);

    user.subscription = {
      plan: "premium",
      startDate,
      endDate,
      reminderSent: false,
    };
    await user.save();

    // Send confirmation email
    await sendSubscriptionConfirmationEmail(
      user.email,
      payment.planType,
      startDate,
      endDate
    );

    res.status(200).json({
      success: true,
      message: "Payment verified successfully. You are now a premium user!",
    });
  } catch (error) {
    return next(
      new ErrorHandler(`Failed to verify payment: ${error.message}`, 500)
    );
  }
};

// Admin: Set or update subscription plan pricing
const setSubscriptionPlan = async (req, res, next) => {
  try {
    const { planType, price, durationDays } = req.body;

    if (!planType || !["monthly", "quarterly", "yearly"].includes(planType)) {
      return next(new ErrorHandler("Invalid plan type", 400));
    }
    if (!price || price < 0) {
      return next(new ErrorHandler("Price must be a positive number", 400));
    }
    if (!durationDays || durationDays < 1) {
      return next(new ErrorHandler("Duration must be at least 1 day", 400));
    }

    const plan = await SubscriptionPlan.findOneAndUpdate(
      { planType },
      { price, durationDays },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: `Plan ${planType} updated successfully`,
      data: plan,
    });
  } catch (error) {
    return next(new ErrorHandler(`Failed to set plan: ${error.message}`, 500));
  }
};

// Get all subscription plans (for users to see pricing)
const getSubscriptionPlans = async (req, res, next) => {
  try {
    const plans = await SubscriptionPlan.find();
    res.status(200).json({
      success: true,
      message: "Subscription plans retrieved successfully",
      data: plans,
    });
  } catch (error) {
    return next(
      new ErrorHandler(`Failed to fetch plans: ${error.message}`, 500)
    );
  }
};

const premiumUsers = async (req, res, next) => {
  try {
    const totalPremiumUsers = await User.countDocuments({
      "subscription.plan": "premium",
    });
    res.status(200).json({
      success: true,
      message: "Total number of premium users retrieved successfully",
      data: totalPremiumUsers,
    });
  } catch (error) {
    return next(
      new ErrorHandler(
        `Failed to fetch total number of users with subscription: ${error.message}`,
        500
      )
    );
  }
};
export {
  initiatePayment,
  verifyPayment,
  setSubscriptionPlan,
  getSubscriptionPlans,
  premiumUsers,
};
