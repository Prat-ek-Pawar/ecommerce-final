const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Import controllers
const {
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
} = require("../controllers/Vendors/vendorProfileController");

// Import middleware
const { protectVendor } = require("../middlewares/auth");

// Ensure upload directory exists
const uploadDir = "uploads/avatars/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for avatar uploads (temporary storage before Cloudinary)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with vendor ID and timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname).toLowerCase();
    cb(null, `temp_avatar_${req.user.id}_${uniqueSuffix}${fileExtension}`);
  },
});

const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedMimes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (JPEG, PNG, GIF, WebP)"), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1, // Only one file for avatar
  },
  fileFilter: fileFilter,
});

// Multer error handling middleware for avatar uploads
const handleAvatarUpload = (req, res, next) => {
  upload.single("avatar")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      let message = "Upload error";

      switch (err.code) {
        case "LIMIT_FILE_SIZE":
          message = "Avatar file too large. Maximum size is 5MB";
          break;
        case "LIMIT_UNEXPECTED_FILE":
          message = "Unexpected field name. Use 'avatar' as field name";
          break;
        default:
          message = `Upload error: ${err.message}`;
      }

      return res.status(400).json({
        success: false,
        message: message,
        code: err.code,
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }
    next();
  });
};

// Cleanup middleware for failed requests
const cleanupTempFile = (req, res, next) => {
  const originalSend = res.send;

  res.send = function (data) {
    // If request failed and we have a file, clean it up
    if (res.statusCode >= 400 && req.file && req.file.path) {
      if (fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
          console.log(`🧹 Cleaned up temp avatar file: ${req.file.path}`);
        } catch (error) {
          console.error(
            `❌ Failed to cleanup temp file: ${req.file.path}`,
            error.message
          );
        }
      }
    }

    originalSend.call(this, data);
  };

  next();
};

// Apply vendor protection to all routes
router.use(protectVendor);

// ===== PROFILE MANAGEMENT ROUTES =====

// @desc    Get vendor's own profile with stats
// @route   GET /api/vendor/profile/me
// @access  Private (Vendor)
router.get("/me", getMyProfile);

// @desc    Update vendor profile information
// @route   PUT /api/vendor/profile/me
// @access  Private (Vendor)
router.put("/me", updateMyProfile);

// @desc    Get comprehensive vendor dashboard
// @route   GET /api/vendor/profile/dashboard
// @access  Private (Vendor)
router.get("/dashboard", getDashboard);

// ===== SECURITY ROUTES =====

// @desc    Update password
// @route   PUT /api/vendor/profile/password
// @access  Private (Vendor)
router.put("/password", updatePassword);

// @desc    Change email address
// @route   PUT /api/vendor/profile/email
// @access  Private (Vendor)
router.put("/email", changeEmail);

// ===== AVATAR MANAGEMENT ROUTES =====

// @desc    Upload/update avatar (uploads to Cloudinary)
// @route   POST /api/vendor/profile/avatar
// @access  Private (Vendor)
router.post(
  "/avatar",
  cleanupTempFile,
  handleAvatarUpload,
  uploadProfilePicture
);

// @desc    Delete avatar (removes from Cloudinary)
// @route   DELETE /api/vendor/profile/avatar
// @access  Private (Vendor)
router.delete("/avatar", deleteProfilePicture);

// ===== ACCOUNT MANAGEMENT ROUTES =====

// @desc    Temporarily deactivate account
// @route   PATCH /api/vendor/profile/deactivate
// @access  Private (Vendor)
router.patch("/deactivate", deactivateAccount);

// @desc    Reactivate deactivated account
// @route   PATCH /api/vendor/profile/reactivate
// @access  Private (Vendor)
router.patch("/reactivate", reactivateAccount);

// @desc    Permanently delete account and all associated data
// @route   DELETE /api/vendor/profile/delete-account
// @access  Private (Vendor)
router.delete("/delete-account", deleteAccount);

// ===== ADDITIONAL UTILITY ROUTES =====

// @desc    Get vendor's subscription details
// @route   GET /api/vendor/profile/subscription
// @access  Private (Vendor)
router.get("/subscription", async (req, res, next) => {
  try {
    const vendor = await req.vendor;
    const now = new Date();

    const subscriptionInfo = {
      currentPlan: vendor.subscription.currentPlan,
      duration: vendor.subscription.duration,
      startDate: vendor.subscription.startDate,
      endDate: vendor.subscription.endDate,
      isActive:
        vendor.subscription.endDate && vendor.subscription.endDate > now,
      daysRemaining: vendor.subscription.endDate
        ? Math.max(
            0,
            Math.ceil(
              (vendor.subscription.endDate - now) / (1000 * 60 * 60 * 24)
            )
          )
        : 0,
      status: vendor.subscriptionStatus,
      totalPurchases: vendor.subscription.totalPurchases,
      lastPurchaseDate: vendor.subscription.lastPurchaseDate,
    };

    res.status(200).json({
      success: true,
      data: subscriptionInfo,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get vendor's account status
// @route   GET /api/vendor/profile/status
// @access  Private (Vendor)
router.get("/status", async (req, res, next) => {
  try {
    const vendor = req.vendor;

    const accountStatus = {
      isActive: vendor.isActive,
      isApproved: vendor.isApproved,
      isLocked: vendor.isLocked,
      emailVerified: vendor.emailVerified,
      subscriptionStatus: vendor.subscriptionStatus,
      createdAt: vendor.createdAt,
      approvedAt: vendor.approvedAt,
      lastLogin: vendor.lastLogin,
      deactivatedAt: vendor.deactivatedAt,
      deactivationReason: vendor.deactivationReason,
      lockReason: vendor.lockReason,
      lockedAt: vendor.lockedAt,
    };

    res.status(200).json({
      success: true,
      data: accountStatus,
    });
  } catch (error) {
    next(error);
  }
});

// Error handling middleware for this router
router.use((error, req, res, next) => {
  console.error("❌ Vendor profile route error:", error.message);

  // Clean up temp file on error
  if (req.file && req.file.path && fs.existsSync(req.file.path)) {
    try {
      fs.unlinkSync(req.file.path);
      console.log(`🧹 Cleaned up temp file after error: ${req.file.path}`);
    } catch (cleanupError) {
      console.error(`❌ Failed to cleanup temp file: ${cleanupError.message}`);
    }
  }

  res.status(500).json({
    success: false,
    message: "Internal server error in vendor profile operations",
    error: process.env.NODE_ENV === "development" ? error.message : undefined,
  });
});

module.exports = router;
