const Vendor = require("../../models/vendor");
const Product = require("../../models/products");
const asyncHandler = require("../../utils/asyncHandler");
const ErrorResponse = require("../../utils/errorResponse");
const {
  uploadToCloudinary,
  deleteFromCloudinary,
  replaceOnCloudinary,
} = require("../../utils/cloudinary");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

// @desc Get vendor's own profile
// @route GET /api/vendor/profile/me
// @access Private (Vendor)
const getMyProfile = asyncHandler(async (req, res, next) => {
  const vendor = await Vendor.findById(req.user.id)
    .populate("productCategory", "name description")
    .populate("approvedBy", "username email")
    .select("-password");

  if (!vendor) {
    return next(new ErrorResponse("Vendor not found", 404));
  }

  // Get vendor statistics
  const stats = await getVendorStats(vendor._id);

  const vendorWithStats = {
    ...vendor.toObject(),
    stats,
  };

  res.status(200).json({
    success: true,
    data: vendorWithStats,
  });
});

// @desc Update vendor profile
// @route PUT /api/vendor/profile/me
// @access Private (Vendor)
const updateMyProfile = asyncHandler(async (req, res, next) => {
  const allowedUpdates = ["companyName", "description", "phone", "address"];

  const updates = {};
  Object.keys(req.body).forEach((key) => {
    if (allowedUpdates.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  // Validate company name if being updated
  if (updates.companyName) {
    if (updates.companyName.length < 2) {
      return next(
        new ErrorResponse(
          "Company name must be at least 2 characters long",
          400
        )
      );
    }
    if (updates.companyName.length > 100) {
      return next(
        new ErrorResponse("Company name cannot exceed 100 characters", 400)
      );
    }
    updates.companyName = updates.companyName.trim();
  }

  // Validate description
  if (updates.description !== undefined) {
    if (updates.description && updates.description.length > 1000) {
      return next(
        new ErrorResponse("Description cannot exceed 1000 characters", 400)
      );
    }
    updates.description = updates.description?.trim() || "";
  }

  // Validate phone
  if (updates.phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(updates.phone.replace(/\s/g, ""))) {
      return next(
        new ErrorResponse("Please provide a valid phone number", 400)
      );
    }
    updates.phone = updates.phone.trim();
  }

  // Validate address if provided
  if (updates.address) {
    const { street, city, state, country, postalCode } = updates.address;
    const addressUpdates = {};

    if (street !== undefined) addressUpdates.street = street?.trim() || "";
    if (city !== undefined) addressUpdates.city = city?.trim() || "";
    if (state !== undefined) addressUpdates.state = state?.trim() || "";
    if (country !== undefined) addressUpdates.country = country?.trim() || "";
    if (postalCode !== undefined)
      addressUpdates.postalCode = postalCode?.trim() || "";

    updates.address = addressUpdates;
  }

  const vendor = await Vendor.findByIdAndUpdate(req.user.id, updates, {
    new: true,
    runValidators: true,
  })
    .select("-password")
    .populate("productCategory", "name description");

  if (!vendor) {
    return next(new ErrorResponse("Vendor not found", 404));
  }

  console.log(`📝 Profile updated: ${vendor.companyName} by ${req.user.email}`);

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: vendor,
  });
});

// @desc Update vendor password
// @route PUT /api/vendor/profile/password
// @access Private (Vendor)
const updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return next(
      new ErrorResponse(
        "Please provide current password, new password, and confirm password",
        400
      )
    );
  }

  if (newPassword !== confirmPassword) {
    return next(new ErrorResponse("New passwords do not match", 400));
  }

  // Validate new password strength
  const passwordErrors = Vendor.validatePassword(newPassword);
  if (passwordErrors.length > 0) {
    return next(
      new ErrorResponse(
        `Password validation failed: ${passwordErrors.join(", ")}`,
        400
      )
    );
  }

  // Get vendor with password
  const vendor = await Vendor.findById(req.user.id).select("+password");

  if (!vendor) {
    return next(new ErrorResponse("Vendor not found", 404));
  }

  // Check current password
  const isCurrentPasswordValid = await vendor.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    return next(new ErrorResponse("Current password is incorrect", 400));
  }

  // Update password
  vendor.password = newPassword; // Will be hashed by pre-save middleware
  await vendor.save();

  console.log(`🔐 Password updated for vendor: ${vendor.companyName}`);

  res.status(200).json({
    success: true,
    message: "Password updated successfully",
  });
});

// @desc Upload profile picture
// @route POST /api/vendor/profile/avatar
// @access Private (Vendor)
const uploadProfilePicture = asyncHandler(async (req, res, next) => {
  const vendor = await Vendor.findById(req.user.id);

  if (!vendor) {
    return next(new ErrorResponse("Vendor not found", 404));
  }

  if (!req.file) {
    return next(new ErrorResponse("Please upload an image file", 400));
  }

  try {
    let uploadResult;

    // If vendor already has an avatar, replace it
    if (vendor.avatar && vendor.avatar.public_id) {
      console.log(`🔄 Replacing existing avatar for ${vendor.companyName}`);
      uploadResult = await replaceOnCloudinary(
        vendor.avatar.public_id,
        req.file.path,
        "avatars"
      );
    } else {
      console.log(`📸 Uploading new avatar for ${vendor.companyName}`);
      uploadResult = await uploadToCloudinary(req.file.path, "avatars");
    }

    // Save new avatar info
    vendor.avatar = {
      url: uploadResult.url,
      public_id: uploadResult.public_id,
    };

    await vendor.save();

    console.log(`✅ Avatar updated for vendor: ${vendor.companyName}`);

    res.status(200).json({
      success: true,
      message: "Profile picture updated successfully",
      data: {
        avatar: vendor.avatar,
      },
    });
  } catch (error) {
    console.error("❌ Avatar upload error:", error.message);
    return next(new ErrorResponse("Error uploading profile picture", 500));
  }
});

// @desc Delete profile picture
// @route DELETE /api/vendor/profile/avatar
// @access Private (Vendor)
const deleteProfilePicture = asyncHandler(async (req, res, next) => {
  const vendor = await Vendor.findById(req.user.id);

  if (!vendor) {
    return next(new ErrorResponse("Vendor not found", 404));
  }

  if (!vendor.avatar || !vendor.avatar.public_id) {
    return next(new ErrorResponse("No profile picture to delete", 400));
  }

  try {
    // Delete from Cloudinary
    await deleteFromCloudinary(vendor.avatar.public_id);

    // Remove avatar from vendor record
    vendor.avatar = undefined;
    await vendor.save();

    console.log(`🗑️ Avatar deleted for vendor: ${vendor.companyName}`);

    res.status(200).json({
      success: true,
      message: "Profile picture deleted successfully",
    });
  } catch (error) {
    console.error("❌ Avatar deletion error:", error.message);
    return next(new ErrorResponse("Error deleting profile picture", 500));
  }
});

// @desc Get vendor dashboard stats
// @route GET /api/vendor/profile/dashboard
// @access Private (Vendor)
const getDashboard = asyncHandler(async (req, res, next) => {
  const vendorId = req.user.id;

  // Get vendor info
  const vendor = await Vendor.findById(vendorId)
    .populate("productCategory", "name description")
    .populate("approvedBy", "username")
    .select("-password");

  if (!vendor) {
    return next(new ErrorResponse("Vendor not found", 404));
  }

  // Get comprehensive stats
  const stats = await getVendorStats(vendorId);

  // Get recent products
  const recentProducts = await Product.find({ vendor: vendorId })
    .populate("category", "name")
    .select(
      "title slug images isApproved createdAt price views rejectionReason"
    )
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  // Get product status breakdown
  const productStatusBreakdown = await Product.aggregate([
    { $match: { vendor: new mongoose.Types.ObjectId(vendorId) } },
    {
      $group: {
        _id: {
          approved: "$isApproved",
          hasRejection: { $ne: ["$rejectionReason", null] },
        },
        count: { $sum: 1 },
        totalViews: { $sum: "$views" },
      },
    },
  ]);

  // Calculate subscription info
  const now = new Date();
  const subscriptionInfo = {
    isActive: vendor.subscription.endDate && vendor.subscription.endDate > now,
    daysRemaining: vendor.subscription.endDate
      ? Math.max(
          0,
          Math.ceil((vendor.subscription.endDate - now) / (1000 * 60 * 60 * 24))
        )
      : 0,
    endDate: vendor.subscription.endDate,
    startDate: vendor.subscription.startDate,
    currentPlan: vendor.subscription.currentPlan,
    duration: vendor.subscription.duration,
    isExpiringSoon: false,
    status: vendor.subscriptionStatus,
  };

  subscriptionInfo.isExpiringSoon =
    subscriptionInfo.daysRemaining <= 7 && subscriptionInfo.daysRemaining > 0;

  // Recent activity (simplified)
  const recentActivity = [
    {
      type: "login",
      description: "Last login",
      timestamp: vendor.lastLogin || vendor.updatedAt,
    },
    {
      type: "profile_update",
      description: "Profile last updated",
      timestamp: vendor.updatedAt,
    },
  ];

  res.status(200).json({
    success: true,
    data: {
      vendor: {
        id: vendor._id,
        companyName: vendor.companyName,
        email: vendor.email,
        phone: vendor.phone,
        description: vendor.description,
        productCategory: vendor.productCategory,
        avatar: vendor.avatar,
        address: vendor.address,
        isApproved: vendor.isApproved,
        isLocked: vendor.isLocked,
        maxProductLimit: vendor.maxProductLimit,
        createdAt: vendor.createdAt,
        approvedAt: vendor.approvedAt,
        approvedBy: vendor.approvedBy,
      },
      subscription: subscriptionInfo,
      stats,
      recentProducts,
      productStatusBreakdown,
      recentActivity,
    },
  });
});

// @desc Delete vendor account (soft delete)
// @route DELETE /api/vendor/profile/delete-account
// @access Private (Vendor)
const deleteAccount = asyncHandler(async (req, res, next) => {
  const { password, confirmDeletion } = req.body;

  if (!password || confirmDeletion !== "DELETE_MY_ACCOUNT") {
    return next(
      new ErrorResponse(
        "Please provide password and type 'DELETE_MY_ACCOUNT' to confirm",
        400
      )
    );
  }

  // Get vendor with password
  const vendor = await Vendor.findById(req.user.id).select("+password");

  if (!vendor) {
    return next(new ErrorResponse("Vendor not found", 404));
  }

  // Verify password
  const isPasswordValid = await vendor.comparePassword(password);
  if (!isPasswordValid) {
    return next(new ErrorResponse("Password is incorrect", 400));
  }

  try {
    // Get all vendor's products
    const products = await Product.find({ vendor: vendor._id });

    // Delete product images from Cloudinary
    const { deleteMultipleFromCloudinary } = require("../../utils/cloudinary");

    for (const product of products) {
      if (product.images && product.images.length > 0) {
        const publicIds = product.images
          .map((img) => img.public_id)
          .filter(Boolean);
        if (publicIds.length > 0) {
          try {
            await deleteMultipleFromCloudinary(publicIds);
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
    const deletedProducts = await Product.deleteMany({ vendor: vendor._id });
    console.log(
      `🗑️ Deleted ${deletedProducts.deletedCount} products for vendor ${vendor.companyName}`
    );

    // Delete vendor's avatar from Cloudinary
    if (vendor.avatar && vendor.avatar.public_id) {
      try {
        await deleteFromCloudinary(vendor.avatar.public_id);
      } catch (error) {
        console.error(
          `⚠️ Failed to delete avatar for ${vendor.companyName}:`,
          error.message
        );
      }
    }

    // Delete the vendor
    await Vendor.findByIdAndDelete(vendor._id);

    console.log(`❌ Account deleted: ${vendor.companyName} (${vendor.email})`);

    res.status(200).json({
      success: true,
      message: "Account deleted successfully. We're sorry to see you go!",
    });
  } catch (error) {
    console.error("❌ Account deletion error:", error.message);
    return next(
      new ErrorResponse("Error deleting account. Please try again.", 500)
    );
  }
});

// @desc Deactivate vendor account (temporary)
// @route PATCH /api/vendor/profile/deactivate
// @access Private (Vendor)
const deactivateAccount = asyncHandler(async (req, res, next) => {
  const { password, reason } = req.body;

  if (!password) {
    return next(new ErrorResponse("Please provide password to confirm", 400));
  }

  // Get vendor with password
  const vendor = await Vendor.findById(req.user.id).select("+password");

  if (!vendor) {
    return next(new ErrorResponse("Vendor not found", 404));
  }

  // Verify password
  const isPasswordValid = await vendor.comparePassword(password);
  if (!isPasswordValid) {
    return next(new ErrorResponse("Password is incorrect", 400));
  }

  // Deactivate account
  vendor.isActive = false;
  vendor.deactivatedAt = new Date();
  vendor.deactivationReason = reason?.trim() || "User requested";

  await vendor.save();

  console.log(
    `⏸️ Account deactivated: ${vendor.companyName} - Reason: ${vendor.deactivationReason}`
  );

  res.status(200).json({
    success: true,
    message:
      "Account deactivated successfully. You can reactivate anytime by logging in.",
  });
});

// @desc Change vendor email
// @route PUT /api/vendor/profile/email
// @access Private (Vendor)
const changeEmail = asyncHandler(async (req, res, next) => {
  const { newEmail, password } = req.body;

  if (!newEmail || !password) {
    return next(
      new ErrorResponse("Please provide new email and password", 400)
    );
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(newEmail)) {
    return next(new ErrorResponse("Please provide a valid email address", 400));
  }

  // Check if email already exists
  const existingVendor = await Vendor.findOne({
    email: newEmail.toLowerCase(),
    _id: { $ne: req.user.id }, // Exclude current vendor
  });

  if (existingVendor) {
    return next(new ErrorResponse("Email already in use", 409));
  }

  // Get vendor with password
  const vendor = await Vendor.findById(req.user.id).select("+password");

  if (!vendor) {
    return next(new ErrorResponse("Vendor not found", 404));
  }

  // Verify password
  const isPasswordValid = await vendor.comparePassword(password);
  if (!isPasswordValid) {
    return next(new ErrorResponse("Password is incorrect", 400));
  }

  const oldEmail = vendor.email;

  // Update email
  vendor.email = newEmail.toLowerCase();
  vendor.emailVerified = false; // Require re-verification
  await vendor.save();

  console.log(
    `📧 Email changed: ${vendor.companyName} from ${oldEmail} to ${vendor.email}`
  );

  res.status(200).json({
    success: true,
    message:
      "Email updated successfully. Please verify your new email address.",
    data: {
      newEmail: vendor.email,
      emailVerified: vendor.emailVerified,
    },
  });
});

// @desc Reactivate vendor account
// @route PATCH /api/vendor/profile/reactivate
// @access Private (Vendor)
const reactivateAccount = asyncHandler(async (req, res, next) => {
  const vendor = await Vendor.findById(req.user.id);

  if (!vendor) {
    return next(new ErrorResponse("Vendor not found", 404));
  }

  if (vendor.isActive) {
    return next(new ErrorResponse("Account is already active", 400));
  }

  // Reactivate account
  vendor.isActive = true;
  vendor.deactivatedAt = null;
  vendor.deactivationReason = null;

  await vendor.save();

  console.log(`▶️ Account reactivated: ${vendor.companyName}`);

  res.status(200).json({
    success: true,
    message: "Account reactivated successfully. Welcome back!",
    data: {
      isActive: vendor.isActive,
    },
  });
});

// Helper function to get vendor statistics
const getVendorStats = async (vendorId) => {
  try {
    const [
      totalProducts,
      approvedProducts,
      pendingProducts,
      rejectedProducts,
      totalViews,
      maxProductLimit,
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
      Vendor.findById(vendorId).then((v) => v?.maxProductLimit || 0),
    ]);

    return {
      products: {
        total: totalProducts,
        approved: approvedProducts,
        pending: pendingProducts,
        rejected: rejectedProducts,
      },
      totalViews,
      productLimit: {
        used: totalProducts,
        total: maxProductLimit,
        remaining: Math.max(0, maxProductLimit - totalProducts),
        percentage:
          maxProductLimit > 0
            ? Math.round((totalProducts / maxProductLimit) * 100)
            : 0,
      },
    };
  } catch (error) {
    console.error("❌ Error getting vendor stats:", error.message);
    return {
      products: { total: 0, approved: 0, pending: 0, rejected: 0 },
      totalViews: 0,
      productLimit: { used: 0, total: 0, remaining: 0, percentage: 0 },
    };
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  updatePassword,
  uploadProfilePicture,
  deleteProfilePicture,
  getDashboard,
  deleteAccount,
  deactivateAccount,
  changeEmail,
  reactivateAccount,
};
