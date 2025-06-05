import cron from "node-cron";
import User from "../models/userModel.js";
import { sendSubscriptionReminderEmail } from "../config/mailer.js";

// Run every day at midnight
cron.schedule("0 0 * * *", async () => {
  try {
    console.log("Running subscription check cron job...");
    const now = new Date();
    const threeDaysFromNow = new Date(now);
    threeDaysFromNow.setDate(now.getDate() + 3);

    // Find users with active premium subscriptions
    const users = await User.find({
      "subscription.plan": "premium",
      "subscription.startDate": { $lte: now },
    });

    for (const user of users) {
      const endDate = user.subscription.endDate;

      // Check if subscription has expired
      if (endDate && endDate < now) {
        user.subscription.plan = "none";
        user.subscription.startDate = null;
        user.subscription.endDate = null;
        user.subscription.reminderSent = false;
        await user.save();
        console.log(`Downgraded user ${user.email} to normal user`);
        continue;
      }

      // Check if subscription is expiring in 3 days and reminder not sent
      if (
        endDate &&
        endDate <= threeDaysFromNow &&
        endDate > now &&
        !user.subscription.reminderSent
      ) {
        await sendSubscriptionReminderEmail(
          user.email,
          user.subscription.plan,
          endDate
        );
        user.subscription.reminderSent = true;
        await user.save();
        console.log(`Sent reminder email to ${user.email}`);
      }
    }
  } catch (error) {
    console.error("Error in subscription cron job:", error.message);
  }
});
