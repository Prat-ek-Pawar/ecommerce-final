// utils/bannerScheduler.js
const cron = require("node-cron");
const Banner = require("../models/bannerModel");

/**
 * Schedule automatic banner expiry check
 * Runs every hour to update expired banners
 */
const scheduleBannerExpiry = () => {
  // Run every hour at minute 0
  cron.schedule("0 * * * *", async () => {
    try {
      console.log("🔄 Checking for expired banners...");

      const result = await Banner.updateExpiredBanners();

      if (result.modifiedCount > 0) {
        console.log(
          `✅ Updated ${result.modifiedCount} expired banners to invisible`
        );
      } else {
        console.log("ℹ️ No expired banners found");
      }
    } catch (error) {
      console.error("❌ Banner expiry check failed:", error.message);
    }
  });

  // Run initial check on server startup
  setTimeout(async () => {
    try {
      console.log("🔄 Running initial banner expiry check...");
      await Banner.updateExpiredBanners();
      console.log("✅ Initial banner expiry check completed");
    } catch (error) {
      console.error("❌ Initial banner expiry check failed:", error.message);
    }
  }, 5000); // Wait 5 seconds after server starts

  console.log("📅 Banner expiry scheduler initialized - will run every hour");
};

/**
 * Get banners expiring soon (next 3 days)
 * Useful for notifications to admin
 */
const getBannersExpiringSoon = async (days = 3) => {
  try {
    const endDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    const banners = await Banner.find({
      isVisible: true,
      expiryDate: {
        $gte: new Date(),
        $lte: endDate,
      },
    })
      .populate("vendorId", "companyName email")
      .select("title vendorId expiryDate")
      .sort({ expiryDate: 1 });

    return banners;
  } catch (error) {
    console.error("❌ Failed to get expiring banners:", error.message);
    return [];
  }
};

/**
 * Manual function to check and update expired banners
 */
const checkExpiredBanners = async () => {
  try {
    console.log("🔄 Manual check for expired banners...");

    const result = await Banner.updateExpiredBanners();
    const expiringSoon = await getBannersExpiringSoon();

    return {
      updatedCount: result.modifiedCount,
      expiringSoon: expiringSoon.length,
      expiringSoonList: expiringSoon,
    };
  } catch (error) {
    console.error("❌ Manual banner check failed:", error.message);
    throw error;
  }
};

module.exports = {
  scheduleBannerExpiry,
  getBannersExpiringSoon,
  checkExpiredBanners,
};
