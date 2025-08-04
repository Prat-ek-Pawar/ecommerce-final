const Vendor = require("../../models/vendor");
const SuperAdmin = require("../../models/superadmin");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("../../utils/asyncHandler");
const ErrorResponse = require("../../utils/errorResponse");

// Generate JWT Token and Set Cookie
const generateTokenAndSetCookie = (res, payload) => {
  const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "30d",
  });

  // Cookie options
  const cookieOptions = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true, // Prevent XSS attacks
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    sameSite: "strict", // CSRF protection
  };

  // Set cookie
  res.cookie("token", token, cookieOptions);

  return token;
};

// @desc    Vendor Login
// @route   POST /api/auth/vendor/login
// @access  Public
const vendorLogin = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorResponse("Please provide email and password", 400));
  }

  // Find vendor by email (include password for verification)
  const vendor = await Vendor.findOne({ email })
    .select("+password")
    .populate("productCategory", "name");

  if (!vendor) {
    return next(new ErrorResponse("Invalid email or password", 401));
  }

  // Check if vendor is approved
  if (!vendor.isApproved) {
    return next(
      new ErrorResponse(
        "Account pending approval. Please wait for admin approval.",
        403
      )
    );
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, vendor.password);
  if (!isPasswordValid) {
    return next(new ErrorResponse("Invalid email or password", 401));
  }

  // Check subscription status
  const now = new Date();
  const isSubscriptionExpired = vendor.subscription.endDate
    ? now > vendor.subscription.endDate
    : true;

  // JWT Payload
  const payload = {
    id: vendor._id,
    email: vendor.email,
    role: "vendor",
    subscription: {
      duration: vendor.subscription.duration,
      endDate: vendor.subscription.endDate,
      isExpired: isSubscriptionExpired,
    },
    isLocked: vendor.isLocked,
    isApproved: vendor.isApproved,
    companyName: vendor.companyName,
  };

  const token = generateTokenAndSetCookie(res, payload);

  console.log(`🔐 Vendor logged in: ${vendor.companyName} (${vendor.email})`);

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      vendor: {
        id: vendor._id,
        email: vendor.email,
        companyName: vendor.companyName,
        phone: vendor.phone,
        productCategory: vendor.productCategory,
        role: "vendor",
        subscription: {
          duration: vendor.subscription.duration,
          startDate: vendor.subscription.startDate,
          endDate: vendor.subscription.endDate,
          isExpired: isSubscriptionExpired,
          daysRemaining: isSubscriptionExpired
            ? 0
            : Math.ceil(
                (vendor.subscription.endDate - now) / (1000 * 60 * 60 * 24)
              ),
        },
        account: {
          isLocked: vendor.isLocked,
          isApproved: vendor.isApproved,
          maxProductLimit: vendor.maxProductLimit,
        },
      },
    },
  });
});

// @desc    Super Admin Login
// @route   POST /api/auth/admin/login
// @access  Public
const superAdminLogin = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorResponse("Please provide email and password", 400));
  }

  // Find super admin by email (include password for verification)
  const admin = await SuperAdmin.findOne({ email }).select("+password");

  if (!admin) {
    return next(new ErrorResponse("Invalid email or password", 401));
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, admin.password);
  if (!isPasswordValid) {
    return next(new ErrorResponse("Invalid email or password", 401));
  }

  // JWT Payload for Super Admin
  const payload = {
    id: admin._id,
    email: admin.email,
    role: "superadmin",
    username: admin.username,
    // Super admin doesn't have subscription/lock status
    subscription: null,
    isLocked: false,
    isApproved: true,
  };

  const token = generateTokenAndSetCookie(res, payload);

  console.log(`🔐 Super Admin logged in: ${admin.username} (${admin.email})`);

  res.status(200).json({
    success: true,
    message: "Super Admin login successful",
    data: {
      admin: {
        id: admin._id,
        email: admin.email,
        username: admin.username,
        role: "superadmin",
        token
      },
    },
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res, next) => {
  let user;

  if (req.user.role === "vendor") {
    user = await Vendor.findById(req.user.id)
      .populate("productCategory", "name")
      .select("-password");

    if (!user) {
      return next(new ErrorResponse("Vendor not found", 404));
    }

    // Calculate current subscription status
    const now = new Date();
    const isSubscriptionExpired = user.subscription.endDate
      ? now > user.subscription.endDate
      : true;

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          companyName: user.companyName,
          phone: user.phone,
          productCategory: user.productCategory,
          role: "vendor",
          subscription: {
            duration: user.subscription.duration,
            startDate: user.subscription.startDate,
            endDate: user.subscription.endDate,
            isExpired: isSubscriptionExpired,
            daysRemaining: isSubscriptionExpired
              ? 0
              : Math.ceil(
                  (user.subscription.endDate - now) / (1000 * 60 * 60 * 24)
                ),
          },
          account: {
            isLocked: user.isLocked,
            isApproved: user.isApproved,
            maxProductLimit: user.maxProductLimit,
          },
        },
      },
    });
  } else if (req.user.role === "superadmin") {
    user = await SuperAdmin.findById(req.user.id).select("-password");

    if (!user) {
      return next(new ErrorResponse("Super Admin not found", 404));
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          role: "superadmin",
        },
      },
    });
  } else {
    return next(new ErrorResponse("Invalid user role", 400));
  }
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res, next) => {
  console.log(`🚪 User logged out: ${req.user.email} (${req.user.role})`);

  // Clear the token cookie
  res.cookie("token", "", {
    expires: new Date(0),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

module.exports = {
  vendorLogin,
  superAdminLogin,
  getMe,
  logout,
};
