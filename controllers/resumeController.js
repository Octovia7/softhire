const asyncHandler = require('express-async-handler');
const Candidate = require('../models/Candidate');
const fs = require('fs');
const path = require('path');

console.log('📁 Resume controller loading...');

// ✅ Upload Resume
const uploadResume = asyncHandler(async (req, res) => {
    console.log('📝 Upload Resume route hit by user:', req.user?.id);
    console.log('📁 File received:', req.file ? req.file.filename : 'No file');

    // ✅ Guard: Check if authenticated user has a valid ID
    if (!req.user?.id) {
        return res.status(401).json({ 
            success: false,
            message: 'Unauthorized: User ID missing in token' 
        });
    }

    // ✅ Guard: Only allow candidates to upload resumes
    if (req.user.role !== 'candidate') {
        return res.status(403).json({ 
            success: false,
            message: 'Only candidates can upload resumes' 
        });
    }

    // ✅ Check if file was uploaded
    if (!req.file) {
        return res.status(400).json({ 
            success: false,
            message: 'No file uploaded. Please select a PDF file.' 
        });
    }

    // ✅ File validation
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (req.file.size > maxSize) {
        // Delete the uploaded file if it's too large
        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({ 
            success: false,
            message: 'File size exceeds 5MB limit' 
        });
    }

    const allowedFileTypes = ['application/pdf'];
    if (!allowedFileTypes.includes(req.file.mimetype)) {
        // Delete the uploaded file if it's wrong type
        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({ 
            success: false,
            message: 'Invalid file type. Only PDF files are allowed.' 
        });
    }

    try {
        // ✅ Generate proper resume URL
        const resumeUrl = `/uploads/resumes/${req.file.filename}`;
        
        console.log('📁 Resume file saved at:', req.file.path);
        console.log('🔗 Resume URL:', resumeUrl);

        // ✅ Find or create Candidate
        let candidate = await Candidate.findOne({ userId: req.user.id });

        if (!candidate) {
            // Create new candidate profile
            candidate = new Candidate({
                userId: req.user.id,
                resume: resumeUrl,
            });
            console.log('👤 Creating new candidate profile for user:', req.user.id);
        } else {
            // ✅ Delete old resume file if it exists
            if (candidate.resume && candidate.resume !== resumeUrl) {
                const oldResumeFile = candidate.resume.replace('/uploads/resumes/', '');
                const oldFilePath = path.join(__dirname, '../uploads/resumes', oldResumeFile);
                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath);
                    console.log('🗑️ Deleted old resume file:', oldFilePath);
                }
            }
            
            candidate.resume = resumeUrl;
            console.log('📝 Updating existing candidate profile for user:', req.user.id);
        }

        await candidate.save();
        console.log('✅ Resume saved successfully for user:', req.user.id);

        res.status(201).json({
            success: true,
            message: 'Resume uploaded successfully',
            data: {
                resumeUrl,
                uploadedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('💥 Error saving resume to database:', error);
        
        // Clean up uploaded file on database error
        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to save resume to database',
            error: error.message
        });
    }
});

// ✅ Get Resume
const getResume = asyncHandler(async (req, res) => {
    console.log('📄 Get Resume route hit by user:', req.user?.id);

    if (!req.user?.id) {
        return res.status(401).json({ 
            success: false,
            message: 'Unauthorized: User ID missing in token' 
        });
    }

    try {
        const candidate = await Candidate.findOne({ userId: req.user.id });

        if (!candidate || !candidate.resume) {
            return res.status(404).json({ 
                success: false,
                message: 'No resume found for this user' 
            });
        }

        // ✅ Check if resume file actually exists
        const resumeFile = candidate.resume.replace('/uploads/resumes/', '');
        const filePath = path.join(__dirname, '../uploads/resumes', resumeFile);
        
        if (!fs.existsSync(filePath)) {
            console.log('⚠️ Resume file not found on disk:', filePath);
            // Clear the resume URL from database since file doesn't exist
            candidate.resume = null;
            await candidate.save();
            
            return res.status(404).json({
                success: false,
                message: 'Resume file not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Resume found',
            data: {
                resume: candidate.resume,
                uploadedAt: candidate.updatedAt
            }
        });

    } catch (error) {
        console.error('💥 Error fetching resume:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch resume',
            error: error.message
        });
    }
});

console.log('✅ Resume controller loaded successfully');

module.exports = { uploadResume, getResume };

