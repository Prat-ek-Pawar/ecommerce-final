const mongoose = require("mongoose");

const vendorAuthSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PendingVendor", // capital P, model name
    required: true,
  },
  authToken: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: "10d" }, // 10 days auto-expiry
});

module.exports = mongoose.model("VendorAuth", vendorAuthSchema);
