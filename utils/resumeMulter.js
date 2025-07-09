const multer = require('multer');
const path = require('path');
const fs = require('fs');

console.log('📁 Resume multer configuration loading...');

// ✅ Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads/resumes');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('📁 Created uploads/resumes directory');
}

// ✅ Configure multer for resume uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename: userId_timestamp_originalname
        const userId = req.user?.id || 'unknown';
        const timestamp = Date.now();
        const originalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = `${userId}_${timestamp}_${originalName}`;
        
        console.log('📝 Generating filename:', filename);
        cb(null, filename);
    }
});

// ✅ File filter for PDF only
const fileFilter = (req, file, cb) => {
    console.log('🔍 File filter - Type:', file.mimetype, 'Original name:', file.originalname);
    
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed'), false);
    }
};

// ✅ Configure multer
const uploadResumemulter = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: fileFilter
});

console.log('✅ Resume multer configuration loaded successfully');

module.exports = uploadResumemulter;
