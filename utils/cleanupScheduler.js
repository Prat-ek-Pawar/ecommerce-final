// utils/cleanupScheduler.js
const cron = require("node-cron");
const { cleanupOldFiles } = require("./cloudinary");
const path = require("path");
const fs = require("fs");

/**
 * Schedule automatic cleanup of temporary files
 * Runs every hour to clean files older than 1 hour
 */
const scheduleCleanup = () => {
  // Run cleanup every hour (0 minutes past the hour)
  cron.schedule("0 * * * *", async () => {
    try {
      console.log("🧹 Starting scheduled cleanup of temporary files...");

      const uploadDirs = [
        path.join(process.cwd(), "uploads", "products"),
        path.join(process.cwd(), "uploads", "avatars"),
      ];

      const cleanupPromises = uploadDirs.map(
        (dir) => cleanupOldFiles(dir, 60 * 60 * 1000) // 1 hour
      );

      await Promise.all(cleanupPromises);

      console.log("✅ Scheduled cleanup completed");
    } catch (error) {
      console.error("❌ Scheduled cleanup failed:", error.message);
    }
  });

  // Also run cleanup on server startup
  setTimeout(async () => {
    try {
      console.log("🧹 Running initial cleanup on server startup...");

      const uploadDirs = [
        path.join(process.cwd(), "uploads", "products"),
        path.join(process.cwd(), "uploads", "avatars"),
      ];

      const cleanupPromises = uploadDirs.map(
        (dir) => cleanupOldFiles(dir, 30 * 60 * 1000) // 30 minutes on startup
      );

      await Promise.all(cleanupPromises);

      console.log("✅ Initial cleanup completed");
    } catch (error) {
      console.error("❌ Initial cleanup failed:", error.message);
    }
  }, 5000); // Wait 5 seconds after server starts

  console.log("📅 Cleanup scheduler initialized - will run every hour");
};

/**
 * Manual cleanup function for immediate use
 * @param {number} maxAge - Maximum age in milliseconds
 */
const runManualCleanup = async (maxAge = 60 * 60 * 1000) => {
  try {
    console.log("🧹 Running manual cleanup...");

    const uploadDirs = [
      path.join(process.cwd(), "uploads", "products"),
      path.join(process.cwd(), "uploads", "avatars"),
    ];

    let totalDeleted = 0;

    for (const dir of uploadDirs) {
      if (!fs.existsSync(dir)) continue;

      const files = await fs.promises.readdir(dir);
      const now = Date.now();

      for (const file of files) {
        const filePath = path.join(dir, file);
        const stats = await fs.promises.stat(filePath);

        if (now - stats.mtime.getTime() > maxAge) {
          await fs.promises.unlink(filePath);
          totalDeleted++;
          console.log(`🗑️ Deleted: ${filePath}`);
        }
      }
    }

    console.log(`✅ Manual cleanup completed - deleted ${totalDeleted} files`);
    return totalDeleted;
  } catch (error) {
    console.error("❌ Manual cleanup failed:", error.message);
    throw error;
  }
};

/**
 * Get storage statistics
 */
const getStorageStats = async () => {
  try {
    const uploadDirs = [
      path.join(process.cwd(), "uploads", "products"),
      path.join(process.cwd(), "uploads", "avatars"),
    ];

    const stats = {
      totalFiles: 0,
      totalSize: 0,
      oldFiles: 0,
      directories: {},
    };

    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    for (const dir of uploadDirs) {
      const dirName = path.basename(dir);
      stats.directories[dirName] = {
        files: 0,
        size: 0,
        oldFiles: 0,
      };

      if (!fs.existsSync(dir)) continue;

      const files = await fs.promises.readdir(dir);

      for (const file of files) {
        const filePath = path.join(dir, file);
        const fileStats = await fs.promises.stat(filePath);

        stats.totalFiles++;
        stats.totalSize += fileStats.size;
        stats.directories[dirName].files++;
        stats.directories[dirName].size += fileStats.size;

        if (now - fileStats.mtime.getTime() > oneHour) {
          stats.oldFiles++;
          stats.directories[dirName].oldFiles++;
        }
      }
    }

    return stats;
  } catch (error) {
    console.error("❌ Failed to get storage stats:", error.message);
    throw error;
  }
};

/**
 * Emergency cleanup - delete all temp files regardless of age
 */
const emergencyCleanup = async () => {
  try {
    console.log("🚨 Running emergency cleanup - deleting ALL temp files...");

    const uploadDirs = [
      path.join(process.cwd(), "uploads", "products"),
      path.join(process.cwd(), "uploads", "avatars"),
    ];

    let totalDeleted = 0;

    for (const dir of uploadDirs) {
      if (!fs.existsSync(dir)) continue;

      const files = await fs.promises.readdir(dir);

      for (const file of files) {
        // Only delete files that start with "temp_" to be safe
        if (file.startsWith("temp_")) {
          const filePath = path.join(dir, file);
          await fs.promises.unlink(filePath);
          totalDeleted++;
          console.log(`🗑️ Emergency deleted: ${filePath}`);
        }
      }
    }

    console.log(
      `✅ Emergency cleanup completed - deleted ${totalDeleted} files`
    );
    return totalDeleted;
  } catch (error) {
    console.error("❌ Emergency cleanup failed:", error.message);
    throw error;
  }
};

module.exports = {
  scheduleCleanup,
  runManualCleanup,
  getStorageStats,
  emergencyCleanup,
};
