const asyncHandler = require('express-async-handler');
const Candidate = require('../models/Candidate');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

console.log('📁 Resume controller loading...');

// ✅ Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Test Cloudinary connection on startup
const testCloudinaryConnection = async () => {
    try {
        const result = await cloudinary.api.ping();
        console.log('✅ Cloudinary connection successful:', result.status);
    } catch (error) {
        console.error('❌ Cloudinary connection failed:', error.message);
    }
};

testCloudinaryConnection();

// ✅ Upload Resume to Cloudinary
const uploadResume = asyncHandler(async (req, res) => {
    console.log('📝 Upload Resume route hit by user:', req.user?.id);
    console.log('📁 File received:', req.file ? req.file.originalname : 'No file');

    // ✅ Validate user
    if (!req.user?.id) {
        return res.status(401).json({ 
            success: false,
            message: 'Unauthorized: User ID missing in token' 
        });
    }

    // ✅ Validate file upload
    if (!req.file) {
        return res.status(400).json({ 
            success: false,
            message: 'No file uploaded. Please select a PDF file.' 
        });
    }

    // ✅ Validate file type
    if (req.file.mimetype !== 'application/pdf') {
        // Clean up uploaded file
        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({ 
            success: false,
            message: 'Invalid file type. Only PDF files are allowed.' 
        });
    }

    // ✅ Validate file size (5MB limit)
    if (req.file.size > 5 * 1024 * 1024) {
        // Clean up uploaded file
        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({ 
            success: false,
            message: 'File size exceeds 5MB limit' 
        });
    }

    try {
        console.log('☁️ Starting Cloudinary upload...');
        
        // ✅ Find existing candidate
        let candidate = await Candidate.findOne({ userId: req.user.id });
        
        // ✅ Delete old resume from Cloudinary if it exists
        if (candidate && candidate.resume && candidate.resume.includes('cloudinary.com')) {
            try {
                // Extract public_id from Cloudinary URL
                const urlSegments = candidate.resume.split('/');
                const publicIdWithExtension = urlSegments[urlSegments.length - 1];
                const publicId = publicIdWithExtension.split('.')[0];
                
                await cloudinary.uploader.destroy(`Resumes/${publicId}`, {
                    resource_type: 'raw'
                });
                console.log('🗑️ Deleted old resume from Cloudinary');
            } catch (deleteError) {
                console.log('⚠️ Could not delete old resume:', deleteError.message);
            }
        }

        // ✅ Upload to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
            resource_type: 'raw', // For PDFs
            folder: 'Resumes',
            public_id: `resume_${req.user.id}_${Date.now()}`,
            use_filename: false,
            unique_filename: true,
        });

        console.log('✅ Cloudinary upload successful');
        console.log('🔗 Secure URL:', uploadResult.secure_url);

        // ✅ Clean up local file
        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        // ✅ Get the secure URL - this will be a valid HTTPS URL
        const resumeUrl = uploadResult.secure_url;

        // ✅ Validate URL format (should be HTTPS)
        if (!resumeUrl || !resumeUrl.startsWith('https://')) {
            throw new Error('Invalid URL format from Cloudinary');
        }

        // ✅ Create or update candidate profile
        if (!candidate) {
            candidate = new Candidate({
                userId: req.user.id,
                resume: resumeUrl,
            });
            console.log('👤 Creating new candidate profile');
        } else {
            candidate.resume = resumeUrl;
            console.log('📝 Updating existing candidate profile');
        }

        // ✅ Save candidate with the valid URL
        const savedCandidate = await candidate.save();
        console.log('✅ Resume saved successfully');

        res.status(201).json({
            success: true,
            message: 'Resume uploaded successfully',
            data: {
                resumeUrl: savedCandidate.resume,
                uploadedAt: savedCandidate.updatedAt,
                cloudinaryPublicId: uploadResult.public_id
            }
        });

    } catch (error) {
        console.error('💥 Error in resume upload:', error);
        
        // Clean up local file on error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to upload resume',
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

// ✅ Delete Resume
const deleteResume = asyncHandler(async (req, res) => {
    console.log('🗑️ Delete Resume route hit by user:', req.user?.id);

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

        // ✅ Delete from Cloudinary
        if (candidate.resume.includes('cloudinary.com')) {
            try {
                const urlSegments = candidate.resume.split('/');
                const publicIdWithExtension = urlSegments[urlSegments.length - 1];
                const publicId = publicIdWithExtension.split('.')[0];
                
                await cloudinary.uploader.destroy(`Resumes/${publicId}`, {
                    resource_type: 'raw'
                });
                console.log('🗑️ Deleted resume from Cloudinary');
            } catch (deleteError) {
                console.log('⚠️ Could not delete resume from Cloudinary:', deleteError.message);
            }
        }

        // ✅ Clear resume from database
        candidate.resume = null;
        await candidate.save();

        res.status(200).json({
            success: true,
            message: 'Resume deleted successfully'
        });

    } catch (error) {
        console.error('💥 Error deleting resume:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete resume',
            error: error.message
        });
    }
});

console.log('✅ Resume controller loaded successfully');

module.exports = { uploadResume, getResume, deleteResume };

