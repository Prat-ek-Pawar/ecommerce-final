const mongoose = require("mongoose");

const DeniedVendorSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    productCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Product category is required"],
    },
    description: {
      type: String,
      required: [true, "Company description is required"],
      trim: true,
    },

    // Add this field to trigger TTL
    expireAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      index: { expires: 0 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DeniedVendor", DeniedVendorSchema);
