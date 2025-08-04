const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const connectDB = require("./config/DBconnect");
const adminRoutes = require("./routes/pendingVendor");
const categoriesRoute = require("./routes/categoriesRoutes");
const signIn = require("./routes/signin");
const errorHandler = require("./middlewares/errorHandler");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productsRoutes");
const vendorRoutes = require("./routes/vendorRoutes");
const vendorProfileRoutes = require("./routes/vendorProfileRoutes");

const app = express();
const cookieParser = require("cookie-parser");
app.use(cookieParser());
// Create upload directories if they don't exist
const createUploadDirs = () => {
  const dirs = ["uploads/products", "uploads/avatars"];

  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  });
};

// 🔗 MongoDB connection
connectDB();

// Create directories
createUploadDirs();

// 🧩 Middleware
app.use(cors()); // Allow all origins
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev")); // Log all requests

// Serve static files from uploads directory
app.use("/uploads", express.static("uploads"));

// 🚏 Routes
app.use("/api/admin", adminRoutes);
app.use("/api/categories", categoriesRoute);
app.use("/api/vendor", signIn);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/vendor/profile", vendorProfileRoutes);

// ✅ Health check
app.get("/", (req, res) => {
  res.send("✅ Server is up and running!");
});

// ❌ 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// 🧯 Global error handler
app.use(errorHandler);

// 🚀 Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server listening at http://localhost:${PORT}`);
});
