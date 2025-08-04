const express = require("express");
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

// Public routes (no authentication required)
// GET /api/categories - Get all categories (with optional search and pagination)
router.get("/", getAllCategories);

// GET /api/categories/:id - Get single category by ID
router.get("/:id", getCategoryById);

// Protected routes (Super Admin only)
// POST /api/categories - Create new category
router.post("/", protectSuperAdmin, createCategory);

// PUT /api/categories/:id - Update category
router.put("/:id", protectSuperAdmin, updateCategory);

// DELETE /api/categories/:id - Delete category
router.delete("/:id", protectSuperAdmin, deleteCategory);

module.exports = router;
