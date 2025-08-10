const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  createCategory,
  updateCategory,
  deleteCategory,
  getAllCategories,
  getCategoryById,
} = require("../controllers/categories/categoriesController");

// Import authentication middleware
const { protectSuperAdmin, optionalAuth } = require("../middlewares/auth");

const router = express.Router();

// Configure multer for category image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), "uploads", "categories"));
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `category-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (JPEG, PNG, GIF, WebP)"));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter,
});

// Public routes (no authentication required)
// GET /api/categories - Get all categories (with optional search and pagination)
router.get("/", getAllCategories);

// GET /api/categories/:id - Get single category by ID
router.get("/:id", getCategoryById);

// Protected routes (Super Admin only)
// POST /api/categories - Create new category (with optional image upload)
router.post("/", protectSuperAdmin, upload.single("image"), createCategory);

// PUT /api/categories/:id - Update category (with optional image upload)
router.put("/:id", protectSuperAdmin, upload.single("image"), updateCategory);

// DELETE /api/categories/:id - Delete category
router.delete("/:id", protectSuperAdmin, deleteCategory);

module.exports = router;
