const Application = require('../models/Application');
const Candidate = require('../models/Candidate');
const Job = require('../models/Job');

const submitApplication = async (req, res) => {
  try {
    const { jobId, coverLetter = '' } = req.body;
    const userId = req.user.id;

    console.log(`📤 Application submission attempt - User: ${userId}, Job: ${jobId}`);

    // Check if already applied
    const existing = await Application.findOne({ candidate: userId, job: jobId });
    if (existing) {
      console.log(`⚠️ User ${userId} already applied to job ${jobId}`);
      return res.status(400).json({ 
        success: false, 
        message: 'You already applied for this job.' 
      });
    }

    // Ensure candidate has resume
    const candidateProfile = await Candidate.findOne({ userId: userId });
    if (!candidateProfile || !candidateProfile.resume) {
      console.log(`❌ Candidate profile or resume not found for user ${userId}`);
      return res.status(400).json({ 
        success: false, 
        message: 'Candidate profile or resume not found.' 
      });
    }

    // ✅ FIXED: Use "Submitted" instead of "pending" to match the enum
    const application = await Application.create({
      candidate: userId,
      job: jobId,
      coverLetter,
      status: 'Submitted' // ✅ Changed from 'pending' to 'Submitted'
    });

    console.log(`✅ Application created successfully - ID: ${application._id}`);

    res.status(201).json({ 
      success: true, 
      message: 'Application submitted successfully', 
      application: {
        id: application._id,
        status: application.status,
        appliedDate: application.createdAt
      }
    });
  } catch (err) {
    console.error('💥 Application submission error:', err);
    
    // ✅ Enhanced error handling for validation errors
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors: validationErrors,
        error: err.message 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: err.message 
    });
  }
};

const getMyApplications = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log(`📋 Fetching applications for user: ${userId}`);

    const applications = await Application.find({ candidate: userId })
      .populate('job')
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${applications.length} applications for user ${userId}`);

    res.json({ 
      success: true,
      applications 
    });
  } catch (err) {
    console.error('💥 Get applications error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Server error',
      message: err.message
    });
  }
};

// ✅ Check if user applied to specific job
const checkApplicationStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;

    console.log(`🔍 Checking application status - User: ${userId}, Job: ${jobId}`);

    // Validate jobId format
    if (!jobId || jobId.length !== 24) {
      console.log(`❌ Invalid job ID format: ${jobId}`);
      return res.status(400).json({
        success: false,
        message: 'Invalid job ID format',
        isApplied: false
      });
    }

    // Check if job exists first
    const job = await Job.findById(jobId);
    if (!job) {
      console.log(`❌ Job not found: ${jobId}`);
      return res.status(404).json({
        success: false,
        message: 'Job not found',
        isApplied: false
      });
    }

    // Find application
    const application = await Application.findOne({ 
      candidate: userId, 
      job: jobId 
    }).populate('job', 'title companyName');

    if (application) {
      console.log(`✅ Application found - User: ${userId}, Job: ${jobId}, Application: ${application._id}`);
      return res.status(200).json({
        success: true,
        isApplied: true,
        application: {
          id: application._id,
          status: application.status,
          appliedDate: application.createdAt,
          jobTitle: application.job?.title,
          companyName: application.job?.companyName,
          coverLetter: application.coverLetter
        }
      });
    } else {
      console.log(`❌ No application found - User: ${userId}, Job: ${jobId}`);
      return res.status(200).json({
        success: true,
        isApplied: false,
        application: null
      });
    }
  } catch (error) {
    console.error('💥 Check application status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      isApplied: false,
      error: error.message
    });
  }
};

console.log('✅ Application controller loaded successfully');

module.exports = { submitApplication, getMyApplications, checkApplicationStatus };