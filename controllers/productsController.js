
const Product = require("../models/products");
const Vendor = require("../models/vendor");
const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const { uploadMultipleToCloudinary } = require("../utils/cloudinary");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// @desc    Get all products (with pagination and filters)
// @route   GET /api/products
// @access  Public
exports.getAllProducts = asyncHandler(async (req, res) => {
  const {
    skip = 0,
    limit = 12,
    search,
    category,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const query = { isApproved: true };

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { keywords: { $in: [new RegExp(search, "i")] } },
    ];
  }

  if (category) {
    query.category = category;
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

  const products = await Product.find(query)
    .skip(Number(skip))
    .limit(Number(limit))
    .populate("vendor", "companyName avatar")
    .populate("category", "name")
    .sort(sortOptions);

  const total = await Product.countDocuments(query);

  res.status(200).json({
    success: true,
    total,
    count: products.length,
    data: products,
  });
});

// @desc    Search products (enhanced search)
// @route   GET /api/products/search
// @access  Public
exports.searchProducts = asyncHandler(async (req, res) => {
  const {
    q,
    category,
    vendor,
    limit = 20,
    skip = 0,
    sortBy = "relevance",
  } = req.query;

  if (!q) {
    return res.status(400).json({
      success: false,
      message: "Search query is required",
    });
  }

  const query = { isApproved: true };

  // Text search
  query.$text = { $search: q };

  if (category) query.category = category;
  if (vendor) query.vendor = vendor;

  let sortOption = {};
  switch (sortBy) {
    case "price_low":
      sortOption = { price: 1 };
      break;
    case "price_high":
      sortOption = { price: -1 };
      break;
    case "newest":
      sortOption = { createdAt: -1 };
      break;
    case "relevance":
    default:
      sortOption = { score: { $meta: "textScore" } };
  }

  const products = await Product.find(query, { score: { $meta: "textScore" } })
    .skip(Number(skip))
    .limit(Number(limit))
    .populate("vendor", "companyName avatar")
    .populate("category", "name")
    .sort(sortOption);

  const total = await Product.countDocuments(query);

  res.status(200).json({
    success: true,
    total,
    count: products.length,
    data: products,
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getSingleProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Check if ID is valid ObjectId or slug
  let product;
  if (mongoose.Types.ObjectId.isValid(id)) {
    product = await Product.findById(id)
      .populate("vendor", "companyName avatar description")
      .populate("category", "name");
  } else {
    // Try to find by slug
    product = await Product.findOne({ slug: id })
      .populate("vendor", "companyName avatar description")
      .populate("category", "name");
  }

  if (!product) {
    return next(new ErrorResponse("Product not found", 404));
  }

  // Only show approved products to public
  if (!product.isApproved && !req.user) {
    return next(new ErrorResponse("Product not found", 404));
  }

  // Increment views for approved products
  if (product.isApproved) {
    await product.incrementViews();
  }

  res.status(200).json({
    success: true,
    data: product,
  });
});

// @desc    Create new product
// @route   POST /api/products/create
// @access  Private (Vendor)
// Updated createProduct controller with Cloudinary integration

// @desc    Create new product
// @route   POST /api/products/create
// @access  Private (Vendor)
exports.createProduct = asyncHandler(async (req, res, next) => {
  const vendorId = req.user.id;
  const { title, description, category, keywords, price } = req.body;

  // Check if vendor exists and is approved
  const vendor = await Vendor.findById(vendorId);
  if (!vendor) {
    return next(new ErrorResponse("Vendor not found", 404));
  }

  if (!vendor.isApproved) {
    return next(new ErrorResponse("Vendor not approved", 403));
  }

  if (vendor.isLocked) {
    return next(new ErrorResponse("Vendor account is locked", 403));
  }

  // Check product limit
  const productCount = await Product.countDocuments({ vendor: vendorId });
  if (productCount >= vendor.maxProductLimit) {
    return next(
      new ErrorResponse(
        `Product limit reached. Maximum allowed: ${vendor.maxProductLimit}`,
        403
      )
    );
  }

  let images = [];

  // Handle file uploads to Cloudinary
  if (req.files && req.files.length > 0) {
    try {
      console.log(`📤 Uploading ${req.files.length} images to Cloudinary...`);

      // Get file paths from multer
      const filePaths = req.files.map(file => file.path);

      // Upload to Cloudinary
      const cloudinaryResult = await uploadMultipleToCloudinary(filePaths, "products");

      if (cloudinaryResult.successful && cloudinaryResult.successful.length > 0) {
        // Map successful uploads to image schema format
        images = cloudinaryResult.successful.map((upload, index) => ({
          url: upload.url,           // Cloudinary secure_url
          public_id: upload.public_id, // Cloudinary public_id
          index: index,
        }));

        console.log(`✅ Successfully uploaded ${images.length} images to Cloudinary`);
      }

      // Log any failed uploads
      if (cloudinaryResult.failed && cloudinaryResult.failed.length > 0) {
        console.warn(`⚠️ Failed to upload ${cloudinaryResult.failed.length} images:`,
          cloudinaryResult.failed.map(f => f.error).join(", "));
      }

    } catch (error) {
      console.error("❌ Cloudinary upload error:", error.message);
      // Continue without images rather than failing completely
      images = [];
    }
  }

  // Create product
  const product = await Product.create({
    title,
    description,
    category,
    keywords: keywords
      ? Array.isArray(keywords)
        ? keywords
        : keywords.split(",").map((k) => k.trim())
      : [],
    images,
    price: price || 0,
    vendor: vendorId,
    isApproved: true,
  });

  res.status(201).json({
    success: true,
    message: "Product created successfully. It will be visible after approval.",
    data: product,
  });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Vendor - own products)
exports.updateProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const vendorId = req.user.id;
  const { title, description, category, keywords, price } = req.body;

  const product = await Product.findOne({ _id: id, vendor: vendorId });

  if (!product) {
    return next(new ErrorResponse("Product not found or unauthorized", 404));
  }

  // Update fields
  if (title !== undefined) product.title = title;
  if (description !== undefined) product.description = description;
  if (category !== undefined) product.category = category;
  if (price !== undefined) product.price = price;
  if (keywords !== undefined) {
    product.keywords = Array.isArray(keywords)
      ? keywords
      : keywords.split(",").map((k) => k.trim());
  }

  // Reset approval if significant changes
  if (title !== undefined || description !== undefined) {
    product.isApproved = false;
    product.approvalDate = null;
    product.rejectionReason = null;
  }

  await product.save();

  res.status(200).json({
    success: true,
    message: product.isApproved
      ? "Product updated successfully"
      : "Product updated. It will need re-approval.",
    data: product,
  });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Vendor - own products)
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const vendorId = req.user.id;

  const product = await Product.findOne({ _id: id, vendor: vendorId });

  if (!product) {
    return next(new ErrorResponse("Product not found or unauthorized", 404));
  }

  // Delete images from storage
  if (product.images && product.images.length > 0) {
    product.images.forEach((image) => {
      const filePath = path.join(__dirname, "../../", image.url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
  }

  await product.deleteOne();

  res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
});

// @desc    Get vendor's own products
// @route   GET /api/products/my-products
// @access  Private (Vendor)
exports.getMyProducts = asyncHandler(async (req, res) => {
  const {
    skip = 0,
    limit = 20,
    status,
    search,
    sortBy = "createdAt",
  } = req.query;
  const vendorId = req.user.id;

  const query = { vendor: vendorId };

  if (status === "approved") query.isApproved = true;
  else if (status === "pending") query.isApproved = false;

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const products = await Product.find(query)
    .skip(Number(skip))
    .limit(Number(limit))
    .populate("category", "name")
    .sort({ [sortBy]: -1 });

  const total = await Product.countDocuments(query);

  res.status(200).json({
    success: true,
    total,
    count: products.length,
    data: products,
  });
});

// @desc    Get products by category
// @route   GET /api/products/category/:categoryId
// @access  Public
exports.getProductsByCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const { skip = 0, limit = 12, sortBy = "createdAt" } = req.query;

  const products = await Product.find({
    category: categoryId,
    isApproved: true,
    isActive: true,
  })
    .skip(Number(skip))
    .limit(Number(limit))
    .populate("vendor", "companyName avatar")
    .populate("category", "name")
    .sort({ [sortBy]: -1 });

  const total = await Product.countDocuments({
    category: categoryId,
    isApproved: true,
    isActive: true,
  });

  res.status(200).json({
    success: true,
    total,
    count: products.length,
    data: products,
  });
});

// @desc    Get products by vendor (public)
// @route   GET /api/products/vendor/:vendorId
// @access  Public
exports.getProductsByVendor = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;
  const { skip = 0, limit = 12 } = req.query;

  // Check if vendor exists
  const vendor = await Vendor.findById(vendorId);
  if (!vendor || !vendor.isApproved || vendor.isLocked) {
    return res.status(200).json({
      success: true,
      total: 0,
      count: 0,
      data: [],
    });
  }

  const products = await Product.find({
    vendor: vendorId,
    isApproved: true,
    isActive: true,
  })
    .skip(Number(skip))
    .limit(Number(limit))
    .populate("category", "name")
    .sort({ createdAt: -1 });

  const total = await Product.countDocuments({
    vendor: vendorId,
    isApproved: true,
    isActive: true,
  });

  res.status(200).json({
    success: true,
    total,
    count: products.length,
    data: products,
    vendor: {
      id: vendor._id,
      companyName: vendor.companyName,
      description: vendor.description,
      avatar: vendor.avatar,
    },
  });
});

// @desc    Approve/Reject product (Admin)
// @route   PATCH /api/products/admin/:id/approve
// @access  Private (Admin)
exports.approveProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { isApproved, reason } = req.body;

  if (typeof isApproved !== "boolean") {
    return next(new ErrorResponse("Please specify approval status", 400));
  }

  const product = await Product.findById(id);

  if (!product) {
    return next(new ErrorResponse("Product not found", 404));
  }

  product.isApproved = isApproved;
  product.approvalDate = isApproved ? new Date() : null;
  product.rejectionReason = !isApproved ? reason : null;

  await product.save();

  res.status(200).json({
    success: true,
    message: isApproved ? "Product approved successfully" : "Product rejected",
    data: product,
  });
});

// @desc    Replace image at specific index
// @route   PUT /api/products/:productId/image
// @access  Private (Vendor)
exports.replaceImage = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const vendorId = req.user.id;
  const { index, newImage } = req.body;

  if (index === undefined || !newImage) {
    return next(new ErrorResponse("Index and newImage are required", 400));
  }

  const product = await Product.findOne({
    _id: productId,
    vendor: vendorId,
  });

  if (!product) {
    return next(new ErrorResponse("Product not found or unauthorized", 404));
  }

  if (index >= product.images.length || index < 0) {
    return next(new ErrorResponse("Invalid image index", 400));
  }

  // Delete old image file
  const oldImage = product.images[index];
  if (oldImage && oldImage.url) {
    const oldFilePath = path.join(__dirname, "../../", oldImage.url);
    if (fs.existsSync(oldFilePath)) {
      fs.unlinkSync(oldFilePath);
    }
  }

  product.images[index] = newImage;
  await product.save();

  res.status(200).json({
    success: true,
    data: product.images,
  });
});

// @desc    Delete image at specific index
// @route   DELETE /api/products/:productId/image
// @access  Private (Vendor)
exports.deleteImage = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const { index } = req.query;
  const vendorId = req.user.id;

  if (index === undefined) {
    return next(new ErrorResponse("Image index is required", 400));
  }

  const product = await Product.findOne({
    _id: productId,
    vendor: vendorId,
  });

  if (!product) {
    return next(new ErrorResponse("Product not found or unauthorized", 404));
  }

  const parsedIndex = Number(index);
  if (parsedIndex >= product.images.length || parsedIndex < 0) {
    return next(new ErrorResponse("Invalid image index", 400));
  }

  // Delete image file
  const imageToDelete = product.images[parsedIndex];
  if (imageToDelete && imageToDelete.url) {
    const filePath = path.join(__dirname, "../../", imageToDelete.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  product.images.splice(parsedIndex, 1);
  await product.save();

  res.status(200).json({
    success: true,
    data: product.images,
  });
});
