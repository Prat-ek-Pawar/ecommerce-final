const mongoose = require("mongoose");
const slugify = require("slugify");

const imageSchema = new mongoose.Schema({
  public_id: { type: String },
  url: { type: String },
  index: { type: Number },
});

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters long"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Product category is required"],
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    keywords: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    images: [imageSchema], // array of images with index
    price: {
      type: Number,
      default: 0,
      min: [0, "Price cannot be negative"],
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    approvalDate: {
      type: Date,
    },
    rejectionReason: {
      type: String,
    },
    views: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexing for search optimization
productSchema.index({ title: "text", keywords: "text", category: 1 });
productSchema.index({ vendor: 1, isApproved: 1 });
productSchema.index({ slug: 1 });
productSchema.index({ createdAt: -1 });

// Virtual for primary image
productSchema.virtual("primaryImage").get(function () {
  return this.images && this.images.length > 0 ? this.images[0] : null;
});

// Slug generation
productSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    // Generate unique slug
    const baseSlug = slugify(this.title, { lower: true, strict: true });
    // Add random string to ensure uniqueness
    this.slug = `${baseSlug}-${Date.now().toString(36)}`;
  }
  next();
});

// Method to increment views
productSchema.methods.incrementViews = async function () {
  this.views += 1;
  return this.save();
};

module.exports = mongoose.model("Product", productSchema);
