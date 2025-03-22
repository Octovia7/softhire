const Admin = require("../models/Admin");
const User = require("../models/User");
const Job = require("../models/Job");
const VisaApplication = require("../models/VisaApplication");

// ✅ Get Admin Dashboard Overview
exports.getAdminDashboard = async (req, res) => {
    try {
        const admin = await Admin.findOne({ userId: req.user.id });
        if (!admin) {
            return res.status(403).json({ message: "Access denied. Admins only." });
        }

        const userCount = await User.countDocuments();
        const jobCount = await Job.countDocuments();
        const visaCount = await VisaApplication.countDocuments();

        res.status(200).json({
            users: userCount,
            jobs: jobCount,
            visas: visaCount,
            message: "Admin Dashboard",
        });
    } catch (error) {
        console.error("Error fetching admin dashboard:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ✅ Get All Users
exports.getAllUsers = async (req, res) => {
    try {
        const admin = await Admin.findOne({ userId: req.user.id });
        if (!admin) {
            return res.status(403).json({ message: "Access denied. Admins only." });
        }

        const users = await User.find().select("-password -otpData -passwordReset");
        res.status(200).json({ users });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ✅ Delete a User
exports.deleteUser = async (req, res) => {
    try {
        const admin = await Admin.findOne({ userId: req.user.id });
        if (!admin) {
            return res.status(403).json({ message: "Access denied. Admins only." });
        }

        const user = await User.findByIdAndDelete(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ✅ Get All Jobs
exports.getAllJobs = async (req, res) => {
    try {
        const admin = await Admin.findOne({ userId: req.user.id });
        if (!admin) {
            return res.status(403).json({ message: "Access denied. Admins only." });
        }

        const jobs = await Job.find().populate("recruiter", "fullName email");
        res.status(200).json({ jobs });
    } catch (error) {
        console.error("Error fetching jobs:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ✅ Delete a Job
exports.deleteJob = async (req, res) => {
    try {
        const admin = await Admin.findOne({ userId: req.user.id });
        if (!admin) {
            return res.status(403).json({ message: "Access denied. Admins only." });
        }

        const job = await Job.findByIdAndDelete(req.params.jobId);
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        res.status(200).json({ message: "Job deleted successfully" });
    } catch (error) {
        console.error("Error deleting job:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ✅ Get All Visa Applications
exports.getAllVisaApplications = async (req, res) => {
    try {
        const admin = await Admin.findOne({ userId: req.user.id });
        if (!admin) {
            return res.status(403).json({ message: "Access denied. Admins only." });
        }

        const visaApplications = await VisaApplication.find()
            .populate("candidate", "fullName email")
            .populate("recruiter", "fullName email");

        res.status(200).json({ visaApplications });
    } catch (error) {
        console.error("Error fetching visa applications:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ✅ Update Visa Application Status
exports.updateVisaStatus = async (req, res) => {
    try {
        const admin = await Admin.findOne({ userId: req.user.id });
        if (!admin) {
            return res.status(403).json({ message: "Access denied. Admins only." });
        }

        const visaApplication = await VisaApplication.findById(req.params.applicationId);
        if (!visaApplication) {
            return res.status(404).json({ message: "Visa application not found" });
        }

        const { status } = req.body;
        if (!["Pending", "Approved", "Rejected", "Expired"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        visaApplication.status = status;
        await visaApplication.save();

        res.status(200).json({ message: "Visa application status updated", visaApplication });
    } catch (error) {
        console.error("Error updating visa status:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};  