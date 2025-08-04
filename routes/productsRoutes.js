const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

// Import controllers
const {
  getAllProducts,
  searchProducts,
  getSingleProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyProducts,
  getProductsByCategory,
  getProductsByVendor,
  approveProduct,
} = require("../controllers/productsController");

// Import middleware
const {
  protectVendor,
  protectSuperAdmin,
  optionalAuth,
} = require("../middlewares/auth");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/products/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
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
      cb(
        new Error("Only image files are allowed (JPEG, PNG, GIF, WebP)"),
        false
      );
    }
  },
});

// Multer error handler middleware
const handleMulterError = (req, res, next) => {
  upload.array("images", 5)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "File too large. Maximum size is 5MB",
        });
      }
      if (err.code === "LIMIT_FILE_COUNT") {
        return res.status(400).json({
          success: false,
          message: "Too many files. Maximum is 5 images",
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message,
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

// ===== PUBLIC ROUTES =====
// @desc    Get all products for landing page (with pagination)
// @route   GET /api/products?skip=0&limit=12&search=keyword&category=id&sortBy=createdAt&sortOrder=desc
// @access  Public
router.get("/", getAllProducts);

// @desc    Search products (enhanced search with relevance)
// @route   GET /api/products/search?q=keyword&category=id&vendor=id&limit=20&skip=0&sortBy=relevance
// @access  Public
router.get("/search", searchProducts);

// @desc    Get products by category
// @route   GET /api/products/category/:categoryId?skip=0&limit=12&sortBy=createdAt
// @access  Public
router.get("/category/:categoryId", getProductsByCategory);

// @desc    Get products by vendor (public store)
// @route   GET /api/products/vendor/:vendorId?skip=0&limit=12
// @access  Public
router.get("/vendor/:vendorId", getProductsByVendor);

// ===== VENDOR ROUTES (Private) =====
// @desc    Get vendor's own products with filters
// @route   GET /api/products/my-products?skip=0&limit=20&status=approved|pending
// @access  Private (Vendor)
router.get("/my-products", protectVendor, getMyProducts);

// @desc    Create new product (with image upload)
// @route   POST /api/products/create
// @access  Private (Vendor)
router.post("/create", protectVendor, handleMulterError, createProduct);

// @desc    Update own product
// @route   PUT /api/products/:id
// @access  Private (Vendor)
router.put("/:id", protectVendor, updateProduct);

// @desc    Delete own product
// @route   DELETE /api/products/:id
// @access  Private (Vendor)
router.delete("/:id", protectVendor, deleteProduct);

// ===== ADMIN ROUTES (Private) =====
// @desc    Approve/Reject product
// @route   PATCH /api/products/admin/:id/approve
// @access  Private (Admin)
router.patch("/admin/:id/approve", protectSuperAdmin, approveProduct);

// @desc    Get single product for admin (includes pending products)
// @route   GET /api/products/admin/:id
// @access  Private (Admin)
router.get("/admin/:id", protectSuperAdmin, getSingleProduct);

// @desc    Update any product (admin override)
// @route   PUT /api/products/admin/:id
// @access  Private (Admin)
router.put("/admin/:id", protectSuperAdmin, updateProduct);

// @desc    Delete any product (admin override)
// @route   DELETE /api/products/admin/:id
// @access  Private (Admin)
router.delete("/admin/:id", protectSuperAdmin, deleteProduct);

// ===== MUST BE LAST - Dynamic route =====
// @desc    Get single product by ID or slug (public)
// @route   GET /api/products/:id
// @access  Public
router.get("/:id", optionalAuth, getSingleProduct);

module.exports = router;
