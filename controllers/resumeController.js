const asyncHandler = require('express-async-handler');
const Candidate = require('../models/Candidate');

// Upload Resume
const uploadResume = asyncHandler(async (req, res) => {
    console.log('📝 Upload Resume route hit by:', req.user.id || 'Unauthenticated');

    // ✅ Guard: Check if authenticated user has a valid ID
    if (!req.user.id) {
        return res.status(401).json({ message: 'Unauthorized: User ID missing in token' });
    }

    // ✅ Guard: Only allow candidates to upload resumes
    if (req.user.role !== 'candidate') {
        return res.status(403).json({ message: 'Only candidates can upload resumes' });
    }

    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    // ✅ Optional checks: file size and type
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (req.file.size > maxSize) {
        return res.status(400).json({ message: 'File size exceeds 5MB limit' });
    }

    const allowedFileTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
    ];
    if (!allowedFileTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ message: 'Invalid file type. Only PDF, DOC, DOCX, and TXT allowed.' });
    }

    const resumeUrl = req.file.path;

    // ✅ Find or create Candidate
    let candidate = await Candidate.findOne({ userId: req.user.id });

    if (!candidate) {
        candidate = new Candidate({
            userId: req.user.id,
            resume: resumeUrl,
        });
    } else {
        if (candidate.resume !== resumeUrl) {
            candidate.resume = resumeUrl;
        }
    }

    await candidate.save();

    res.status(201).json({
        message: 'Resume uploaded successfully',
        resumeUrl,
    });
});

module.exports = uploadResume;
