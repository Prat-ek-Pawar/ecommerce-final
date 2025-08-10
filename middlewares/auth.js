const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const Vendor = require("../models/vendor");
const SuperAdmin = require("../models/superadmin");

// General authentication middleware
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in cookies first
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
    console.log("🍪 Token found in cookies");
  }
  // Fallback: Check for token in Authorization header (for API testing)
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
    console.log("🔑 Token found in Authorization header");
  }

  if (!token) {
    return next(new ErrorResponse("Access denied. No token provided.", 401));
  }

  try {
    // FIXED: Use ACCESS_TOKEN_SECRET instead of JWT_SECRET
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Add user info to request
    req.user = decoded;

    console.log(`🔐 Authenticated: ${decoded.email} (${decoded.role})`);
    next();
  } catch (error) {
    console.error("🚫 Token verification failed:", error.message);

    // Clear invalid cookie
    res.cookie("token", "", {
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return next(new ErrorResponse("Access denied. Invalid token.", 401));
  }
});

// Vendor-specific authentication
const protectVendor = asyncHandler(async (req, res, next) => {
  // First run general authentication
  await new Promise((resolve, reject) => {
    protect(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  // Check if user is a vendor
  if (req.user.role !== "vendor") {
    return next(
      new ErrorResponse("Access denied. Vendor access required.", 403)
    );
  }

  // Get fresh vendor data from database
  const vendor = await Vendor.findById(req.user.id);
  if (!vendor) {
    return next(new ErrorResponse("Vendor not found", 404));
  }

  // Check if vendor is approved
  if (!vendor.isApproved) {
    return next(
      new ErrorResponse("Account pending approval. Please contact admin.", 403)
    );
  }

  // Check if account is locked
  if (vendor.isLocked) {
    return next(
      new ErrorResponse(
        "Account is locked. Please renew your subscription or contact support.",
        403
      )
    );
  }

  // Check subscription status
  const now = new Date();
  if (vendor.subscription.endDate && now > vendor.subscription.endDate) {
    // Auto-lock expired vendor
    vendor.isLocked = true;
    await vendor.save();

    return next(
      new ErrorResponse(
        "Subscription expired. Please renew your subscription to continue.",
        403
      )
    );
  }

  // Add fresh vendor data to request
  req.vendor = vendor;

  console.log(`✅ Vendor access granted: ${vendor.companyName}`);
  next();
});

// Super Admin authentication
const protectSuperAdmin = asyncHandler(async (req, res, next) => {
  // First run general authentication
  await new Promise((resolve, reject) => {
    protect(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  // Check if user is a super admin
  if (req.user.role !== "superadmin") {
    return next(
      new ErrorResponse("Access denied. Super Admin access required.", 403)
    );
  }

  // Get fresh admin data from database
  const admin = await SuperAdmin.findById(req.user.id);
  if (!admin) {
    return next(new ErrorResponse("Super Admin not found", 404));
  }

  // Add fresh admin data to request
  req.admin = admin;

  console.log(`👑 Super Admin access granted: ${admin.username}`);
  next();
});

// 🆕 NEW: Protect routes for both vendors and admins
const protectVendorOrAdmin = asyncHandler(async (req, res, next) => {
  // First run general authentication
  await new Promise((resolve, reject) => {
    protect(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  // Check if user is either vendor or admin
  if (req.user.role !== "vendor" && req.user.role !== "superadmin") {
    return next(
      new ErrorResponse("Access denied. Vendor or Admin access required.", 403)
    );
  }

  // If vendor, perform vendor-specific checks
  if (req.user.role === "vendor") {
    const vendor = await Vendor.findById(req.user.id);
    if (!vendor) {
      return next(new ErrorResponse("Vendor not found", 404));
    }

    // Check vendor status
    if (!vendor.isApproved) {
      return next(
        new ErrorResponse(
          "Account pending approval. Please contact admin.",
          403
        )
      );
    }

    if (vendor.isLocked) {
      return next(
        new ErrorResponse("Account is locked. Contact support.", 403)
      );
    }

    // Check subscription
    const now = new Date();
    if (vendor.subscription.endDate && now > vendor.subscription.endDate) {
      vendor.isLocked = true;
      await vendor.save();
      return next(
        new ErrorResponse(
          "Subscription expired. Please renew to continue.",
          403
        )
      );
    }

    req.vendor = vendor;
  }

  // If admin, get admin data
  if (req.user.role === "superadmin") {
    const admin = await SuperAdmin.findById(req.user.id);
    if (!admin) {
      return next(new ErrorResponse("Super Admin not found", 404));
    }
    req.admin = admin;
  }

  console.log(`🔐 Access granted: ${req.user.email} (${req.user.role})`);
  next();
});

// 🆕 NEW: Resource ownership check (for vendors accessing their own data)
const checkResourceOwnership = (resourceField = "vendorId") => {
  return asyncHandler(async (req, res, next) => {
    // Only apply to vendors (admins can access everything)
    if (req.user.role === "superadmin") {
      return next();
    }

    if (req.user.role !== "vendor") {
      return next(new ErrorResponse("Access denied.", 403));
    }

    // Get the resource ID from params, body, or query
    const resourceId =
      req.params[resourceField] ||
      req.body[resourceField] ||
      req.query[resourceField];

    // If resource ID is specified and doesn't match vendor ID, deny access
    if (resourceId && resourceId !== req.user.id) {
      return next(
        new ErrorResponse(
          "Access denied. You can only access your own resources.",
          403
        )
      );
    }

    next();
  });
};

// 🆕 NEW: Validate ObjectId parameters
const validateObjectId = (...paramNames) => {
  return (req, res, next) => {
    for (const paramName of paramNames) {
      const id = req.params[paramName];
      if (id && !mongoose.Types.ObjectId.isValid(id)) {
        return next(new ErrorResponse(`Invalid ${paramName}`, 400));
      }
    }
    next();
  };
};

// 🆕 NEW: Rate limiting middleware
const rateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();

  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress || "unknown";
    const now = Date.now();
    const windowStart = now - windowMs;

    // Initialize or get existing requests for this IP
    if (!requests.has(key)) {
      requests.set(key, []);
    }

    const userRequests = requests.get(key);

    // Remove old requests outside the window
    const validRequests = userRequests.filter((time) => time > windowStart);

    if (validRequests.length >= maxRequests) {
      return next(
        new ErrorResponse(
          `Too many requests. Please try again later. (${maxRequests} requests per ${
            windowMs / 60000
          } minutes)`,
          429
        )
      );
    }

    // Add current request
    validRequests.push(now);
    requests.set(key, validRequests);

    // Clean up old entries periodically
    if (Math.random() < 0.1) {
      // 10% chance
      for (const [ip, timestamps] of requests.entries()) {
        const validTimestamps = timestamps.filter((time) => time > windowStart);
        if (validTimestamps.length === 0) {
          requests.delete(ip);
        } else {
          requests.set(ip, validTimestamps);
        }
      }
    }

    next();
  };
};

// 🆕 NEW: API usage logging middleware
const logApiUsage = (req, res, next) => {
  const start = Date.now();

  // Log request
  const userInfo = req.user
    ? `${req.user.email} (${req.user.role})`
    : "Anonymous";
  console.log(`📥 ${req.method} ${req.originalUrl} - ${userInfo} - ${req.ip}`);

  // Log response when finished
  res.on("finish", () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const statusEmoji = status >= 400 ? "❌" : status >= 300 ? "⚠️" : "✅";

    console.log(
      `📤 ${statusEmoji} ${req.method} ${req.originalUrl} - ${status} - ${duration}ms - ${userInfo}`
    );
  });

  next();
};

// 🆕 NEW: Check if user can perform bulk operations
const canPerformBulkOperations = asyncHandler(async (req, res, next) => {
  if (req.user.role === "superadmin") {
    return next(); // Admins can always perform bulk operations
  }

  if (req.user.role === "vendor") {
    // Check if vendor has sufficient subscription level
    const vendor = await Vendor.findById(req.user.id);
    if (!vendor) {
      return next(new ErrorResponse("Vendor not found", 404));
    }

    // Only premium and enterprise plans can do bulk operations
    const allowedPlans = ["premium_6m", "enterprise_12m"];
    if (!allowedPlans.includes(vendor.subscription.currentPlan)) {
      return next(
        new ErrorResponse(
          "Bulk operations require Premium or Enterprise subscription.",
          403
        )
      );
    }
  }

  next();
});

// 🆕 NEW: Check product/customer limit for vendors
const checkLimit = (limitType = "products") => {
  return asyncHandler(async (req, res, next) => {
    if (req.user.role !== "vendor") {
      return next(); // Skip for non-vendors
    }

    const vendor = await Vendor.findById(req.user.id);
    if (!vendor) {
      return next(new ErrorResponse("Vendor not found", 404));
    }

    if (limitType === "products") {
      // Check if vendor has reached product limit
      const Product = require("../models/Product");
      const productCount = await Product.countDocuments({ vendor: vendor._id });

      if (productCount >= vendor.maxProductLimit) {
        return next(
          new ErrorResponse(
            `Product limit reached. Maximum allowed: ${vendor.maxProductLimit}. Upgrade your subscription for more products.`,
            403
          )
        );
      }
    }

    next();
  });
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(
        new ErrorResponse("Access denied. Authentication required.", 401)
      );
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `Access denied. Role '${req.user.role}' is not authorized for this resource.`,
          403
        )
      );
    }

    console.log(`🔑 Role authorized: ${req.user.role} for ${req.originalUrl}`);
    next();
  };
};

// Subscription status middleware (for vendors only)
const checkSubscription = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "vendor") {
    return next(); // Skip for non-vendors
  }

  const vendor = await Vendor.findById(req.user.id);
  if (!vendor) {
    return next(new ErrorResponse("Vendor not found", 404));
  }

  const now = new Date();
  const subscription = vendor.subscription;

  // Check if subscription exists and is valid
  if (!subscription.endDate) {
    return next(new ErrorResponse("No active subscription found", 403));
  }

  // Check if subscription is expired
  if (now > subscription.endDate) {
    // Auto-lock vendor
    vendor.isLocked = true;
    await vendor.save();

    return next(
      new ErrorResponse(
        "Subscription expired. Please renew your subscription to continue.",
        403
      )
    );
  }

  // Check if subscription is expiring soon (7 days)
  const daysRemaining = Math.ceil(
    (subscription.endDate - now) / (1000 * 60 * 60 * 24)
  );
  if (daysRemaining <= 7) {
    console.log(
      `⚠️ Subscription expiring soon: ${vendor.companyName} (${daysRemaining} days left)`
    );
  }

  // Add subscription info to request
  req.subscriptionStatus = {
    isActive: true,
    daysRemaining,
    endDate: subscription.endDate,
    isExpiringSoon: daysRemaining <= 7,
  };

  next();
});

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in cookies first
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // Fallback: Check for token in Authorization header
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (token) {
    try {
      // FIXED: Use ACCESS_TOKEN_SECRET instead of JWT_SECRET
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      req.user = decoded;
      console.log(`🔐 Optional auth: ${decoded.email} (${decoded.role})`);
    } catch (error) {
      console.log(
        "🔍 Optional auth: Invalid token, proceeding without authentication"
      );
      // Clear invalid cookie
      res.cookie("token", "", {
        expires: new Date(0),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
    }
  }

  next();
});

module.exports = {
  // Basic auth functions
  protect,
  protectVendor,
  protectSuperAdmin,
  optionalAuth,

  // 🆕 NEW Combined auth functions
  protectVendorOrAdmin,

  // 🆕 NEW Utility functions
  authorize,
  checkSubscription,
  checkResourceOwnership,
  validateObjectId,
  rateLimit,
  logApiUsage,
  canPerformBulkOperations,
  checkLimit,
};
