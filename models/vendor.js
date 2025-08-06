const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Custom password validator function
const passwordValidator = function (password) {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

const vendorSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (email) {
          // Basic email validation
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },
        message: "Please provide a valid email address",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
      validate: {
        validator: passwordValidator,
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)",
      },
      select: false, // Don't include password in queries by default
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: function (phone) {
          // Optional field, but if provided should be valid
          if (!phone) return true;
          return /^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/\s/g, ""));
        },
        message: "Please provide a valid phone number",
      },
    },
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      minlength: [2, "Company name must be at least 2 characters long"],
      maxlength: [100, "Company name cannot exceed 100 characters"],
    },
    address: {
      street: {
        type: String,
        trim: true,
        maxlength: [200, "Street address cannot exceed 200 characters"],
      },
      city: {
        type: String,
        trim: true,
        maxlength: [50, "City name cannot exceed 50 characters"],
      },
      state: {
        type: String,
        trim: true,
        maxlength: [50, "State name cannot exceed 50 characters"],
      },
      country: {
        type: String,
        trim: true,
        maxlength: [50, "Country name cannot exceed 50 characters"],
      },
      postalCode: {
        type: String,
        trim: true,
        maxlength: [20, "Postal code cannot exceed 20 characters"],
      },
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    productCategory:[ {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Product category is required"],
    }],
    avatar: {
      url: {
        type: String,
      },
      public_id: {
        type: String,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SuperAdmin",
    },
    approvedAt: {
      type: Date,
    },
    deactivatedAt: {
      type: Date,
    },
    deactivationReason: {
      type: String,
    },
    emailVerified: {
      type: Boolean,
      default: true,
    },
    maxProductLimit: {
      type: Number,
      default: 10,
      min: [1, "Product limit must be at least 1"],
      max: [1000, "Product limit cannot exceed 1000"],
    },
    subscription: {
      duration: {
        type: Number,
        enum: {
          values: [1, 3, 6, 12],
          message: "Duration must be 1, 3, 6, or 12 months",
        },
        required: [true, "Subscription duration is required"],
      },
      startDate: {
        type: Date,
        default: Date.now,
      },
      endDate: {
        type: Date,
      },
      lastPurchaseDate: {
        type: Date,
      },
      totalPurchases: {
        type: Number,
        default: 0,
        min: [0, "Total purchases cannot be negative"],
      },
      currentPlan: {
        type: String,
        enum: {
          values: ["basic_1m", "standard_3m", "premium_6m", "enterprise_12m"],
          message: "Invalid subscription plan",
        },
        default: "basic_1m",
      },
    },
    lastLogin: {
      type: Date,
    },
    loginAttempts: {
      type: Number,
      default: 0,
      max: [5, "Too many login attempts"],
    },
    lockUntil: {
      type: Date,
    },
    lockedAt: {
      type: Date,
    },
    lockReason: {
      type: String,
    },
  },
  {
    timestamps: true,
    // Include virtuals when converting to JSON
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ✅ Virtual to check if subscription is expired
vendorSchema.virtual("isSubscriptionExpired").get(function () {
  if (!this.subscription.endDate) return false;
  return new Date() > this.subscription.endDate;
});

// ✅ Virtual to check if account is temporarily locked due to failed login attempts
vendorSchema.virtual("isAccountLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// ✅ Virtual to get subscription status
vendorSchema.virtual("subscriptionStatus").get(function () {
  if (!this.subscription.endDate) return "inactive";

  const now = new Date();
  const endDate = this.subscription.endDate;
  const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

  if (now > endDate) return "expired";
  if (daysRemaining <= 7) return "expiring_soon";
  return "active";
});

// ✅ Pre-save middleware to hash password
vendorSchema.pre("save", async function (next) {
  // Only hash password if it's modified or new
  if (!this.isModified("password")) {
    return next();
  }

  try {
    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(12); // Increased salt rounds for better security
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ✅ Pre-save middleware to auto-calculate endDate and handle locking
vendorSchema.pre("save", function (next) {
  // Calculate endDate if not set
  if (
    this.subscription.duration &&
    this.subscription.startDate &&
    !this.subscription.endDate
  ) {
    const endDate = new Date(this.subscription.startDate);
    endDate.setMonth(endDate.getMonth() + this.subscription.duration);
    this.subscription.endDate = endDate;
  }

  // Set approvedAt when vendor gets approved
  if (this.isModified("isApproved") && this.isApproved && !this.approvedAt) {
    this.approvedAt = new Date();
  }

  // Auto-lock if subscription expired
  if (this.subscription.endDate && new Date() > this.subscription.endDate) {
    this.isLocked = true;
    if (!this.lockedAt) {
      this.lockedAt = new Date();
      this.lockReason = "subscription_expired";
    }
  }

  next();
});

// ✅ Instance method to compare password
vendorSchema.methods.comparePassword = async function (candidatePassword) {
  if (!candidatePassword || !this.password) {
    return false;
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

// ✅ Instance method to handle failed login attempts
vendorSchema.methods.incLoginAttempts = async function () {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 },
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  // If we have hit max attempts and it's not currently locked, lock the account
  if (this.loginAttempts + 1 >= 5 && !this.isAccountLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // Lock for 2 hours
  }

  return this.updateOne(updates);
};

// ✅ Instance method to reset login attempts
vendorSchema.methods.resetLoginAttempts = async function () {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 },
  });
};

// ✅ Static method to check and update expired subscriptions
vendorSchema.statics.updateExpiredSubscriptions = async function () {
  const expiredVendors = await this.find({
    "subscription.endDate": { $lt: new Date() },
    isLocked: false,
    isApproved: true,
  });

  await this.updateMany(
    {
      "subscription.endDate": { $lt: new Date() },
      isLocked: false,
      isApproved: true,
    },
    {
      $set: {
        isLocked: true,
        lockedAt: new Date(),
        lockReason: "subscription_expired",
      },
    }
  );

  console.log(
    `🔒 Locked ${expiredVendors.length} vendors with expired subscriptions`
  );
  return expiredVendors.length;
};

// ✅ Static method to validate password strength
vendorSchema.statics.validatePassword = function (password) {
  const errors = [];

  if (!password) {
    errors.push("Password is required");
    return errors;
  }

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/[@$!%*?&]/.test(password)) {
    errors.push(
      "Password must contain at least one special character (@$!%*?&)"
    );
  }

  return errors;
};

// ✅ Index for performance
vendorSchema.index({ email: 1 });
vendorSchema.index({ isApproved: 1, isLocked: 1 });
vendorSchema.index({ "subscription.endDate": 1 });

module.exports = mongoose.model("Vendor", vendorSchema);
