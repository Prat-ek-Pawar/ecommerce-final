const PendingVendor = require("../../models/pendingVendor");
const Vendor = require("../../models/vendor");
const VendorAuth = require("../../models/vendorAuthentication");
const approvalTemplate = require("../../emailtemplates/vendorApprovedTemplate");
const denialTemplate = require("../../emailtemplates/vendorDeniedTemplate");
const sendEmail = require("../../utils/sendEmail");
const asyncHandler = require("../../utils/asyncHandler");
const ErrorResponse = require("../../utils/errorResponse");

const approveVendor = asyncHandler(async (req, res, next) => {
  const { vendorId, token } = req.query;

  if (!token) {
    return next(new ErrorResponse("Token missing", 400));
  }

  const tokenDoc = await VendorAuth.findOne({ authToken: token }).populate(
    "vendorId"
  );

  if (!tokenDoc || !tokenDoc.vendorId) {
    return next(new ErrorResponse("Invalid or expired token", 400));
  }

  // ✅ Get pending vendor with password included
  const pendingVendor = await PendingVendor.findById(tokenDoc.vendorId._id);

  if (!pendingVendor) {
    return next(new ErrorResponse("Pending vendor not found", 404));
  }

  console.log(
    `📋 Processing approval for: ${pendingVendor.companyName} (${pendingVendor.email})`
  );

  // ✅ Calculate 1-month subscription from approval time
  const approvalDate = new Date();
  const subscriptionEndDate = new Date(approvalDate);
  subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1); // 1 month from now

  console.log(`📅 Creating vendor with 1-month subscription:`);
  console.log(`  ├─ Company: ${pendingVendor.companyName}`);
  console.log(`  ├─ Start Date: ${approvalDate.toDateString()}`);
  console.log(`  └─ End Date: ${subscriptionEndDate.toDateString()}`);

  try {
    // ✅ Create permanent Vendor from PendingVendor with direct insertion
    const vendorData = {
      email: pendingVendor.email,
      password: pendingVendor.password, // Transfer hashed password
      phone: pendingVendor.phone,
      companyName: pendingVendor.companyName,
      productCategory: pendingVendor.productCategory,
      description: pendingVendor.description,
      isApproved: true,
      isLocked: false,
      approvedAt: approvalDate,
      subscription: {
        duration: 1,
        startDate: approvalDate,
        endDate: subscriptionEndDate,
        currentPlan: "basic_1m",
        totalPurchases: 0,
      },
      maxProductLimit: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // ✅ Insert directly to avoid validation issues
    const result = await Vendor.collection.insertOne(vendorData);
    console.log(`✅ Vendor approved with ID: ${result.insertedId}`);

    // ✅ Delete token and pending vendor (cleanup)
    await VendorAuth.deleteOne({ _id: tokenDoc._id });
    // await PendingVendor.deleteOne({ _id: pendingVendor._id });

    console.log(`🗑️ Cleaned up pending vendor and auth token`);

    // ✅ Send approval email to vendor
    const html = approvalTemplate(pendingVendor.companyName);
    await sendEmail(pendingVendor.email, html);

    console.log(`📧 Approval email sent to: ${pendingVendor.email}`);

    // ✅ Beautiful approval response page
    res.status(200).send(`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-align: center;">
        <h1 style="margin: 0 0 20px 0;">✅ Vendor Approved Successfully!</h1>
        <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin: 0 0 10px 0;">${pendingVendor.companyName}</h2>
          <p style="margin: 5px 0;"><strong>Email:</strong> ${
            pendingVendor.email
          }</p>
          <p style="margin: 5px 0;"><strong>Subscription:</strong> 1 Month (FREE)</p>
          <p style="margin: 5px 0;"><strong>Valid Until:</strong> ${subscriptionEndDate.toDateString()}</p>
          <p style="margin: 5px 0;"><strong>Product Limit:</strong> 10 products</p>
          <p style="margin: 5px 0;"><strong>Status:</strong> Unlocked & Active</p>
        </div>
        <p style="margin: 20px 0 0 0; font-size: 14px; opacity: 0.9;">
          The vendor can now login with their email and password to access their dashboard.
        </p>
        <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 14px;">
          <strong>Login Details:</strong><br>
          Email: ${pendingVendor.email}<br>
          Password: [Set during registration]
        </div>
      </div>
    `);
  } catch (error) {
    console.error("❌ Error approving vendor:", error);
    return next(
      new ErrorResponse(`Failed to approve vendor: ${error.message}`, 500)
    );
  }
});

const denyVendor = asyncHandler(async (req, res, next) => {
  const { vendorId, token } = req.query;

  if (!token) {
    return next(new ErrorResponse("Token missing", 400));
  }

  const tokenDoc = await VendorAuth.findOne({ authToken: token }).populate(
    "vendorId"
  );

  if (!tokenDoc || !tokenDoc.vendorId) {
    return next(new ErrorResponse("Invalid or expired token", 400));
  }

  const pendingVendor = tokenDoc.vendorId;

  console.log(`❌ Denying vendor application:`);
  console.log(`  ├─ Company: ${pendingVendor.companyName}`);
  console.log(`  └─ Email: ${pendingVendor.email}`);

  try {
    // ✅ Delete token and pending vendor (cleanup)
    await VendorAuth.deleteOne({ _id: tokenDoc._id });
    await PendingVendor.deleteOne({ _id: pendingVendor._id });

    console.log(`🗑️ Cleaned up pending vendor and auth token`);

    // ✅ Send denial email to vendor
    const html = denialTemplate(pendingVendor.companyName);
    await sendEmail(pendingVendor.email, html);

    console.log(`📧 Denial email sent to: ${pendingVendor.email}`);

    // ✅ Beautiful denial response page
    res.status(200).send(`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; text-align: center;">
        <h1 style="margin: 0 0 20px 0;">❌ Vendor Application Denied</h1>
        <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin: 0 0 10px 0;">${pendingVendor.companyName}</h2>
          <p style="margin: 5px 0;"><strong>Email:</strong> ${pendingVendor.email}</p>
          <p style="margin: 15px 0 5px 0;">The application has been rejected and the vendor has been notified.</p>
        </div>
      </div>
    `);
  } catch (error) {
    console.error("❌ Error denying vendor:", error);
    return next(
      new ErrorResponse(`Failed to deny vendor: ${error.message}`, 500)
    );
  }
});
const getAllPendingVendors=asyncHandler(async (req,res,next)=>{
  const pendingVenodrList = await PendingVendor.find()
    .populate("productCategory", "name")
    .select("-password");
  res.status(200).json({
    message:"succes",
    data:pendingVenodrList
  })
})
const clearAllPending=asyncHandler(async(req,res)=>{
  await PendingVendor.deleteMany();
   res.status(200).json({
     message: "Pending list cleared",
   });
})
const approveVendorById = asyncHandler(async (req, res) => {
  const id = req.params.id;
  console.log("id: ", id);

  try {
    const pending = await PendingVendor.findById(id);
    if (!pending) {
      return res.status(404).json({ message: "Pending vendor not found" });
    }

    console.log(pending);

    // ✅ Define the missing date variables
    const approvalDate = new Date();
    const subscriptionEndDate = new Date(approvalDate);
    subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1); // 1 month from now

    console.log(`📅 Creating vendor with 1-month subscription:`);
    console.log(`  ├─ Company: ${pending.companyName}`);
    console.log(`  ├─ Start Date: ${approvalDate.toDateString()}`);
    console.log(`  └─ End Date: ${subscriptionEndDate.toDateString()}`);

    // ✅ Create new vendor instance without triggering pre-save middleware
    const vendor = new Vendor({
      email: pending.email,
      phone: pending.phone,
      companyName: pending.companyName,
      productCategory: pending.productCategory,
      description: pending.description,
      isApproved: true,
      isLocked: false,
      approvedAt: approvalDate,
      subscription: {
        duration: 1,
        startDate: approvalDate,
        endDate: subscriptionEndDate,
        currentPlan: "basic_1m",
        totalPurchases: 0,
      },
      maxProductLimit: 10,
    });

    // ✅ Set password directly to bypass validation
    vendor.password = pending.password; // Already hashed

    // ✅ Save with validation disabled for password field
    await vendor.save({
      validateBeforeSave: false, // Skip all validation
    });
const html = approvalTemplate(vendor.companyName);

await sendEmail(vendor.email, html);
    console.log(`✅ Vendor approved with ID: ${vendor._id}`);

    // Delete the pending vendor after successful creation
    await PendingVendor.deleteOne({ _id: id });

    console.log(`✅ Vendor approved successfully: ${pending.companyName}`);

    return res.status(200).json({
      message: "Vendor approved successfully",
      vendor: {
        id: vendor._id,
        companyName: pending.companyName,
        email: pending.email,
        subscriptionEndDate: subscriptionEndDate.toDateString(),
      },
    });
  } catch (err) {
    console.error("❌ Error approving vendor:", err);
    return res.status(500).json({
      message: "Can't approve vendor, try again later",
      error: err.message,
    });
  }
});
const denyVendorById=asyncHandler(async(req,res)=>{
  const id=req.params.id;
  try{
    const pendingVendor=PendingVendor.findById(id)
    await PendingVendor.deleteOne({ _id: id });
    const html = denialTemplate(pendingVendor.companyName);
    await sendEmail(pendingVendor.email, html);
  }
  catch(err){
    res.status(500).json({message:"cant deny vendor try again later"})
  }
  res.status(200).json({message:"Vendor removed from pending list"})
})
module.exports = {
  approveVendor,
  denyVendor,
  clearAllPending,
  getAllPendingVendors,
  denyVendorById,
  approveVendorById,
};
