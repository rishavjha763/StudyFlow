const multer = require("multer");
const path = require("path");

// Where uploaded profile images get saved, and what to name them
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "uploads", "profile-images"));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${req.userId}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// Only allow image files, max 2MB
function fileFilter(req, file, cb) {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG or WEBP images are allowed"));
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
});

module.exports = upload;
