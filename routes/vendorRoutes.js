const express = require("express");
const router = express.Router();

// Import vendor registration controllers
const {
  sendOtp,
  signupVendor,
} = require("../controllers/pendingVendor/pendingVendors");

// Import vendor management controllers
const {
  getAllVendors,
  getVendor,
  updateVendor,
  deleteVendor,
  updateSubscription,
  approveVendor,
  toggleLockVendor,
  searchVendors,
  createVendor ,
  getVendorAnalytics,
} = require("../controllers/Vendors/vendorsController");

// Import auth middleware
const { protectSuperAdmin } = require("../middlewares/auth");

// ===== PUBLIC ROUTES (No Authentication) =====

// @desc    Search vendors (public access for customers)
// @route   GET /api/vendor/search?q=keyword&category=id&limit=10&includeStats=false
// @access  Public
router.get("/search", searchVendors);

// ===== VENDOR REGISTRATION ROUTES (Public) =====

// @desc    Send OTP to vendor email for registration
// @route   POST /api/vendor/send-otp
// @access  Public
router.post("/send-otp", sendOtp);

// @desc    Complete vendor signup with OTP verification
// @route   POST /api/vendor/signup
// @access  Public
router.post("/signup", signupVendor);

// ===== ADMIN VENDOR MANAGEMENT ROUTES (Private - Admin Only) =====

// @desc    Get comprehensive vendor analytics for admin dashboard
// @route   GET /api/vendor/admin/analytics?days=30
// @access  Private (Admin)
router.get("/admin/analytics", protectSuperAdmin, getVendorAnalytics);

// @desc    Get all vendors with advanced filters and pagination
// @route   GET /api/vendor/admin/all?page=1&limit=20&isApproved=true&isLocked=false&isActive=true&category=id&search=keyword&sortBy=createdAt&sortOrder=desc&subscriptionStatus=active
// @access  Private (Admin)
router.get("/admin/all", protectSuperAdmin, getAllVendors);

// @desc    Get single vendor details with comprehensive stats
// @route   GET /api/vendor/admin/:vendorId
// @access  Private (Admin)
router.get("/admin/:vendorId", protectSuperAdmin, getVendor);

// @desc    Update vendor details (admin override)
// @route   PUT /api/vendor/admin/:vendorId
// @access  Private (Admin)
router.put("/admin/:vendorId", protectSuperAdmin, updateVendor);

// @desc    Delete vendor and all associated data (products, images, etc.)
// @route   DELETE /api/vendor/admin/:vendorId
// @access  Private (Admin)
router.delete("/admin/:vendorId", protectSuperAdmin, deleteVendor);

// @desc    Update vendor subscription (extend, change plan, etc.)
// @route   PATCH /api/vendor/admin/:vendorId/subscription
// @access  Private (Admin)
// @body    { duration: number, maxProductLimit: number, startDate: string }
router.patch(
  "/admin/:vendorId/subscription",
  protectSuperAdmin,
  updateSubscription
);

// @desc    Approve or reject vendor manually
// @route   PATCH /api/vendor/admin/:vendorId/approve
// @access  Private (Admin)
// @body    { isApproved: boolean, reason: string }
router.patch("/admin/:vendorId/approve", protectSuperAdmin, approveVendor);

// @desc    Toggle vendor lock status (lock/unlock)
// @route   PATCH /api/vendor/admin/:vendorId/toggle-lock
// @access  Private (Admin)
// @body    { reason: string, force: boolean }
router.patch(
  "/admin/:vendorId/toggle-lock",
  protectSuperAdmin,
  toggleLockVendor
);

// ===== BULK OPERATIONS (Admin) =====

// @desc    Bulk approve/reject multiple vendors
// @route   PATCH /api/vendor/admin/bulk-approve
// @access  Private (Admin)
router.patch(
  "/admin/bulk-approve",
  protectSuperAdmin,
  async (req, res, next) => {
    try {
      const { vendorIds, isApproved, reason } = req.body;

      if (!Array.isArray(vendorIds) || vendorIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Vendor IDs array is required",
        });
      }

      if (typeof isApproved !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "Please specify approval status (true/false)",
        });
      }

      const updateData = {
        isApproved,
        approvedBy: isApproved ? req.user.id : null,
        approvedAt: isApproved ? new Date() : null,
      };

      if (!isApproved && reason) {
        updateData.rejectionReason = reason.trim();
      }

      const result = await require("../../models/vendor").updateMany(
        { _id: { $in: vendorIds } },
        { $set: updateData }
      );

      const action = isApproved ? "approved" : "rejected";
      console.log(
        `📋 Bulk ${action} ${result.modifiedCount} vendors by ${req.user.email}`
      );

      res.status(200).json({
        success: true,
        message: `${result.modifiedCount} vendors ${action} successfully`,
        data: {
          matched: result.matchedCount,
          modified: result.modifiedCount,
          action: action,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// @desc    Bulk update subscription for multiple vendors
// @route   PATCH /api/vendor/admin/bulk-subscription
// @access  Private (Admin)
router.patch(
  "/admin/bulk-subscription",
  protectSuperAdmin,
  async (req, res, next) => {
    try {
      const { vendorIds, duration, maxProductLimit } = req.body;

      if (!Array.isArray(vendorIds) || vendorIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Vendor IDs array is required",
        });
      }

      if (!duration || ![1, 3, 6, 12].includes(Number(duration))) {
        return res.status(400).json({
          success: false,
          message: "Subscription duration must be 1, 3, 6, or 12 months",
        });
      }

      const Vendor = require("../../models/vendor");
      const vendors = await Vendor.find({ _id: { $in: vendorIds } });

      const updatePromises = vendors.map(async (vendor) => {
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + Number(duration));

        const planMap = {
          1: "basic_1m",
          3: "standard_3m",
          6: "premium_6m",
          12: "enterprise_12m",
        };

        const updates = {
          "subscription.duration": Number(duration),
          "subscription.startDate": startDate,
          "subscription.endDate": endDate,
          "subscription.currentPlan": planMap[duration],
          "subscription.lastPurchaseDate": new Date(),
          $inc: { "subscription.totalPurchases": 1 },
        };

        if (maxProductLimit !== undefined) {
          updates.maxProductLimit = maxProductLimit;
        }

        // Unlock if locked due to subscription expiry
        if (vendor.isLocked && vendor.lockReason === "subscription_expired") {
          updates.isLocked = false;
          updates.lockReason = null;
          updates.lockedAt = null;
        }

        return Vendor.updateOne({ _id: vendor._id }, updates);
      });

      const results = await Promise.all(updatePromises);
      const modifiedCount = results.reduce(
        (sum, result) => sum + result.modifiedCount,
        0
      );

      console.log(
        `📅 Bulk subscription update: ${modifiedCount} vendors by ${req.user.email}`
      );

      res.status(200).json({
        success: true,
        message: `${modifiedCount} vendor subscriptions updated successfully`,
        data: {
          processed: vendors.length,
          modified: modifiedCount,
          duration: duration,
          maxProductLimit: maxProductLimit,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// ===== SUBSCRIPTION MANAGEMENT ROUTES (Admin) =====
router.post("/admin/create-vendor", protectSuperAdmin,createVendor);
// @desc    Get subscription statistics
// @route   GET /api/vendor/admin/subscription-stats
// @access  Private (Admin)
router.get(
  "/admin/subscription-stats",
  protectSuperAdmin,
  async (req, res, next) => {
    try {
      const Vendor = require("../../models/vendor");
      const now = new Date();
      const sevenDaysFromNow = new Date(
        now.getTime() + 7 * 24 * 60 * 60 * 1000
      );

      const stats = await Vendor.aggregate([
        {
          $facet: {
            overview: [
              {
                $group: {
                  _id: null,
                  totalVendors: { $sum: 1 },
                  activeSubscriptions: {
                    $sum: {
                      $cond: [{ $gt: ["$subscription.endDate", now] }, 1, 0],
                    },
                  },
                  expiredSubscriptions: {
                    $sum: {
                      $cond: [{ $lt: ["$subscription.endDate", now] }, 1, 0],
                    },
                  },
                  expiringSoon: {
                    $sum: {
                      $cond: [
                        {
                          $and: [
                            { $gt: ["$subscription.endDate", now] },
                            {
                              $lt: ["$subscription.endDate", sevenDaysFromNow],
                            },
                          ],
                        },
                        1,
                        0,
                      ],
                    },
                  },
                  totalRevenue: { $sum: "$subscription.totalPurchases" },
                },
              },
            ],
            planBreakdown: [
              {
                $group: {
                  _id: "$subscription.currentPlan",
                  count: { $sum: 1 },
                  revenue: { $sum: "$subscription.totalPurchases" },
                },
              },
            ],
            expiringSoon: [
              {
                $match: {
                  "subscription.endDate": {
                    $gt: now,
                    $lt: sevenDaysFromNow,
                  },
                  isApproved: true,
                  isActive: true,
                },
              },
              {
                $project: {
                  companyName: 1,
                  email: 1,
                  "subscription.endDate": 1,
                  daysRemaining: {
                    $ceil: {
                      $divide: [
                        { $subtract: ["$subscription.endDate", now] },
                        86400000, // milliseconds in a day
                      ],
                    },
                  },
                },
              },
              {
                $sort: { "subscription.endDate": 1 },
              },
              {
                $limit: 20,
              },
            ],
          },
        },
      ]);

      res.status(200).json({
        success: true,
        data: {
          overview: stats[0].overview[0] || {},
          planBreakdown: stats[0].planBreakdown || [],
          expiringSoon: stats[0].expiringSoon || [],
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// ===== ERROR HANDLING =====

// 404 handler for unmatched vendor routes
// router.use("*", (req, res) => {
//   res.status(404).json({
//     success: false,
//     message: `Vendor route ${req.method} ${req.originalUrl} not found`,
//     availableRoutes: {
//       public: {
//         search: "GET /api/vendor/search",
//         sendOtp: "POST /api/vendor/send-otp",
//         signup: "POST /api/vendor/signup",
//       },
//       admin: {
//         analytics: "GET /api/vendor/admin/analytics",
//         allVendors: "GET /api/vendor/admin/all",
//         singleVendor: "GET /api/vendor/admin/:vendorId",
//         updateVendor: "PUT /api/vendor/admin/:vendorId",
//         deleteVendor: "DELETE /api/vendor/admin/:vendorId",
//         updateSubscription: "PATCH /api/vendor/admin/:vendorId/subscription",
//         approve: "PATCH /api/vendor/admin/:vendorId/approve",
//         toggleLock: "PATCH /api/vendor/admin/:vendorId/toggle-lock",
//         bulkApprove: "PATCH /api/vendor/admin/bulk-approve",
//         bulkSubscription: "PATCH /api/vendor/admin/bulk-subscription",
//         subscriptionStats: "GET /api/vendor/admin/subscription-stats",
//       },
//     },
//   });
// });

module.exports = router;
