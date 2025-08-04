// utils/cloudinary.js
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const path = require("path");

// Configure Cloudinary - Fixed to use consistent env variable names
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Changed from CLOUDINARY_NAME
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload single image to Cloudinary and delete local file
 * @param {string} localFilePath - Path to local file
 * @param {string} folder - Cloudinary folder (products/avatars)
 * @param {Object} options - Additional upload options
 * @returns {Object} Upload result with public_id and secure_url
 */
const uploadToCloudinary = async (
  localFilePath,
  folder = "products",
  options = {}
) => {
  try {
    if (!fs.existsSync(localFilePath)) {
      throw new Error(`File not found: ${localFilePath}`);
    }

    const uploadOptions = {
      folder: `marketplace/${folder}`,
      resource_type: "image",
      transformation: [
        {
          width: folder === "products" ? 800 : 300,
          height: folder === "products" ? 800 : 300,
          crop: "limit",
          quality: "auto",
          format: "auto",
        },
      ],
      ...options,
    };

    console.log(`☁️ Uploading ${localFilePath} to Cloudinary...`);

    const result = await cloudinary.uploader.upload(
      localFilePath,
      uploadOptions
    );

    // Delete local file after successful upload
    await deleteLocalFile(localFilePath);

    console.log(`✅ Successfully uploaded to Cloudinary: ${result.public_id}`);

    return {
      public_id: result.public_id,
      url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    };
  } catch (error) {
    console.error(
      `❌ Cloudinary upload failed for ${localFilePath}:`,
      error.message
    );

    // Clean up local file even if upload fails
    await deleteLocalFile(localFilePath);

    throw new Error(`Failed to upload image: ${error.message}`);
  }
};

/**
 * Upload multiple images to Cloudinary
 * @param {Array} localFilePaths - Array of local file paths
 * @param {string} folder - Cloudinary folder
 * @returns {Array} Array of upload results
 */
const uploadMultipleToCloudinary = async (
  localFilePaths,
  folder = "products"
) => {
  try {
    const uploadPromises = localFilePaths.map((filePath, index) =>
      uploadToCloudinary(filePath, folder, {
        public_id: `${Date.now()}_${index}`,
      })
    );

    const results = await Promise.allSettled(uploadPromises);

    const successful = [];
    const failed = [];

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        successful.push({
          ...result.value,
          index,
        });
      } else {
        failed.push({
          index,
          filePath: localFilePaths[index],
          error: result.reason.message,
        });
      }
    });

    if (failed.length > 0) {
      console.warn(`⚠️ ${failed.length} uploads failed:`, failed);
    }

    console.log(
      `✅ Successfully uploaded ${successful.length}/${localFilePaths.length} images`
    );

    return {
      successful,
      failed,
      totalUploaded: successful.length,
      totalFailed: failed.length,
    };
  } catch (error) {
    console.error("❌ Batch upload failed:", error.message);
    throw error;
  }
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public_id
 * @returns {Object} Deletion result
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    console.log(`🗑️ Deleting from Cloudinary: ${publicId}`);

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "ok") {
      console.log(`✅ Successfully deleted from Cloudinary: ${publicId}`);
      return { success: true, result };
    } else {
      console.warn(
        `⚠️ Cloudinary deletion warning: ${publicId} - ${result.result}`
      );
      return { success: false, result };
    }
  } catch (error) {
    console.error(
      `❌ Failed to delete from Cloudinary: ${publicId}`,
      error.message
    );
    throw new Error(`Failed to delete image: ${error.message}`);
  }
};

/**
 * Delete multiple images from Cloudinary
 * @param {Array} publicIds - Array of Cloudinary public_ids
 * @returns {Object} Deletion results
 */
const deleteMultipleFromCloudinary = async (publicIds) => {
  try {
    const deletePromises = publicIds.map((publicId) =>
      deleteFromCloudinary(publicId).catch((error) => ({
        publicId,
        error: error.message,
      }))
    );

    const results = await Promise.allSettled(deletePromises);

    const successful = [];
    const failed = [];

    results.forEach((result, index) => {
      if (result.status === "fulfilled" && result.value.success) {
        successful.push(publicIds[index]);
      } else {
        failed.push({
          publicId: publicIds[index],
          error:
            result.reason?.message || result.value?.error || "Unknown error",
        });
      }
    });

    console.log(
      `🗑️ Deleted ${successful.length}/${publicIds.length} images from Cloudinary`
    );

    return {
      successful,
      failed,
      totalDeleted: successful.length,
      totalFailed: failed.length,
    };
  } catch (error) {
    console.error("❌ Batch deletion failed:", error.message);
    throw error;
  }
};

/**
 * Delete local file safely
 * @param {string} filePath - Path to local file
 */
const deleteLocalFile = async (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      console.log(`🗑️ Deleted local file: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Failed to delete local file: ${filePath}`, error.message);
  }
};

/**
 * Clean up local files in directory
 * @param {string} directory - Directory path
 * @param {number} maxAge - Max age in milliseconds (default: 1 hour)
 */
const cleanupOldFiles = async (directory, maxAge = 60 * 60 * 1000) => {
  try {
    if (!fs.existsSync(directory)) return;

    const files = await fs.promises.readdir(directory);
    const now = Date.now();
    let deletedCount = 0;

    for (const file of files) {
      const filePath = path.join(directory, file);
      const stats = await fs.promises.stat(filePath);

      if (now - stats.mtime.getTime() > maxAge) {
        await deleteLocalFile(filePath);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      console.log(`🧹 Cleaned up ${deletedCount} old files from ${directory}`);
    }
  } catch (error) {
    console.error(`❌ Cleanup failed for ${directory}:`, error.message);
  }
};

/**
 * Replace image on Cloudinary (delete old, upload new)
 * @param {string} oldPublicId - Old image public_id to delete
 * @param {string} newLocalPath - New local file path to upload
 * @param {string} folder - Cloudinary folder
 * @returns {Object} New upload result
 */
const replaceOnCloudinary = async (
  oldPublicId,
  newLocalPath,
  folder = "products"
) => {
  try {
    // Upload new image first
    const uploadResult = await uploadToCloudinary(newLocalPath, folder);

    // Delete old image (don't fail if this fails)
    if (oldPublicId) {
      try {
        await deleteFromCloudinary(oldPublicId);
      } catch (error) {
        console.warn(
          `⚠️ Failed to delete old image ${oldPublicId}:`,
          error.message
        );
      }
    }

    return uploadResult;
  } catch (error) {
    console.error("❌ Replace operation failed:", error.message);
    throw error;
  }
};

/**
 * Create upload directories if they don't exist
 */
const createUploadDirectories = () => {
  // Using absolute paths for Windows
  const baseDir = path.join(process.cwd(), "uploads");
  const dirs = [
    baseDir,
    path.join(baseDir, "products"),
    path.join(baseDir, "avatars"),
  ];

  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  });
};

/**
 * Validate Cloudinary configuration
 */
const validateCloudinaryConfig = () => {
  const required = [
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing Cloudinary configuration: ${missing.join(", ")}`);
  }

  console.log("✅ Cloudinary configuration validated");
};

// Initialize on module load
try {
  validateCloudinaryConfig();
  createUploadDirectories();
} catch (error) {
  console.error("❌ Cloudinary utility initialization failed:", error.message);
}

module.exports = {
  uploadToCloudinary,
  uploadMultipleToCloudinary,
  deleteFromCloudinary,
  deleteMultipleFromCloudinary,
  deleteLocalFile,
  cleanupOldFiles,
  replaceOnCloudinary,
  createUploadDirectories,
  validateCloudinaryConfig,
};
