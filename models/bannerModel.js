// models/Banner.js
const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Banner title is required"],
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: [true, "Vendor ID is required"],
    },
    imageUrl: {
      type: String,
      required: [true, "Banner image is required"],
    },
    publicId: {
      type: String,
      required: [true, "Cloudinary public ID is required"],
    },
    visibilityDays: {
      type: Number,
      required: [true, "Visibility days is required"],
      enum: [7, 10, 12, 15, 17, 30],
      default: 7,
    },
    expiryDate: {
      type: Date,
      // Remove required, let middleware handle it
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SuperAdmin",
      required: [true, "Created by admin ID is required"],
    },
  },
  {
    timestamps: true,
  }
);

// Create index for efficient queries
bannerSchema.index({ isVisible: 1, expiryDate: 1 });
bannerSchema.index({ vendorId: 1 });

// Pre-save middleware to calculate expiry date
bannerSchema.pre("save", function (next) {
  // Always calculate expiry date if it's not set or if visibilityDays changed
  if (!this.expiryDate || this.isNew || this.isModified("visibilityDays")) {
    this.expiryDate = new Date(
      Date.now() + this.visibilityDays * 24 * 60 * 60 * 1000
    );
  }
  next();
});

// Method to check if banner is expired
bannerSchema.methods.checkExpiry = function () {
  if (this.isVisible && new Date() > this.expiryDate) {
    this.isVisible = false;
    return this.save();
  }
  return Promise.resolve(this);
};

// Static method to update expired banners
bannerSchema.statics.updateExpiredBanners = async function () {
  const result = await this.updateMany(
    {
      isVisible: true,
      expiryDate: { $lt: new Date() },
    },
    {
      isVisible: false,
    }
  );

  if (result.modifiedCount > 0) {
    console.log(`🔄 Updated ${result.modifiedCount} expired banners`);
  }

  return result;
};

module.exports = mongoose.model("Banner", bannerSchema);
