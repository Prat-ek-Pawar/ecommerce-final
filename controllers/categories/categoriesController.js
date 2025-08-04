const Category = require("../../models/categories");
const asyncHandler = require("../../utils/asyncHandler");
const ErrorResponse = require("../../utils/errorResponse");

// 🔐 Create a new category (Super Admin only)
const createCategory = asyncHandler(async (req, res, next) => {
  const { name, description, image } = req.body;

  if (!name) {
    return next(new ErrorResponse("Category name is required", 400));
  }

  // Check for duplicate category (case-insensitive)
  const existing = await Category.findOne({
    name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
  });

  if (existing) {
    return next(new ErrorResponse("Category already exists", 409));
  }

  const newCategory = new Category({
    name: name.trim(),
    description: description?.trim(),
    image,
  });

  const saved = await newCategory.save();

  console.log(`📦 Category created: ${saved.name} by ${req.user.email}`);

  res.status(201).json({
    success: true,
    message: "Category created successfully",
    data: saved,
  });
});

// 📝 Update an existing category (Super Admin only)
const updateCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, description, image } = req.body;

  const category = await Category.findById(id);
  if (!category) {
    return next(new ErrorResponse("Category not found", 404));
  }

  // Check for duplicate name if name is being updated
  if (name && name.trim().toLowerCase() !== category.name.toLowerCase()) {
    const existing = await Category.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
      _id: { $ne: id },
    });

    if (existing) {
      return next(new ErrorResponse("Category name already exists", 409));
    }
  }

  // Update fields
  if (name) category.name = name.trim();
  if (description !== undefined)
    category.description = description?.trim() || "";
  if (image !== undefined) category.image = image;

  const updated = await category.save();

  console.log(`📝 Category updated: ${updated.name} by ${req.user.email}`);

  res.status(200).json({
    success: true,
    message: "Category updated successfully",
    data: updated,
  });
});

// ❌ Delete category (Super Admin only)
const deleteCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const category = await Category.findById(id);
  if (!category) {
    return next(new ErrorResponse("Category not found", 404));
  }

  // TODO: Check if category is being used by any vendors/products
  // const vendorsUsingCategory = await Vendor.countDocuments({ productCategory: id });
  // if (vendorsUsingCategory > 0) {
  //   return next(new ErrorResponse("Cannot delete category. It is being used by vendors.", 400));
  // }

  await category.deleteOne();

  console.log(`❌ Category deleted: ${category.name} by ${req.user.email}`);

  res.status(200).json({
    success: true,
    message: "Category deleted successfully",
  });
});

// 📦 Get all categories (Public access)
const getAllCategories = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, search } = req.query;

  // Build query
  let query = {};
  if (search) {
    query.name = { $regex: search, $options: "i" };
  }

  // Execute query with pagination
  const categories = await Category.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  // Get total count for pagination
  const total = await Category.countDocuments(query);

  res.status(200).json({
    success: true,
    data: categories,
    pagination: {
      current: page,
      pages: Math.ceil(total / limit),
      total,
    },
  });
});

// 📦 Get single category by ID (Public access)
const getCategoryById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const category = await Category.findById(id);
  if (!category) {
    return next(new ErrorResponse("Category not found", 404));
  }

  res.status(200).json({
    success: true,
    data: category,
  });
});

module.exports = {
  createCategory,
  updateCategory,
  deleteCategory,
  getAllCategories,
  getCategoryById,
};
