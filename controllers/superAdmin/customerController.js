const Customer = require("../../models/customer");
const Product = require("../../models/products");
const Vendor = require("../../models/vendor");
const asyncHandler = require("../../utils/asyncHandler");
const ErrorResponse = require("../../utils/errorResponse");
const mongoose = require("mongoose");

// ===== PUBLIC ROUTES (No Authentication Required) =====

// @desc    Create new customer order
// @route   POST /api/customers
// @access  Public
const createCustomer = asyncHandler(async (req, res, next) => {
  const { vendorId, productId, quantity, email, number, name, address } =
    req.body;

  // Validate required fields
  const requiredFields = {
    vendorId,
    productId,
    quantity,
    email,
    number,
    name,
    address,
  };

  const missingFields = Object.entries(requiredFields)
    .filter(
      ([key, value]) =>
        !value || (typeof value === "string" && value.trim() === "")
    )
    .map(([key]) => key);

  if (missingFields.length > 0) {
    return next(
      new ErrorResponse(
        `Missing required fields: ${missingFields.join(", ")}`,
        400
      )
    );
  }

  // Validate address completeness
  if (!address.street || !address.city || !address.state || !address.zipCode) {
    return next(
      new ErrorResponse(
        "Complete address is required (street, city, state, zipCode)",
        400
      )
    );
  }

  // Validate ObjectIds
  if (!mongoose.Types.ObjectId.isValid(vendorId)) {
    return next(new ErrorResponse("Invalid vendor ID", 400));
  }

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return next(new ErrorResponse("Invalid product ID", 400));
  }

  // Validate quantity
  if (!Number.isInteger(Number(quantity)) || Number(quantity) < 1) {
    return next(
      new ErrorResponse("Quantity must be a positive whole number", 400)
    );
  }

  try {
    // Verify vendor exists and is active
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return next(new ErrorResponse("Vendor not found", 404));
    }

    if (!vendor.isActive || !vendor.isApproved || vendor.isLocked) {
      return next(
        new ErrorResponse("Vendor is currently unavailable for orders", 400)
      );
    }

    // Verify product exists and is approved
    const product = await Product.findById(productId).populate(
      "vendor",
      "companyName isActive isApproved isLocked"
    );
    if (!product) {
      return next(new ErrorResponse("Product not found", 404));
    }

    if (!product.isApproved) {
      return next(
        new ErrorResponse("Product is not available for purchase", 400)
      );
    }

    // Verify product belongs to the specified vendor
    if (product.vendor._id.toString() !== vendorId) {
      return next(
        new ErrorResponse(
          "Product does not belong to the specified vendor",
          400
        )
      );
    }

    // Create customer order
    const customerData = {
      vendorId,
      productId,
      quantity: Number(quantity),
      email: email.toLowerCase().trim(),
      number: number.trim(),
      name: name.trim(),
      address: {
        street: address.street.trim(),
        city: address.city.trim(),
        state: address.state.trim(),
        zipCode: address.zipCode.trim(),
        country: address.country?.trim() || "India",
      },
    };

    const customer = await Customer.create(customerData);

    // Populate the response with product and vendor details
    const populatedCustomer = await Customer.findById(customer._id)
      .populate("productId", "title price images")
      .populate("vendorId", "companyName email phone")
      .lean();

    console.log(
      `📦 New order created: ${populatedCustomer.name} ordered ${quantity}x ${product.title} from ${vendor.companyName}`
    );

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: {
        customer: populatedCustomer,
        orderDetails: {
          orderId: customer._id,
          customerName: customer.name,
          productName: product.title,
          vendorName: vendor.companyName,
          quantity: customer.quantity,
          orderDate: customer.orderDate,
          orderTime: customer.orderTime,
          status: customer.deliveredFlag ? "Delivered" : "Pending",
          fullAddress: customer.fullAddress,
        },
      },
    });
  } catch (error) {
    console.error("❌ Error creating customer order:", error);

    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return next(
        new ErrorResponse(`Validation Error: ${errors.join(", ")}`, 400)
      );
    }

    return next(new ErrorResponse("Error creating order", 500));
  }
});

// @desc    Get customer order by ID
// @route   GET /api/customers/:id
// @access  Public
const getCustomerById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse("Invalid order ID", 400));
  }

  const customer = await Customer.findById(id)
    .populate("productId", "title price images description")
    .populate("vendorId", "companyName email phone address")
    .lean();

  if (!customer) {
    return next(new ErrorResponse("Order not found", 404));
  }

  res.status(200).json({
    success: true,
    data: {
      customer,
      orderDetails: {
        orderId: customer._id,
        customerName: customer.name,
        productName: customer.productId?.title,
        vendorName: customer.vendorId?.companyName,
        quantity: customer.quantity,
        orderDate: customer.orderDate,
        orderTime: customer.orderTime,
        status: customer.deliveredFlag ? "Delivered" : "Pending",
        fullAddress: customer.fullAddress,
      },
    },
  });
});

// @desc    Check order status by email and order ID
// @route   GET /api/customers/status/:id/:email
// @access  Public
const checkOrderStatus = asyncHandler(async (req, res, next) => {
  const { id, email } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse("Invalid order ID", 400));
  }

  const customer = await Customer.findOne({
    _id: id,
    email: email.toLowerCase(),
  })
    .populate("productId", "title price images")
    .populate("vendorId", "companyName phone")
    .lean();

  if (!customer) {
    return next(new ErrorResponse("Order not found or email mismatch", 404));
  }

  res.status(200).json({
    success: true,
    data: {
      orderId: customer._id,
      status: customer.deliveredFlag ? "Delivered" : "Pending",
      orderDate: customer.orderDate,
      orderTime: customer.orderTime,
      customerName: customer.name,
      product: customer.productId,
      vendor: customer.vendorId,
      quantity: customer.quantity,
      deliveryAddress: customer.fullAddress,
    },
  });
});

// ===== PROTECTED ROUTES (Authentication Required) =====

// @desc    Get all customers with advanced filtering (Admin/Vendor)
// @route   GET /api/customers/admin/all
// @access  Private (Admin) or Private (Vendor - own customers only)
const getAllCustomers = asyncHandler(async (req, res, next) => {
  const {
    page = 1,
    limit = 20,
    vendorId,
    productId,
    deliveredFlag,
    search,
    sortBy = "orderDate",
    sortOrder = "desc",
    startDate,
    endDate,
  } = req.query;

  const skip = (page - 1) * limit;
  const query = {};

  // If user is a vendor, only show their customers
  if (req.user.role === "vendor") {
    query.vendorId = req.user.id;
  } else if (vendorId && mongoose.Types.ObjectId.isValid(vendorId)) {
    // If admin, allow filtering by vendorId
    query.vendorId = vendorId;
  }

  // Other filters
  if (productId && mongoose.Types.ObjectId.isValid(productId)) {
    query.productId = productId;
  }

  if (deliveredFlag !== undefined) {
    query.deliveredFlag = deliveredFlag === "true";
  }

  // Date range filter
  if (startDate || endDate) {
    query.orderDate = {};
    if (startDate) query.orderDate.$gte = new Date(startDate);
    if (endDate) query.orderDate.$lte = new Date(endDate);
  }

  // Search functionality
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { number: { $regex: search, $options: "i" } },
      { "address.city": { $regex: search, $options: "i" } },
      { "address.state": { $regex: search, $options: "i" } },
    ];
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

  const customers = await Customer.find(query)
    .populate("productId", "title price images")
    .populate("vendorId", "companyName email phone")
    .skip(Number(skip))
    .limit(Number(limit))
    .sort(sortOptions)
    .lean();

  const total = await Customer.countDocuments(query);

  // Get summary statistics
  const stats = await Customer.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        deliveredOrders: { $sum: { $cond: ["$deliveredFlag", 1, 0] } },
        pendingOrders: { $sum: { $cond: ["$deliveredFlag", 0, 1] } },
        totalQuantity: { $sum: "$quantity" },
      },
    },
  ]);

  const summary = stats[0] || {
    totalOrders: 0,
    deliveredOrders: 0,
    pendingOrders: 0,
    totalQuantity: 0,
  };

  res.status(200).json({
    success: true,
    data: customers,
    pagination: {
      current: Number(page),
      pages: Math.ceil(total / limit),
      total,
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
    summary,
  });
});

// @desc    Update customer order (Admin/Vendor)
// @route   PUT /api/customers/admin/:id
// @access  Private (Admin) or Private (Vendor - own customers only)
const updateCustomer = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const allowedUpdates = [
    "quantity",
    "email",
    "number",
    "name",
    "address",
    "deliveredFlag",
  ];

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse("Invalid order ID", 400));
  }

  // Find customer
  let customer = await Customer.findById(id);
  if (!customer) {
    return next(new ErrorResponse("Order not found", 404));
  }

  // If vendor, ensure they own this customer order
  if (
    req.user.role === "vendor" &&
    customer.vendorId.toString() !== req.user.id
  ) {
    return next(
      new ErrorResponse(
        "Access denied. You can only update your own customer orders",
        403
      )
    );
  }

  const updates = {};
  Object.keys(req.body).forEach((key) => {
    if (allowedUpdates.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  // Validate quantity if being updated
  if (
    updates.quantity &&
    (!Number.isInteger(Number(updates.quantity)) ||
      Number(updates.quantity) < 1)
  ) {
    return next(
      new ErrorResponse("Quantity must be a positive whole number", 400)
    );
  }

  // Update customer
  Object.keys(updates).forEach((key) => {
    if (key === "address" && typeof updates[key] === "object") {
      // Merge address updates
      customer.address = { ...customer.address.toObject(), ...updates[key] };
    } else {
      customer[key] = updates[key];
    }
  });

  await customer.save();

  // Get updated customer with populated fields
  const updatedCustomer = await Customer.findById(id)
    .populate("productId", "title price")
    .populate("vendorId", "companyName")
    .lean();

  console.log(
    `📝 Customer order updated: ${customer.name} (Order: ${id}) by ${req.user.email}`
  );

  res.status(200).json({
    success: true,
    message: "Order updated successfully",
    data: updatedCustomer,
  });
});

// @desc    Delete customer order (Admin/Vendor)
// @route   DELETE /api/customers/admin/:id
// @access  Private (Admin) or Private (Vendor - own customers only)
const deleteCustomer = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse("Invalid order ID", 400));
  }

  const customer = await Customer.findById(id);
  if (!customer) {
    return next(new ErrorResponse("Order not found", 404));
  }

  // If vendor, ensure they own this customer order
  if (
    req.user.role === "vendor" &&
    customer.vendorId.toString() !== req.user.id
  ) {
    return next(
      new ErrorResponse(
        "Access denied. You can only delete your own customer orders",
        403
      )
    );
  }

  await customer.deleteOne();

  console.log(
    `❌ Customer order deleted: ${customer.name} (Order: ${id}) by ${req.user.email}`
  );

  res.status(200).json({
    success: true,
    message: "Order deleted successfully",
    data: {
      deletedOrder: {
        id: customer._id,
        customerName: customer.name,
        email: customer.email,
        orderDate: customer.orderDate,
      },
    },
  });
});

// @desc    Mark order as delivered (Admin/Vendor)
// @route   PATCH /api/customers/admin/:id/deliver
// @access  Private (Admin) or Private (Vendor - own customers only)
const markAsDelivered = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse("Invalid order ID", 400));
  }

  const customer = await Customer.findById(id);
  if (!customer) {
    return next(new ErrorResponse("Order not found", 404));
  }

  // If vendor, ensure they own this customer order
  if (
    req.user.role === "vendor" &&
    customer.vendorId.toString() !== req.user.id
  ) {
    return next(
      new ErrorResponse(
        "Access denied. You can only update your own customer orders",
        403
      )
    );
  }

  if (customer.deliveredFlag) {
    return next(new ErrorResponse("Order is already marked as delivered", 400));
  }

  await customer.markAsDelivered();

  console.log(
    `✅ Order marked as delivered: ${customer.name} (Order: ${id}) by ${req.user.email}`
  );

  res.status(200).json({
    success: true,
    message: "Order marked as delivered successfully",
    data: {
      orderId: customer._id,
      customerName: customer.name,
      deliveredFlag: customer.deliveredFlag,
      updatedAt: customer.updatedAt,
    },
  });
});

// @desc    Get customer analytics (Admin/Vendor)
// @route   GET /api/customers/admin/analytics
// @access  Private (Admin) or Private (Vendor - own analytics only)
const getCustomerAnalytics = asyncHandler(async (req, res, next) => {
  const { days = 30, vendorId } = req.query;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days));

  let matchQuery = { orderDate: { $gte: startDate } };

  // If user is a vendor, only show their analytics
  if (req.user.role === "vendor") {
    matchQuery.vendorId = new mongoose.Types.ObjectId(req.user.id);
  } else if (vendorId && mongoose.Types.ObjectId.isValid(vendorId)) {
    // If admin, allow filtering by vendorId
    matchQuery.vendorId = new mongoose.Types.ObjectId(vendorId);
  }

  const analytics = await Customer.aggregate([
    { $match: matchQuery },
    {
      $facet: {
        overview: [
          {
            $group: {
              _id: null,
              totalOrders: { $sum: 1 },
              deliveredOrders: { $sum: { $cond: ["$deliveredFlag", 1, 0] } },
              pendingOrders: { $sum: { $cond: ["$deliveredFlag", 0, 1] } },
              totalQuantity: { $sum: "$quantity" },
              uniqueCustomers: { $addToSet: "$email" },
            },
          },
          {
            $project: {
              totalOrders: 1,
              deliveredOrders: 1,
              pendingOrders: 1,
              totalQuantity: 1,
              uniqueCustomers: { $size: "$uniqueCustomers" },
              deliveryRate: {
                $round: [
                  {
                    $multiply: [
                      { $divide: ["$deliveredOrders", "$totalOrders"] },
                      100,
                    ],
                  },
                  2,
                ],
              },
            },
          },
        ],
        dailyOrders: [
          {
            $group: {
              _id: {
                year: { $year: "$orderDate" },
                month: { $month: "$orderDate" },
                day: { $dayOfMonth: "$orderDate" },
              },
              orders: { $sum: 1 },
              delivered: { $sum: { $cond: ["$deliveredFlag", 1, 0] } },
            },
          },
          {
            $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
          },
        ],
        topProducts: [
          {
            $group: {
              _id: "$productId",
              orderCount: { $sum: 1 },
              totalQuantity: { $sum: "$quantity" },
            },
          },
          {
            $lookup: {
              from: "products",
              localField: "_id",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $unwind: "$product",
          },
          {
            $project: {
              productName: "$product.title",
              orderCount: 1,
              totalQuantity: 1,
            },
          },
          {
            $sort: { orderCount: -1 },
          },
          {
            $limit: 10,
          },
        ],
        topCities: [
          {
            $group: {
              _id: "$address.city",
              orderCount: { $sum: 1 },
            },
          },
          {
            $sort: { orderCount: -1 },
          },
          {
            $limit: 10,
          },
        ],
      },
    },
  ]);

  const stats = analytics[0];

  res.status(200).json({
    success: true,
    data: {
      overview: stats.overview[0] || {},
      dailyOrders: stats.dailyOrders || [],
      topProducts: stats.topProducts || [],
      topCities: stats.topCities || [],
      period: `Last ${days} days`,
    },
  });
});

// @desc    Bulk update delivery status (Admin/Vendor)
// @route   PATCH /api/customers/admin/bulk-deliver
// @access  Private (Admin) or Private (Vendor - own customers only)
const bulkMarkAsDelivered = asyncHandler(async (req, res, next) => {
  const { customerIds } = req.body;

  if (!Array.isArray(customerIds) || customerIds.length === 0) {
    return next(new ErrorResponse("Customer IDs array is required", 400));
  }

  // Validate all IDs
  const invalidIds = customerIds.filter(
    (id) => !mongoose.Types.ObjectId.isValid(id)
  );
  if (invalidIds.length > 0) {
    return next(new ErrorResponse("Invalid customer IDs provided", 400));
  }

  let query = { _id: { $in: customerIds } };

  // If vendor, ensure they only update their own customers
  if (req.user.role === "vendor") {
    query.vendorId = req.user.id;
  }

  const result = await Customer.updateMany(query, {
    $set: { deliveredFlag: true },
  });

  console.log(
    `📦 Bulk delivery update: ${result.modifiedCount} orders marked as delivered by ${req.user.email}`
  );

  res.status(200).json({
    success: true,
    message: `${result.modifiedCount} orders marked as delivered successfully`,
    data: {
      matched: result.matchedCount,
      modified: result.modifiedCount,
    },
  });
});

module.exports = {
  // Public routes
  createCustomer,
  getCustomerById,
  checkOrderStatus,

  // Protected routes
  getAllCustomers,
  updateCustomer,
  deleteCustomer,
  markAsDelivered,
  getCustomerAnalytics,
  bulkMarkAsDelivered,
};
