const Candidate = require("../models/Candidate");
const Application = require("../models/Application");
const Interview = require("../models/Interview");
const Job = require("../models/Job");
const VisaApplication = require("../models/VisaApplication");
const upload = require("../middleware/upload"); // Import the multer config
const validator = require("validator");

// Upload Resume
// exports.uploadResume = async (req, res) => {
//     try {
//         const candidate = await Candidate.findOne({ userId: req.user.id });
//         if (!candidate) return res.status(404).json({ message: "Candidate not found" });

//         if (!req.file) {
//             return res.status(400).json({ message: "No file uploaded. Please upload a PDF resume." });
//         }

//         // Construct the resume URL
//         const resumeURL = `/uploads/resumes/${req.file.filename}`;

//         // Validate the URL format (optional)
//         if (!validator.isURL(resumeURL)) {
//             return res.status(400).json({ message: "Invalid resume URL format" });
//         }

//         candidate.resume = resumeURL;
//         await candidate.save();

//         res.status(200).json({
//             message: "Resume uploaded successfully",
//             resumeURL: candidate.resume,
//         });
//     } catch (error) {
//         console.error("Resume upload error:", error);
//         res.status(500).json({ message: "Internal server error" });
//     }
// };

// Get Candidate Profile
exports.getProfile = async (req, res) => {
    try {
        const candidate = await Candidate.findOne({ userId: req.user.id }).select("-__v");
        if (!candidate) return res.status(404).json({ message: "Candidate not found" });
        res.status(200).json(candidate);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

// Update Profile
exports.updateProfile = async (req, res) => {
    try {
        const { skills, experience } = req.body;

        // Validate skills
        if (skills && skills.some(skill => skill.length > 50)) {
            return res.status(400).json({ message: "Each skill must be 50 characters or less" });
        }

        // Validate experience
        if (experience && (experience < 0 || experience > 50)) {
            return res.status(400).json({ message: "Experience must be between 0 and 50 years" });
        }

        const updateData = { skills, experience };

        const updatedCandidate = await Candidate.findOneAndUpdate(
            { userId: req.user.id },
            updateData,
            { new: true }
        );

        res.status(200).json(updatedCandidate);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get Applied Jobs
exports.getAppliedJobs = async (req, res) => {
    try {
        const applications = await Application.find({ candidate: req.user.id })
            .populate({
                path: "job",
                select: "title companyName location jobType salary currency remotePolicy skills responsibilities qualifications tools visaSponsorship relocationRequired relocationAssistance collaborationHours contactPerson companyOverview jobSummary organization active postedAt hiresIn"
            })
            .sort({ createdAt: -1 }); // Sort by newest first

        res.status(200).json({ 
            success: true, 
            data: applications,
            count: applications.length 
        });
    } catch (error) {
        console.error("Error fetching applied jobs:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

// Apply for a Job
exports.applyForJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId);
        if (!job) return res.status(404).json({ message: "Job not found" });

        const existingApplication = await Application.findOne({ job: req.params.jobId, candidate: req.user.id });
        if (existingApplication) return res.status(400).json({ message: "You have already applied for this job" });

        // Validate resume URL
        if (!validator.isURL(req.body.resume)) {
            return res.status(400).json({ message: "Invalid resume URL format" });
        }

        const application = new Application({
            job: req.params.jobId,
            candidate: req.user.id,
            resume: req.body.resume,
            coverLetter: req.body.coverLetter,
            status: "Pending"
        });

        await application.save();
        res.status(201).json({ message: "Application submitted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get Scheduled Interviews
exports.getInterviews = async (req, res) => {
    try {
        const interviews = await Interview.find({ candidate: req.user.id }).populate("job recruiter");
        res.status(200).json(interviews);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get Visa Applications
exports.getVisaApplications = async (req, res) => {
    try {
        const visaApplications = await VisaApplication.find({ candidate: req.user.id }).populate("recruiter");
        res.status(200).json({ success: true, visaApplications });
    } catch (error) {
        console.error("Fetch Visa Applications Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};