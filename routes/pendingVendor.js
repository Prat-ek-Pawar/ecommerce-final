const express = require("express");
const router = express.Router();
const { approveVendor, denyVendor } = require("../controllers/superAdmin/pendingVendors");

// No auth middleware here as it's triggered via email link
router.get("/approve", approveVendor);
router.get("/deny", denyVendor);

module.exports = router;
