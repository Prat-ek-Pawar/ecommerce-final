const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },

    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: "Quantity must be a whole number",
      },
    },

    deliveredFlag: {
      type: Boolean,
      default: false,
      index: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (email) {
          return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
        },
        message: "Please enter a valid email address",
      },
    },

    number: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function (phone) {
          return /^[\+]?[1-9][\d]{0,15}$/.test(phone);
        },
        message: "Please enter a valid phone number",
      },
    },

    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    address: {
      street: {
        type: String,
        required: true,
        trim: true,
      },
      city: {
        type: String,
        required: true,
        trim: true,
      },
      state: {
        type: String,
        required: true,
        trim: true,
      },
      zipCode: {
        type: String,
        required: true,
        trim: true,
      },
      country: {
        type: String,
        required: true,
        trim: true,
        default: "India",
      },
    },

    orderDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    orderTime: {
      type: String,
      required: true,
      default: function () {
        return new Date().toLocaleTimeString("en-US", {
          hour12: false,
          timeZone: "Asia/Kolkata",
        });
      },
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
    collection: "customers",
  }
);

// Indexes for better query performance
customerSchema.index({ vendorId: 1, productId: 1 });
customerSchema.index({ email: 1 });
customerSchema.index({ orderDate: -1 });
customerSchema.index({ deliveredFlag: 1, orderDate: -1 });

// Virtual for full address
customerSchema.virtual("fullAddress").get(function () {
  return `${this.address.street}, ${this.address.city}, ${this.address.state} ${this.address.zipCode}, ${this.address.country}`;
});

// Instance method to mark as delivered
customerSchema.methods.markAsDelivered = function () {
  this.deliveredFlag = true;
  return this.save();
};

// Static method to find undelivered orders
customerSchema.statics.findUndeliveredOrders = function () {
  return this.find({ deliveredFlag: false }).sort({ orderDate: -1 });
};

// Pre-save middleware to ensure orderTime is set
customerSchema.pre("save", function (next) {
  if (this.isNew && !this.orderTime) {
    this.orderTime = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      timeZone: "Asia/Kolkata",
    });
  }
  next();
});

const Customer = mongoose.model("Customer", customerSchema);

module.exports = Customer;
