const multer = require("multer");

// Set storage location and file naming
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/resumes/"); // Store resumes in 'uploads/resumes' folder
    },
    filename: (req, file, cb) => {
        cb(null, `${req.user.id}-${Date.now()}-${file.originalname}`);
    },
});

// File filter (Only allow PDFs)
const fileFilter = (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
        cb(null, true);
    } else {
        cb(new Error("Only PDF files are allowed"), false);
    }
};

// Multer config
const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }); // Max 5MB

module.exports = upload;
