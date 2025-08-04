// seedSuperAdmin.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const SuperAdmin = require("./models/superadmin"); // adjust path if needed

dotenv.config(); // load .env (for DB URL etc.)

const seedSuperAdmin = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://127.0.0.1:27017/yourDB"
    );

    const exists = await SuperAdmin.findOne({ email: "admin@gmail.com" });

    if (exists) {
      console.log("✅ Super Admin already exists. Skipping seeding.");
      process.exit(0);
    }

    await SuperAdmin.create({
      email: "admin@gmail.com",
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
