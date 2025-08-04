const express = require("express");
const {
  vendorLogin,
  superAdminLogin,
  getMe,
  logout,
} = require("../controllers/Authentication/authController");
const {
  protect,
  protectVendor,
  protectSuperAdmin,
} = require("../middlewares/auth");

const router = express.Router();

// @desc    Vendor Login
// @route   POST /api/auth/vendor/login
// @access  Public
router.post("/vendor/login", vendorLogin);

// @desc    Super Admin Login
// @route   POST /api/auth/admin/login
// @access  Public
router.post("/admin/login", superAdminLogin);

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private (Both vendor and admin)
router.get("/me", protect, getMe);

// @desc    Logout current user
// @route   POST /api/auth/logout
// @access  Private (Both vendor and admin)
router.post("/logout", protect, logout);

// @desc    Vendor-only protected route example
// @route   GET /api/auth/vendor/dashboard
// @access  Private (Vendor only)
router.get("/vendor/dashboard", protectVendor, (req, res) => {
  res.json({
    success: true,
    message: `Welcome to vendor dashboard, ${req.vendor.companyName}!`,
    data: {
      vendor: {
        id: req.vendor._id,
        companyName: req.vendor.companyName,
        email: req.vendor.email,
        subscription: req.vendor.subscription,
        isLocked: req.vendor.isLocked,
        maxProductLimit: req.vendor.maxProductLimit,
      },
      subscriptionStatus: req.subscriptionStatus,
    },
  });
});

// @desc    Admin-only protected route example
// @route   GET /api/auth/admin/dashboard
// @access  Private (Super Admin only)
router.get("/admin/dashboard", protectSuperAdmin, (req, res) => {
  res.json({
    success: true,
    message: `Welcome to admin dashboard, ${req.admin.username}!`,
    data: {
      admin: {
        id: req.admin._id,
        username: req.admin.username,
        email: req.admin.email,
        role: req.admin.role,
      },
    },
  });
});

module.exports = router;
