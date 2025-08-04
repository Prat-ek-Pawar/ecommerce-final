# Categories routes and usage
// Public Routes (No Authentication)
GET    /api/categories          // Get all categories (with pagination/search)
GET    /api/categories/:id      // Get single category

// Protected Routes (Super Admin Only)
POST   /api/categories          // Create category
PUT    /api/categories/:id      // Update category
DELETE /api/categories/:id      // delete category
Search functionality: GET /api/categories?search=electronics
Pagination: GET /api/categories?page=1&limit=10      // no need if categories are less than 10


--------------------Products Routes ---------------------
// PUBLIC (No Auth)
GET    /api/products                     // All approved products
GET    /api/products/search              // Search products
GET    /api/products/category/:id        // Products by category
GET    /api/products/vendor/:id          // Public vendor store
GET    /api/products/:id                 // Single product

// VENDOR (Auth Required)
GET    /api/products/my-products         // Own products
POST   /api/products                     // Create with images
PUT    /api/products/:id                 // Update own
DELETE /api/products/:id                 // Delete own
POST   /api/products/:id/images          // Add images
PUT    /api/products/:id/images/:index   // Replace image
DELETE /api/products/:id/images/:index   // Delete image

// ADMIN (Super Admin Auth)
GET    /api/products/admin/all           // All products
GET    /api/products/admin/pending       // Pending approval
GET    /api/products/admin/analytics     // Dashboard stats
PATCH  /api/products/:id/approve         // Approve/reject
PUT    /api/products/admin/:id           // Update any product
DELETE /api/products/admin/:id           // Delete specific product
PATCH  /api/products/admin/bulk-approve  // Bulk operations

---------------------------Vendor ------------------------------
  public: {
        search: "GET /api/vendor/search",
        sendOtp: "POST /api/vendor/send-otp",
        signup: "POST /api/vendor/signup"
      },
      admin: 
        analytics: "GET /api/vendor/admin/analytics",
        allVendors: "GET /api/vendor/admin/all",
        singleVendor: "GET /api/vendor/admin/:vendorId",
        updateVendor: "PUT /api/vendor/admin/:vendorId",
        deleteVendor: "DELETE /api/vendor/admin/:vendorId",
        updateSubscription: "PATCH /api/vendor/admin/:vendorId/subscription",
        approve: "PATCH /api/vendor/admin/:vendorId/approve",
        toggleLock: "PATCH /api/vendor/admin/:vendorId/toggle-lock",
        bulkApprove: "PATCH /api/vendor/admin/bulk-approve",
        bulkSubscription: "PATCH /api/vendor/admin/bulk-subscription",
        subscriptionStats: "GET /api/vendor/admin/subscription-stats"
