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
const customerRoutes=require("./routes/customersRoutes")

const app = express();
const cookieParser = require("cookie-parser");

// 🔗 MongoDB connection
connectDB();
const { scheduleBannerExpiry } = require("./utils/bannerScheduler");
scheduleBannerExpiry();
// Create upload directories if they don't exist
const createUploadDirs = () => {
  const dirs = ["uploads/products", "uploads/avatars", "uploads/banners"]; // Added banners
  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  });
};

createUploadDirs();

// 🧩 Middleware - ORDER IS IMPORTANT!
app.use(cookieParser());

// CORS configuration - ONLY ONE CORS MIDDLEWARE
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // Allow localhost origins
      if (
        origin.includes("localhost") ||
        origin.includes("127.0.0.1") ||
        origin.includes("file://")
      ) {
        return callback(null, true);
      }

      // For development, allow all origins
      callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
  })
);

// Remove this line - it's causing the duplicate CORS issue:
// app.use(cors()); // <-- DELETE THIS LINE

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

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
app.use("/api/customer",customerRoutes)
app.use("/api/banners", require("./routes/bannerRoutes"));
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
