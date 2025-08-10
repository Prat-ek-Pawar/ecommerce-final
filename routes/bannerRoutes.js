// routes/bannerRoutes.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  createBanner,
  getAllBannersAdmin,
  getVisibleBanners,
  getBanner,
  updateBanner,
  deleteBanner,
  toggleBannerVisibility,
  getBannerStats,
} = require("../controllers/superAdmin/bannerController");

const { protectSuperAdmin } = require("../middlewares/auth");

const { createUploadDirectories } = require("../utils/cloudinary");

const router = express.Router();

// Ensure upload directories exist
createUploadDirectories();

// Multer configuration for banner uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), "uploads", "banners"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `banner_${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  // Check if file is an image
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// ===== PUBLIC ROUTES (No Authentication Required) =====

// @desc    Get all visible banners for frontend display
// @route   GET /api/banners
// @access  Public
router.get("/", getVisibleBanners);

// ===== PROTECTED ROUTES (Super Admin Only) =====

// @desc    Get banner statistics
// @route   GET /api/banners/admin/stats
// @access  Private (Super Admin Only)
router.get("/admin/stats", protectSuperAdmin, getBannerStats);

// @desc    Get all banners with filters and pagination
// @route   GET /api/banners/admin/all
// @access  Private (Super Admin Only)
router.get("/admin/all", protectSuperAdmin, getAllBannersAdmin);

// @desc    Create new banner
// @route   POST /api/banners/admin
// @access  Private (Super Admin Only)
router.post("/admin", protectSuperAdmin, upload.single("image"), createBanner);

// @desc    Get single banner by ID
// @route   GET /api/banners/admin/:id
// @access  Private (Super Admin Only)
router.get("/admin/:id", protectSuperAdmin, getBanner);

// @desc    Update banner
// @route   PUT /api/banners/admin/:id
// @access  Private (Super Admin Only)
router.put(
  "/admin/:id",
  protectSuperAdmin,
  upload.single("image"),
  updateBanner
);

// @desc    Delete banner
// @route   DELETE /api/banners/admin/:id
// @access  Private (Super Admin Only)
router.delete("/admin/:id", protectSuperAdmin, deleteBanner);

// @desc    Toggle banner visibility
// @route   PATCH /api/banners/admin/:id/toggle
// @access  Private (Super Admin Only)
router.patch("/admin/:id/toggle", protectSuperAdmin, toggleBannerVisibility);

module.exports = router;
