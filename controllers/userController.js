const User = require("../models/User");
const Application = require("../models/Application");
const Interview = require("../models/Interview");
const Job = require("../models/Job");

// Get candidate profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password -otp -otpExpires -resetPasswordToken -resetPasswordExpires");
        if (!user) return res.status(404).json({ message: "User not found" });

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

// Update candidate profile
exports.updateProfile = async (req, res) => {
    try {
        const { fullName, skills, resume, experience, companyName, website, position } = req.body;

        const updateData = { fullName };

        if (req.user.role === "candidate") {
            updateData.profile = {
                skills: skills || [],
                resume: resume || "",
                experience: experience || 0,
            };
        }

        if (req.user.role === "recruiter") {
            updateData.companyDetails = {
                companyName: companyName || "",
                website: website || "",
                position: position || "",
            };
        }

        const updatedUser = await User.findByIdAndUpdate(req.user.id, updateData, { new: true });

        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get applied jobs
exports.getAppliedJobs = async (req, res) => {
    try {
        const applications = await Application.find({ candidate: req.user.id }).populate("job");
        res.status(200).json(applications);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

// Apply for a job
exports.applyForJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId);
        if (!job) return res.status(404).json({ message: "Job not found" });

        const existingApplication = await Application.findOne({ job: req.params.jobId, candidate: req.user.id });
        if (existingApplication) return res.status(400).json({ message: "You have already applied for this job" });

        const application = new Application({
            job: req.params.jobId,
            candidate: req.user.id,
            resume: req.body.resume,
            coverLetter: req.body.coverLetter,
        });

        await application.save();
        res.status(201).json({ message: "Application submitted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get scheduled interviews
exports.getInterviews = async (req, res) => {
    try {
        const interviews = await Interview.find({ candidate: req.user.id }).populate("job recruiter");
        res.status(200).json(interviews);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};
