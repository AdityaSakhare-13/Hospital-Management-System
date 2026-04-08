const multer = require("multer");
const path = require("path");
const fs = require("fs");
const ApiError = require("../utils/ApiError");

// Ensure uploads folder exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// diskStorage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

// Allowed file types
const ALLOWED_FORMATS = [".jpg", ".jpeg", ".png", ".pdf", ".doc", ".docx"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// File filter for validation
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_FORMATS.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        400,
        `File type ${ext} is not supported. Allowed: ${ALLOWED_FORMATS.join(", ")}`
      ),
      false
    );
  }
};

// Multer upload middleware
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

/**
 * @desc   Delete a file from local storage
 * @param  {String} filePath - Relative file path (e.g., /uploads/filename)
 * @returns {Boolean} - Success status
 */
const deleteFile = (filePath) => {
  try {
    if (!filePath) return false;
    
    // Normalize path to absolute
    const absolutePath = path.join(process.cwd(), filePath.startsWith("/") ? filePath.substring(1) : filePath);
    
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Local file delete error (${filePath}):`, error.message);
    return false;
  }
};

module.exports = {
  upload,
  deleteFile,
};
