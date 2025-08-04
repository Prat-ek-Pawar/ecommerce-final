const mongoose = require("mongoose");

const logSchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    details: { type: mongoose.Schema.Types.Mixed },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "performedByModel",
    },
    performedByModel: {
      type: String,
      enum: ["Vendor", "SuperAdmin"],
    },
    status: {
      type: String,
      enum: ["success", "failure"],
      default: "success",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Log", logSchema);
