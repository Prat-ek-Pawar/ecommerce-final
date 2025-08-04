const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  otp: {
    type: String,
    required: true,
  },
  attempts: {
    type: Number,
    default: 0, // increases on each failed try
  },
  maxAttempts: {
    type: Number,
    default: 5, // you can tune this per project need
  },
  cooldownStart: {
    type: Date,
    default: null, // set when max attempts breached
  },
  cooldownDuration: {
    type: Number,
    default: 5 * 60 * 1000, // 5 mins cooldown in ms
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 120, // auto delete after 2 minutes
  },
});

// Virtual to calculate if user is in cooldown
otpSchema.virtual("isInCooldown").get(function () {
  if (!this.cooldownStart) return false;
  const now = new Date();
  const cooldownEnd = new Date(
    this.cooldownStart.getTime() + this.cooldownDuration
  );
  return now < cooldownEnd;
});

module.exports = mongoose.model("OtpVerification", otpSchema);
