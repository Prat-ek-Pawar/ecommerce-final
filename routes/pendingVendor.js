const express = require("express");
const router = express.Router();
const {
  approveVendor,
  denyVendor,
  getAllPendingVendors,
  denyVendorById,
  clearAllPending,
  approveVendorById,
} = require("../controllers/superAdmin/pendingVendors");
const {
  protect,
  protectVendor,
  protectSuperAdmin,
} = require("../middlewares/auth");
// No auth middleware here as it's triggered via email link
router.get("/approve", approveVendor);
router.get("/deny", denyVendor);
router.get("/pending-list", protectSuperAdmin,getAllPendingVendors);
router.post("/deny-vendor/:id", protectSuperAdmin,denyVendorById);
router.post("/clear-pending", protectSuperAdmin,clearAllPending);
router.post("/approve-vendor/:id", protectSuperAdmin,approveVendorById);
module.exports = router;
