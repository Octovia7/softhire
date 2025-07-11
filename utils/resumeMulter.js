const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ✅ Ensure uploads directory exists
const uploadDir = 'uploads/resumes';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Configure multer for resume uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename
        const uniqueSuffix = `${req.user.id}_${Date.now()}`;
        const extension = path.extname(file.originalname);
        cb(null, `${uniqueSuffix}_${file.originalname}`);
    }
});

// ✅ File filter - only allow PDFs
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed'), false);
    }
};

// ✅ Create multer instance
const uploadResume = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

module.exports = uploadResume;
