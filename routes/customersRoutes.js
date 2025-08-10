const express = require("express");
const router = express.Router();

// Import customer controllers
const {
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
} = require("../controllers/superAdmin/customerController");

// Import auth middleware
const {
  protectVendor,
  protectSuperAdmin,
  protectVendorOrAdmin,
} = require("../middlewares/auth");

// ===== PUBLIC ROUTES (No Authentication Required) =====

// @desc    Create new customer order
// @route   POST /api/customers
// @access  Public
// @body    { vendorId, productId, quantity, email, number, name, address }
router.post("/", createCustomer);

// @desc    Get customer order by ID
// @route   GET /api/customers/:id
// @access  Public
router.get("/:id", getCustomerById);

// @desc    Check order status by email and order ID
// @route   GET /api/customers/status/:id/:email
// @access  Public
// @note    Customer can check their order status using order ID and email
router.get("/status/:id/:email", checkOrderStatus);

// ===== PROTECTED ROUTES (Authentication Required) =====

// @desc    Get comprehensive customer analytics
// @route   GET /api/customers/admin/analytics?days=30&vendorId=id
// @access  Private (Admin or Vendor - own analytics only)
router.get("/admin/analytics", protectVendorOrAdmin, getCustomerAnalytics);

// @desc    Get all customers with advanced filters and pagination
// @route   GET /api/customers/admin/all
// @access  Private (Admin or Vendor - own customers only)
// @query   page, limit, vendorId, productId, deliveredFlag, search, sortBy, sortOrder, startDate, endDate
router.get("/admin/all", protectVendorOrAdmin, getAllCustomers);

// @desc    Update customer order details
// @route   PUT /api/customers/admin/:id
// @access  Private (Admin or Vendor - own customers only)
// @body    { quantity, email, number, name, address, deliveredFlag }
router.put("/admin/:id", protectVendorOrAdmin, updateCustomer);

// @desc    Delete customer order
// @route   DELETE /api/customers/admin/:id
// @access  Private (Admin or Vendor - own customers only)
router.delete("/admin/:id", protectVendorOrAdmin, deleteCustomer);

// @desc    Mark order as delivered
// @route   PATCH /api/customers/admin/:id/deliver
// @access  Private (Admin or Vendor - own customers only)
router.patch("/admin/:id/deliver", protectVendorOrAdmin, markAsDelivered);

// @desc    Bulk mark orders as delivered
// @route   PATCH /api/customers/admin/bulk-deliver
// @access  Private (Admin or Vendor - own customers only)
// @body    { customerIds: ["id1", "id2", "id3"] }
router.patch("/admin/bulk-deliver", protectVendorOrAdmin, bulkMarkAsDelivered);

// ===== VENDOR-SPECIFIC ROUTES =====

// @desc    Get vendor's customers only
// @route   GET /api/customers/vendor/my-customers
// @access  Private (Vendor Only)
router.get("/vendor/my-customers", protectVendor, (req, res, next) => {
  // Set vendorId to current vendor and call getAllCustomers
  req.query.vendorId = req.user.id;
  getAllCustomers(req, res, next);
});

// @desc    Get vendor's customer analytics
// @route   GET /api/customers/vendor/my-analytics
// @access  Private (Vendor Only)
router.get("/vendor/my-analytics", protectVendor, (req, res, next) => {
  // Set vendorId to current vendor and call getCustomerAnalytics
  req.query.vendorId = req.user.id;
  getCustomerAnalytics(req, res, next);
});

// ===== ERROR HANDLING =====


module.exports = router;
