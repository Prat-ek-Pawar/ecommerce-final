const PendingVendor = require("../../models/pendingVendor");
const OtpModel = require("../../models/otpVerification");
const sendEmail = require("../../utils/sendEmail");
const otpEmailTemplate = require("../../emailtemplates/otpEmailTemplate");
const generateOtp = require("../../utils/generateOtp");
const crypto = require("crypto");
const VendorAuth = require("../../models/vendorAuthentication");
const approvalEmailTemplate = require("../../emailtemplates/pendingApprovalTemplate");
const ErrorResponse = require("../../utils/errorResponse");
const asyncHandler = require("../../utils/asyncHandler");
const Vendor = require("../../models/vendor");
const categories = require("../../models/categories");

// ✅ Step 1: Send OTP
const sendOtp = asyncHandler(async (req, res, next) => {
  const { email, phone, companyName, productCategory, description } = req.body;

  if (!email || !companyName || !productCategory || !description) {
    return next(new ErrorResponse("All required fields must be filled", 400));
  }

  // Check if OTP already sent recently
  const isOTP = await OtpModel.findOne({ email });
  if (isOTP) {
    return next(
      new ErrorResponse(
        "OTP already sent. Please wait before requesting again.",
        429
      )
    );
  }

  // Check if already pending
  const existing = await PendingVendor.findOne({ email });
  if (existing) {
    return next(new ErrorResponse("Vendor request already pending", 409));
  }

  // Check if vendor already exists
  const existingVendor = await Vendor.findOne({ email });
  if (existingVendor) {
    return next(
      new ErrorResponse(
        `Account with ${email} already exists. Please login instead.`,
        409
      )
    );
  }

  // Generate OTP
  const otp = generateOtp();

  // Save OTP
  await OtpModel.create({
    email,
    otp,
    createdAt: new Date(),
    attempts: 0,
  });

  // Generate professional email with company name
  const html = otpEmailTemplate(otp, companyName);
  await sendEmail(email, html);

  res.status(200).json({
    success: true,
    message: "OTP sent to email successfully",
    data: {
      email: email,
      expiresIn: "2 minutes",
    },
  });
});

// ✅ Step 2: Signup with OTP and Password
const signupVendor = asyncHandler(async (req, res, next) => {
  const {
    email,
    otp,
    password,
    confirmPassword,
    phone,
    companyName,
    productCategory,
    description,
  } = req.body;

  // ✅ Check all required fields
  if (
    !email ||
    !otp ||
    !password ||
    !confirmPassword ||
    !companyName ||
    !productCategory ||
    !description
  ) {
    return next(new ErrorResponse("All required fields must be filled", 400));
  }

  // ✅ Validate password strength using the model's static method
  const passwordErrors = PendingVendor.validatePassword(password);
  if (passwordErrors.length > 0) {
    return next(
      new ErrorResponse(
        `Password validation failed: ${passwordErrors.join(", ")}`,
        400
      )
    );
  }

  // ✅ Check if passwords match
  if (password !== confirmPassword) {
    return next(new ErrorResponse("Passwords do not match", 400));
  }

  // ✅ Validate OTP format
  const sanitizedOtp = String(otp).trim();
  if (!/^\d{6}$/.test(sanitizedOtp)) {
    return next(
      new ErrorResponse("Invalid OTP format. Please enter 6 digits.", 400)
    );
  }

  // ✅ Check if OTP is valid
  const validOtp = await OtpModel.findOne({ email });
  if (!validOtp || validOtp.otp !== sanitizedOtp) {
    return next(
      new ErrorResponse(
        "Invalid or expired OTP. Please request a new one.",
        400
      )
    );
  }

  // ✅ Delete OTP after successful verification
  await OtpModel.deleteOne({ email });

  try {
    console.log("productCategory ", productCategory);
    const categoriesList = await categories
      .find({
        _id: { $in: productCategory },
      })
      .select("name");
    console.log("category list ", categoriesList);
    const categoryNames = categoriesList.map((cat) => cat.name);
    console.log("categoryNames ", categoryNames);
    const categoryString = categoryNames.join(", ");
    // ✅ Save vendor to PendingVendor with all required fields
    console.log(" categoryString ", categoryString);
    const pendingVendor = new PendingVendor({
      email,
      password, // This will be hashed by the pre-save middleware
      phone,
      companyName,
      categoryString,
      description,
    });

    await pendingVendor.save();

    console.log(
      `📝 Pending vendor created: ${pendingVendor.companyName} (${pendingVendor.email})`
    );

    // ✅ Create secure one-time token for approval
    const authToken = crypto.randomBytes(32).toString("hex");

    // ✅ Store token in VendorAuth
    await VendorAuth.create({
      vendorId: pendingVendor._id,
      authToken,
    });

    // ✅ Generate approval email with links
    const approveLink = `${process.env.BASE_URL}/api/admin/approve?vendorId=${pendingVendor._id}&token=${authToken}`;
    const denyLink = `${process.env.BASE_URL}/api/admin/deny?vendorId=${pendingVendor._id}&token=${authToken}`;
    const html = approvalEmailTemplate({
      vendor: pendingVendor,
      approveLink,
      denyLink,
    });

    // ✅ Send approval email to admin
    await sendEmail(
      process.env.ADMIN_EMAIL || "sometimesuse4912@gmail.com",
      html
    );

    console.log(
      `📧 Approval email sent to admin for: ${pendingVendor.companyName}`
    );

    res.status(201).json({
      success: true,
      message:
        "Vendor registration submitted successfully! Please wait for admin approval.",
      data: {
        vendorId: pendingVendor._id,
        companyName: pendingVendor.companyName,
        email: pendingVendor.email,
        status: "pending_approval",
        submittedAt: pendingVendor.createdAt,
      },
    });
  } catch (error) {
    console.error("Error creating pending vendor:", error);

    // Handle validation errors specifically
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return next(
        new ErrorResponse(
          `Validation failed: ${validationErrors.join(", ")}`,
          400
        )
      );
    }

    // Handle duplicate email error
    if (error.code === 11000) {
      return next(
        new ErrorResponse(
          "Email already registered. Please use a different email.",
          409
        )
      );
    }

    return next(
      new ErrorResponse(
        "Failed to process registration. Please try again.",
        500
      )
    );
  }
});

module.exports = {
  sendOtp,
  signupVendor,
};
