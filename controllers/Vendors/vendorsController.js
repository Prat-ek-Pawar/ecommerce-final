const Vendor = require("../../models/vendor");
const Product = require("../../models/products");
const asyncHandler = require("../../utils/asyncHandler");
const ErrorResponse = require("../../utils/errorResponse");
const {
  deleteFromCloudinary,
  deleteMultipleFromCloudinary,
} = require("../../utils/cloudinary");
const mongoose = require("mongoose");

// @desc    Get all vendors with filters (Admin)
// @route   GET /api/vendor/admin/all
// @access  Private (Admin)
const getAllVendors = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    isApproved,
    isLocked,
    isActive,
    category,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
    subscriptionStatus,
  } = req.query;

  const skip = (page - 1) * limit;
  const query = {};

  // Filter options
  if (isApproved !== undefined) query.isApproved = isApproved === "true";
  if (isLocked !== undefined) query.isLocked = isLocked === "true";
  if (isActive !== undefined) query.isActive = isActive === "true";
  if (category && mongoose.Types.ObjectId.isValid(category)) {
    query.productCategory = category;
  }

  // Subscription status filter
  const now = new Date();
  if (subscriptionStatus) {
    switch (subscriptionStatus) {
      case "active":
        query["subscription.endDate"] = { $gt: now };
        break;
      case "expired":
        query["subscription.endDate"] = { $lt: now };
        break;
      case "expiring_soon":
        const sevenDaysFromNow = new Date(
          now.getTime() + 7 * 24 * 60 * 60 * 1000
        );
        query["subscription.endDate"] = { $gt: now, $lt: sevenDaysFromNow };
        break;
    }
  }

  // Search functionality
  if (search) {
    query.$or = [
      { companyName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

  const vendors = await Vendor.find(query)
    .populate("productCategory", "name description")
    .populate("approvedBy", "username email")
    .select("-password")
    .skip(Number(skip))
    .limit(Number(limit))
    .sort(sortOptions)
    .lean();

  const total = await Vendor.countDocuments(query);

  // Get additional stats for each vendor
  const vendorsWithStats = await Promise.all(
    vendors.map(async (vendor) => {
      const [productCount, approvedProducts, totalViews] = await Promise.all([
        Product.countDocuments({ vendor: vendor._id }),
        Product.countDocuments({ vendor: vendor._id, isApproved: true }),
        Product.aggregate([
          { $match: { vendor: vendor._id } },
          { $group: { _id: null, totalViews: { $sum: "$views" } } },
        ]).then((result) => result[0]?.totalViews || 0),
      ]);

      return {
        ...vendor,
        stats: {
          totalProducts: productCount,
          approvedProducts,
          pendingProducts: productCount - approvedProducts,
          totalViews,
          productLimit: {
            used: productCount,
            total: vendor.maxProductLimit,
            remaining: Math.max(0, vendor.maxProductLimit - productCount),
          },
        },
        subscriptionStatus: getSubscriptionStatus(vendor.subscription),
      };
    })
  );

  // Get summary statistics
  const summaryStats = await Vendor.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        approved: { $sum: { $cond: ["$isApproved", 1, 0] } },
        locked: { $sum: { $cond: ["$isLocked", 1, 0] } },
        active: { $sum: { $cond: ["$isActive", 1, 0] } },
        expiredSubscriptions: {
          $sum: {
            $cond: [{ $lt: ["$subscription.endDate", now] }, 1, 0],
          },
        },
      },
    },
  ]);

  const summary = summaryStats[0] || {
    total: 0,
    approved: 0,
    locked: 0,
    active: 0,
    expiredSubscriptions: 0,
  };

  res.status(200).json({
    success: true,
    data: vendorsWithStats,
    pagination: {
      current: Number(page),
      pages: Math.ceil(total / limit),
      total,
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
    summary,
  });
});

// @desc    Get single vendor details (Admin)
// @route   GET /api/vendor/admin/:vendorId
// @access  Private (Admin)
const getVendor = asyncHandler(async (req, res, next) => {
  const { vendorId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(vendorId)) {
    return next(new ErrorResponse("Invalid vendor ID", 400));
  }

  const vendor = await Vendor.findById(vendorId)
    .populate("productCategory", "name description")
    .populate("approvedBy", "username email")
    .select("-password");

  if (!vendor) {
    return next(new ErrorResponse("Vendor not found", 404));
  }

  // Get comprehensive vendor statistics
  const [
    totalProducts,
    approvedProducts,
    pendingProducts,
    rejectedProducts,
    totalViews,
    recentProducts,
  ] = await Promise.all([
    Product.countDocuments({ vendor: vendorId }),
    Product.countDocuments({ vendor: vendorId, isApproved: true }),
    Product.countDocuments({
      vendor: vendorId,
      isApproved: false,
      rejectionReason: { $exists: false },
    }),
    Product.countDocuments({
      vendor: vendorId,
      isApproved: false,
      rejectionReason: { $exists: true, $ne: null },
    }),
    Product.aggregate([
      { $match: { vendor: new mongoose.Types.ObjectId(vendorId) } },
      { $group: { _id: null, totalViews: { $sum: "$views" } } },
    ]).then((result) => result[0]?.totalViews || 0),
    Product.find({ vendor: vendorId })
      .populate("category", "name")
      .select(
        "title slug images isApproved createdAt price views rejectionReason"
      )
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
  ]);

  const vendorData = {
    ...vendor.toObject(),
    stats: {
      products: {
        total: totalProducts,
        approved: approvedProducts,
        pending: pendingProducts,
        rejected: rejectedProducts,
      },
      totalViews,
      productLimit: {
        used: totalProducts,
        total: vendor.maxProductLimit,
        remaining: Math.max(0, vendor.maxProductLimit - totalProducts),
        percentage:
          vendor.maxProductLimit > 0
            ? Math.round((totalProducts / vendor.maxProductLimit) * 100)
            : 0,
      },
    },
    subscriptionInfo: {
      ...vendor.subscription,
      status: getSubscriptionStatus(vendor.subscription),
      daysRemaining: getDaysRemaining(vendor.subscription.endDate),
    },
    recentProducts,
  };

  res.status(200).json({
    success: true,
    data: vendorData,
  });
});

// @desc    Update vendor details (Admin)
// @route   PUT /api/vendor/admin/:vendorId
// @access  Private (Admin)
const updateVendor = asyncHandler(async (req, res, next) => {
  const { vendorId } = req.params;
  const allowedUpdates = [
    "companyName",
    "description",
    "phone",
    "address",
    "productCategory",
    "maxProductLimit",
    "isApproved",
    "isLocked",
    "isActive",
  ];

  if (!mongoose.Types.ObjectId.isValid(vendorId)) {
    return next(new ErrorResponse("Invalid vendor ID", 400));
  }

  const updates = {};
  Object.keys(req.body).forEach((key) => {
    if (allowedUpdates.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  // Validate updates
  if (updates.companyName && updates.companyName.length < 2) {
    return next(
      new ErrorResponse("Company name must be at least 2 characters long", 400)
    );
  }

  if (
    updates.maxProductLimit &&
    (updates.maxProductLimit < 1 || updates.maxProductLimit > 1000)
  ) {
    return next(
      new ErrorResponse("Product limit must be between 1 and 1000", 400)
    );
  }

  // If approving vendor, set approval data
  if (updates.isApproved === true) {
    updates.approvedBy = req.user.id;
    updates.approvedAt = new Date();
  } else if (updates.isApproved === false) {
    updates.approvedBy = null;
    updates.approvedAt = null;
  }

  // If unlocking vendor that was locked due to subscription expiry, check subscription
  if (updates.isLocked === false) {
    const vendor = await Vendor.findById(vendorId);
    if (vendor && vendor.lockReason === "subscription_expired") {
      const now = new Date();
      if (!vendor.subscription.endDate || now > vendor.subscription.endDate) {
        return next(
          new ErrorResponse(
            "Cannot unlock vendor with expired subscription",
            400
          )
        );
      }
    }
    updates.lockReason = null;
    updates.lockedAt = null;
  }

  const vendor = await Vendor.findByIdAndUpdate(vendorId, updates, {
    new: true,
    runValidators: true,
  })
    .populate("productCategory", "name description")
    .populate("approvedBy", "username email")
    .select("-password");

  if (!vendor) {
    return next(new ErrorResponse("Vendor not found", 404));
  }

  console.log(
    `📝 Admin updated vendor: ${vendor.companyName} by ${req.user.email}`
  );

  res.status(200).json({
    success: true,
    message: "Vendor updated successfully",
    data: vendor,
  });
});

// @desc    Delete vendor (Admin)
// @route   DELETE /api/vendor/admin/:vendorId
// @access  Private (Admin)
const deleteVendor = asyncHandler(async (req, res, next) => {
  const { vendorId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(vendorId)) {
    return next(new ErrorResponse("Invalid vendor ID", 400));
  }

  const vendor = await Vendor.findById(vendorId);
  if (!vendor) {
    return next(new ErrorResponse("Vendor not found", 404));
  }

  try {
    // Get all vendor's products
    const products = await Product.find({ vendor: vendorId });

    // Delete all product images from Cloudinary
    for (const product of products) {
      if (product.images && product.images.length > 0) {
        const publicIds = product.images
          .map((img) => img.public_id)
          .filter(Boolean);
        if (publicIds.length > 0) {
          try {
            await deleteMultipleFromCloudinary(publicIds);
            console.log(
              `🗑️ Deleted ${publicIds.length} images for product: ${product.title}`
            );
          } catch (error) {
            console.error(
              `⚠️ Failed to delete images for product ${product.title}:`,
              error.message
            );
          }
        }
      }
    }

    // Delete all products
    const deletedProducts = await Product.deleteMany({ vendor: vendorId });
    console.log(
      `🗑️ Deleted ${deletedProducts.deletedCount} products for vendor: ${vendor.companyName}`
    );

    // Delete vendor avatar from Cloudinary
    if (vendor.avatar && vendor.avatar.public_id) {
      try {
        await deleteFromCloudinary(vendor.avatar.public_id);
        console.log(`🗑️ Deleted avatar for vendor: ${vendor.companyName}`);
      } catch (error) {
        console.error(
          `⚠️ Failed to delete avatar for ${vendor.companyName}:`,
          error.message
        );
      }
    }

    // Delete the vendor
    await vendor.deleteOne();

    console.log(
      `❌ Admin deleted vendor: ${vendor.companyName} by ${req.user.email}`
    );

    res.status(200).json({
      success: true,
      message: "Vendor and all associated data deleted successfully",
      data: {
        deletedVendor: {
          id: vendorId,
          companyName: vendor.companyName,
          email: vendor.email,
        },
        deletedProducts: deletedProducts.deletedCount,
      },
    });
  } catch (error) {
    console.error("❌ Error deleting vendor:", error.message);
    return next(
      new ErrorResponse("Error deleting vendor and associated data", 500)
    );
  }
});

// @desc    Update vendor subscription (Admin)
// @route   PATCH /api/vendor/admin/:vendorId/subscription
// @access  Private (Admin)
const updateSubscription = asyncHandler(async (req, res, next) => {
  const { vendorId } = req.params;
  const { duration, maxProductLimit, startDate } = req.body;

  if (!mongoose.Types.ObjectId.isValid(vendorId)) {
    return next(new ErrorResponse("Invalid vendor ID", 400));
  }

  if (!duration || ![1, 3, 6, 12].includes(Number(duration))) {
    return next(
      new ErrorResponse(
        "Subscription duration must be 1, 3, 6, or 12 months",
        400
      )
    );
  }

  const vendor = await Vendor.findById(vendorId);
  if (!vendor) {
    return next(new ErrorResponse("Vendor not found", 404));
  }

  // Update subscription
  const subscriptionStartDate = startDate ? new Date(startDate) : new Date();
  vendor.subscription.duration = Number(duration);
  vendor.subscription.startDate = subscriptionStartDate;
  vendor.subscription.lastPurchaseDate = new Date();
  vendor.subscription.totalPurchases += 1;

  // Calculate end date
  const endDate = new Date(subscriptionStartDate);
  endDate.setMonth(endDate.getMonth() + Number(duration));
  vendor.subscription.endDate = endDate;

  // Update plan based on duration
  const planMap = {
    1: "basic_1m",
    3: "standard_3m",
    6: "premium_6m",
    12: "enterprise_12m",
  };
  vendor.subscription.currentPlan = planMap[duration] || "basic_1m";

  // Update product limit if provided
  if (maxProductLimit !== undefined) {
    if (maxProductLimit < 1 || maxProductLimit > 1000) {
      return next(
        new ErrorResponse("Product limit must be between 1 and 1000", 400)
      );
    }
    vendor.maxProductLimit = maxProductLimit;
  }

  // Unlock vendor if was locked due to subscription expiry
  if (vendor.isLocked && vendor.lockReason === "subscription_expired") {
    vendor.isLocked = false;
    vendor.lockReason = null;
    vendor.lockedAt = null;
  }

  await vendor.save();

  console.log(
    `📅 Subscription updated for ${vendor.companyName}: ${duration} months by ${req.user.email}`
  );

  res.status(200).json({
    success: true,
    message: "Subscription updated successfully",
    data: {
      subscription: {
        currentPlan: vendor.subscription.currentPlan,
        duration: vendor.subscription.duration,
        startDate: vendor.subscription.startDate,
        endDate: vendor.subscription.endDate,
        status: getSubscriptionStatus(vendor.subscription),
        daysRemaining: getDaysRemaining(vendor.subscription.endDate),
      },
      maxProductLimit: vendor.maxProductLimit,
      isLocked: vendor.isLocked,
    },
  });
});

// @desc    Approve/Reject vendor (Admin)
// @route   PATCH /api/vendor/admin/:vendorId/approve
// @access  Private (Admin)
const approveVendor = asyncHandler(async (req, res, next) => {
  const { vendorId } = req.params;
  const { isApproved = true, reason } = req.body;

  if (!mongoose.Types.ObjectId.isValid(vendorId)) {
    return next(new ErrorResponse("Invalid vendor ID", 400));
  }

  if (typeof isApproved !== "boolean") {
    return next(
      new ErrorResponse("Please specify approval status (true/false)", 400)
    );
  }

  const vendor = await Vendor.findById(vendorId);
  if (!vendor) {
    return next(new ErrorResponse("Vendor not found", 404));
  }

  const previousStatus = vendor.isApproved;
  vendor.isApproved = isApproved;

  if (isApproved) {
    vendor.approvedBy = req.user.id;
    vendor.approvedAt = new Date();
  } else {
    vendor.approvedBy = null;
    vendor.approvedAt = null;
    // Optionally store rejection reason
    if (reason) {
      vendor.rejectionReason = reason.trim();
    }
  }

  await vendor.save();
  await vendor.populate("approvedBy", "username email");

  const action = isApproved ? "approved" : "rejected";
  const statusChanged = previousStatus !== isApproved;

  console.log(
    `${isApproved ? "✅" : "❌"} Vendor ${action}: ${vendor.companyName} by ${
      req.user.email
    }`
  );

  res.status(200).json({
    success: true,
    message: `Vendor ${action} successfully`,
    data: {
      id: vendor._id,
      companyName: vendor.companyName,
      email: vendor.email,
      isApproved: vendor.isApproved,
      approvedAt: vendor.approvedAt,
      approvedBy: vendor.approvedBy,
      rejectionReason: vendor.rejectionReason,
      statusChanged,
    },
  });
});

// @desc    Toggle vendor lock status (Admin)
// @route   PATCH /api/vendor/admin/:vendorId/toggle-lock
// @access  Private (Admin)
const toggleLockVendor = asyncHandler(async (req, res, next) => {
  const { vendorId } = req.params;
  const { reason, force = false } = req.body;

  if (!mongoose.Types.ObjectId.isValid(vendorId)) {
    return next(new ErrorResponse("Invalid vendor ID", 400));
  }

  const vendor = await Vendor.findById(vendorId);
  if (!vendor) {
    return next(new ErrorResponse("Vendor not found", 404));
  }

  const wasLocked = vendor.isLocked;
  vendor.isLocked = !vendor.isLocked;

  if (vendor.isLocked) {
    // Locking the vendor
    vendor.lockedAt = new Date();
    vendor.lockReason = reason?.trim() || "Admin action";
  } else {
    // Unlocking the vendor
    // Check if vendor has valid subscription unless force unlock
    if (!force && vendor.lockReason === "subscription_expired") {
      const now = new Date();
      if (!vendor.subscription.endDate || now > vendor.subscription.endDate) {
        return next(
          new ErrorResponse(
            "Cannot unlock vendor with expired subscription. Use force=true to override or update subscription first.",
            400
          )
        );
      }
    }
    vendor.lockedAt = null;
    vendor.lockReason = null;
  }

  await vendor.save();

  const action = vendor.isLocked ? "locked" : "unlocked";
  console.log(
    `${vendor.isLocked ? "🔒" : "🔓"} Vendor ${action}: ${
      vendor.companyName
    } by ${req.user.email}`
  );

  res.status(200).json({
    success: true,
    message: `Vendor ${action} successfully`,
    data: {
      id: vendor._id,
      companyName: vendor.companyName,
      isLocked: vendor.isLocked,
      lockedAt: vendor.lockedAt,
      lockReason: vendor.lockReason,
      statusChanged: wasLocked !== vendor.isLocked,
    },
  });
});

// @desc    Search vendors (Public)
// @route   GET /api/vendor/search
// @access  Public
const searchVendors = asyncHandler(async (req, res) => {
  const { q, category, limit = 10, includeStats = false } = req.query;

  if (!q || q.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "Search query is required",
    });
  }

  const query = {
    isApproved: true,
    isActive: true,
    isLocked: false,
    $or: [
      { companyName: { $regex: q.trim(), $options: "i" } },
      { description: { $regex: q.trim(), $options: "i" } },
    ],
  };

  if (category && mongoose.Types.ObjectId.isValid(category)) {
    query.productCategory = category;
  }

  let vendorsQuery = Vendor.find(query)
    .select("companyName description avatar productCategory createdAt")
    .populate("productCategory", "name")
    .limit(Number(limit))
    .sort({ createdAt: -1 })
    .lean();

  const vendors = await vendorsQuery;

  // Optionally include basic stats
  let vendorsWithStats = vendors;
  if (includeStats === "true") {
    vendorsWithStats = await Promise.all(
      vendors.map(async (vendor) => {
        const [productCount, approvedProducts] = await Promise.all([
          Product.countDocuments({ vendor: vendor._id }),
          Product.countDocuments({ vendor: vendor._id, isApproved: true }),
        ]);

        return {
          ...vendor,
          stats: {
            totalProducts: productCount,
            approvedProducts,
          },
        };
      })
    );
  }

  res.status(200).json({
    success: true,
    count: vendorsWithStats.length,
    data: vendorsWithStats,
    query: q.trim(),
  });
});

// @desc    Get vendor analytics for admin
// @route   GET /api/vendor/admin/analytics
// @access  Private (Admin)
const getVendorAnalytics = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days));

  const analytics = await Vendor.aggregate([
    {
      $facet: {
        totalStats: [
          {
            $group: {
              _id: null,
              totalVendors: { $sum: 1 },
              approvedVendors: { $sum: { $cond: ["$isApproved", 1, 0] } },
              activeVendors: { $sum: { $cond: ["$isActive", 1, 0] } },
              lockedVendors: { $sum: { $cond: ["$isLocked", 1, 0] } },
              expiredSubscriptions: {
                $sum: {
                  $cond: [{ $lt: ["$subscription.endDate", new Date()] }, 1, 0],
                },
              },
            },
          },
        ],
        recentRegistrations: [
          {
            $match: {
              createdAt: { $gte: startDate },
            },
          },
          {
            $group: {
              _id: {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" },
                day: { $dayOfMonth: "$createdAt" },
              },
              count: { $sum: 1 },
            },
          },
          {
            $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
          },
        ],
        subscriptionBreakdown: [
          {
            $group: {
              _id: "$subscription.currentPlan",
              count: { $sum: 1 },
              totalRevenue: { $sum: "$subscription.totalPurchases" },
            },
          },
        ],
        topCategories: [
          {
            $match: { isApproved: true },
          },
          {
            $group: {
              _id: "$productCategory",
              vendorCount: { $sum: 1 },
            },
          },
          {
            $lookup: {
              from: "categories",
              localField: "_id",
              foreignField: "_id",
              as: "categoryInfo",
            },
          },
          {
            $unwind: "$categoryInfo",
          },
          {
            $project: {
              _id: 1,
              name: "$categoryInfo.name",
              vendorCount: 1,
            },
          },
          {
            $sort: { vendorCount: -1 },
          },
          {
            $limit: 10,
          },
        ],
      },
    },
  ]);

  const stats = analytics[0];

  res.status(200).json({
    success: true,
    data: {
      overview: stats.totalStats[0] || {},
      recentRegistrations: stats.recentRegistrations || [],
      subscriptionBreakdown: stats.subscriptionBreakdown || [],
      topCategories: stats.topCategories || [],
      period: `Last ${days} days`,
    },
  });
});

// Helper function to get subscription status
const getSubscriptionStatus = (subscription) => {
  if (!subscription.endDate) return "inactive";

  const now = new Date();
  const endDate = subscription.endDate;
  const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

  if (now > endDate) return "expired";
  if (daysRemaining <= 7) return "expiring_soon";
  return "active";
};

// Helper function to get days remaining
const getDaysRemaining = (endDate) => {
  if (!endDate) return 0;
  const now = new Date();
  return Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)));
};
const createVendor = asyncHandler(async (req, res) => {
  const {
    email,
    password,
    phone,
    companyName,
    address,
    description,
    productCategory,
    avatar,
    subscription,
  } = req.body;

  // Validate required fields manually (schema will also validate later)
  if (
    !email ||
    !password ||
    !companyName ||
    !productCategory ||
    !subscription?.duration
  ) {
    return res.status(400).json({
      message: "Missing required fields",
    });
  }

  // Check if vendor already exists
  const existingVendor = await Vendor.findOne({ email });
  if (existingVendor) {
    return res
      .status(400)
      .json({ message: "Vendor already registered with this email" });
  }

  // Validate password (double-check outside schema)
  const passwordErrors = Vendor.validatePassword(password);
  if (passwordErrors.length > 0) {
    return res.status(400).json({
      message: "Password validation failed",
      errors: passwordErrors,
    });
  }

  try {
    // Create vendor
    const vendor = await Vendor.create({
      email,
      password, // schema will hash it
      phone,
      companyName,
      address,
      description,
      productCategory,
      avatar,
      subscription, // includes: duration
    });

    // Remove password before sending response
    const vendorObj = vendor.toObject();
    delete vendorObj.password;

    res.status(201).json({
      message: "Vendor created successfully",
      vendor: vendorObj,
    });
  } catch (error) {
    console.error("Error creating vendor:", error);
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
});

module.exports = {
  getAllVendors,
  getVendor,
  updateVendor,
  deleteVendor,
  createVendor,
  updateSubscription,
  approveVendor,
  toggleLockVendor,
  searchVendors,
  getVendorAnalytics,
};
