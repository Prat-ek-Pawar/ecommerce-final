const mongoose = require("mongoose");
const dotenv = require("dotenv");
const SuperAdmin = require("./models/superadmin");

dotenv.config();

const seedSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const email = "admin@gmail.com";

    // Delete existing admin
    await SuperAdmin.findOneAndDelete({ email });

    // Create fresh one
    await SuperAdmin.create({
      email,
      password: "admin@123",
      name: "Master Admin",
    });

    console.log("🎉 Super Admin seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding super admin:", err);
    process.exit(1);
  }
};

seedSuperAdmin();
