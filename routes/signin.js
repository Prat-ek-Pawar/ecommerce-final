const express = require("express");
const {
  sendOtp,
  signupVendor,
} = require("../controllers/pendingVendor/pendingVendors");

const router = express.Router();

// @desc    Send OTP to vendor email
// @route   POST /api/vendor/send-otp
// @access  Public
router.post("/send-otp", sendOtp);

// @desc    Complete vendor signup with OTP verification
// @route   POST /api/vendor/signup
// @access  Public
router.post("/signup", signupVendor);

module.exports = router;
