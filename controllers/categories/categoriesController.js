const Category = require("../../models/categories");
const asyncHandler = require("../../utils/asyncHandler");
const ErrorResponse = require("../../utils/errorResponse");
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../../utils/cloudinary");
const fs = require("fs");

// 🔐 Create a new category (Super Admin only)
const createCategory = asyncHandler(async (req, res, next) => {
  const { name, description } = req.body;

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

  // Handle image upload if file is provided
  let imageData = null;
  if (req.file) {
    try {
      // Upload to Cloudinary
      const uploadResult = await uploadToCloudinary(
        req.file.path,
        "categories"
      );
      imageData = {
        public_id: uploadResult.public_id,
        url: uploadResult.url,
      };
    } catch (error) {
      // Clean up local file if upload fails
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return next(new ErrorResponse("Failed to upload image", 500));
    }
  }

  const newCategory = new Category({
    name: name.trim(),
    description: description?.trim(),
    image: imageData,
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
  const { name, description } = req.body;

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

  // Handle image upload if new file is provided
  if (req.file) {
    try {
      // Delete old image from Cloudinary if exists
      if (category.image && category.image.public_id) {
        await deleteFromCloudinary(category.image.public_id);
      }

      // Upload new image
      const uploadResult = await uploadToCloudinary(
        req.file.path,
        "categories"
      );
      category.image = {
        public_id: uploadResult.public_id,
        url: uploadResult.url,
      };
    } catch (error) {
      // Clean up local file if upload fails
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return next(new ErrorResponse("Failed to upload image", 500));
    }
  }

  // Update other fields
  if (name) category.name = name.trim();
  if (description !== undefined)
    category.description = description?.trim() || "";

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

  // Delete image from Cloudinary if exists
  if (category.image && category.image.public_id) {
    try {
      await deleteFromCloudinary(category.image.public_id);
    } catch (error) {
      console.warn("Failed to delete image from Cloudinary:", error.message);
    }
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
