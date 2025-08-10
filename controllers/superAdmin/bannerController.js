// controllers/superAdmin/bannerController.js
const Banner = require("../../models/bannerModel");
const Vendor = require("../../models/vendor");
const asyncHandler = require("../../utils/asyncHandler");
const ErrorResponse = require("../../utils/errorResponse");
const {
  uploadToCloudinary,
  deleteFromCloudinary,
  replaceOnCloudinary,
} = require("../../utils/cloudinary");

// @desc    Create new banner (Admin Only)
// @route   POST /api/banners/admin
// @access  Private/SuperAdmin
const createBanner = asyncHandler(async (req, res, next) => {
  const { title, vendorId, visibilityDays } = req.body;

  if (!title || !vendorId || !visibilityDays) {
    return next(
      new ErrorResponse(
        "Title, vendor ID and visibility days are required",
        400
      )
    );
  }

  if (!req.file) {
    return next(new ErrorResponse("Banner image is required", 400));
  }

  // Check if vendor exists
  const vendor = await Vendor.findById(vendorId);
  if (!vendor) {
    return next(new ErrorResponse("Vendor not found", 404));
  }

  try {
    // Upload image to Cloudinary
    const uploadResult = await uploadToCloudinary(req.file.path, "banners");

    // Create banner with explicit expiry date calculation
    const expiryDate = new Date(
      Date.now() + parseInt(visibilityDays) * 24 * 60 * 60 * 1000
    );

    const banner = await Banner.create({
      title,
      vendorId,
      imageUrl: uploadResult.url,
      publicId: uploadResult.public_id,
      visibilityDays: parseInt(visibilityDays),
      expiryDate: expiryDate, // Explicitly set expiry date
      createdBy: req.user.id,
    });

    // Populate vendor details
    await banner.populate("vendorId", "companyName email");

    console.log(`🎯 Banner created: ${title} for ${vendor.companyName}`);

    res.status(201).json({
      success: true,
      message: "Banner created successfully",
      data: {
        banner,
      },
    });
  } catch (error) {
    return next(
      new ErrorResponse(`Failed to create banner: ${error.message}`, 500)
    );
  }
});

// @desc    Get all banners (Admin Only)
// @route   GET /api/banners/admin/all
// @access  Private/SuperAdmin
const getAllBannersAdmin = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Build query
  const query = {};

  if (req.query.isVisible !== undefined) {
    query.isVisible = req.query.isVisible === "true";
  }

  if (req.query.vendorId) {
    query.vendorId = req.query.vendorId;
  }

  // Update expired banners first
  await Banner.updateExpiredBanners();

  const banners = await Banner.find(query)
    .populate("vendorId", "companyName email phone")
    .populate("createdBy", "username email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Banner.countDocuments(query);

  res.status(200).json({
    success: true,
    count: banners.length,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalBanners: total,
    },
    data: {
      banners,
    },
  });
});

// @desc    Get all visible banners (Public)
// @route   GET /api/banners
// @access  Public
const getVisibleBanners = asyncHandler(async (req, res, next) => {
  // Update expired banners first
  await Banner.updateExpiredBanners();

  const banners = await Banner.find({
    isVisible: true,
    expiryDate: { $gt: new Date() },
  })
    .populate("vendorId", "companyName")
    .select("title imageUrl vendorId createdAt expiryDate")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: banners.length,
    data: {
      banners,
    },
  });
});

// @desc    Get single banner (Admin Only)
// @route   GET /api/banners/admin/:id
// @access  Private/SuperAdmin
const getBanner = asyncHandler(async (req, res, next) => {
  const banner = await Banner.findById(req.params.id)
    .populate("vendorId", "companyName email phone")
    .populate("createdBy", "username email");

  if (!banner) {
    return next(new ErrorResponse("Banner not found", 404));
  }

  // Check expiry
  await banner.checkExpiry();

  res.status(200).json({
    success: true,
    data: {
      banner,
    },
  });
});

// @desc    Update banner (Admin Only)
// @route   PUT /api/banners/admin/:id
// @access  Private/SuperAdmin
const updateBanner = asyncHandler(async (req, res, next) => {
  let banner = await Banner.findById(req.params.id);

  if (!banner) {
    return next(new ErrorResponse("Banner not found", 404));
  }

  const { title, vendorId, visibilityDays, isVisible } = req.body;

  try {
    // Handle image update if new file is provided
    if (req.file) {
      const uploadResult = await replaceOnCloudinary(
        banner.publicId,
        req.file.path,
        "banners"
      );

      banner.imageUrl = uploadResult.url;
      banner.publicId = uploadResult.public_id;
    }

    // Update other fields
    if (title) banner.title = title;
    if (vendorId) {
      // Verify vendor exists
      const vendor = await Vendor.findById(vendorId);
      if (!vendor) {
        return next(new ErrorResponse("Vendor not found", 404));
      }
      banner.vendorId = vendorId;
    }
    if (visibilityDays) {
      banner.visibilityDays = parseInt(visibilityDays);
      // Expiry date will be recalculated by pre-save middleware
    }
    if (isVisible !== undefined) {
      banner.isVisible = isVisible;
    }

    await banner.save();
    await banner.populate("vendorId", "companyName email");

    console.log(`📝 Banner updated: ${banner.title}`);

    res.status(200).json({
      success: true,
      message: "Banner updated successfully",
      data: {
        banner,
      },
    });
  } catch (error) {
    return next(
      new ErrorResponse(`Failed to update banner: ${error.message}`, 500)
    );
  }
});

// @desc    Delete banner (Admin Only)
// @route   DELETE /api/banners/admin/:id
// @access  Private/SuperAdmin
const deleteBanner = asyncHandler(async (req, res, next) => {
  const banner = await Banner.findById(req.params.id);

  if (!banner) {
    return next(new ErrorResponse("Banner not found", 404));
  }

  try {
    // Delete image from Cloudinary
    await deleteFromCloudinary(banner.publicId);

    // Delete banner from database
    await Banner.findByIdAndDelete(req.params.id);

    console.log(`🗑️ Banner deleted: ${banner.title}`);

    res.status(200).json({
      success: true,
      message: "Banner deleted successfully",
    });
  } catch (error) {
    return next(
      new ErrorResponse(`Failed to delete banner: ${error.message}`, 500)
    );
  }
});

// @desc    Toggle banner visibility (Admin Only)
// @route   PATCH /api/banners/admin/:id/toggle
// @access  Private/SuperAdmin
const toggleBannerVisibility = asyncHandler(async (req, res, next) => {
  const banner = await Banner.findById(req.params.id);

  if (!banner) {
    return next(new ErrorResponse("Banner not found", 404));
  }

  banner.isVisible = !banner.isVisible;
  await banner.save();

  console.log(
    `🔄 Banner visibility toggled: ${banner.title} - ${
      banner.isVisible ? "Visible" : "Hidden"
    }`
  );

  res.status(200).json({
    success: true,
    message: `Banner ${banner.isVisible ? "enabled" : "disabled"} successfully`,
    data: {
      banner: {
        id: banner._id,
        title: banner.title,
        isVisible: banner.isVisible,
      },
    },
  });
});

// @desc    Get banner statistics (Admin Only)
// @route   GET /api/banners/admin/stats
// @access  Private/SuperAdmin
const getBannerStats = asyncHandler(async (req, res, next) => {
  // Update expired banners first
  await Banner.updateExpiredBanners();

  const stats = await Banner.aggregate([
    {
      $group: {
        _id: null,
        totalBanners: { $sum: 1 },
        visibleBanners: {
          $sum: { $cond: [{ $eq: ["$isVisible", true] }, 1, 0] },
        },
        expiredBanners: {
          $sum: { $cond: [{ $lt: ["$expiryDate", new Date()] }, 1, 0] },
        },
      },
    },
  ]);

  const result = stats[0] || {
    totalBanners: 0,
    visibleBanners: 0,
    expiredBanners: 0,
  };

  // Get banners expiring in next 3 days
  const soonToExpire = await Banner.countDocuments({
    isVisible: true,
    expiryDate: {
      $gte: new Date(),
      $lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
  });

  result.soonToExpire = soonToExpire;

  res.status(200).json({
    success: true,
    data: {
      stats: result,
    },
  });
});

module.exports = {
  createBanner,
  getAllBannersAdmin,
  getVisibleBanners,
  getBanner,
  updateBanner,
  deleteBanner,
  toggleBannerVisibility,
  getBannerStats,
};
