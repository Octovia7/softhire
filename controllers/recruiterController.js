const Job = require("../models/Job");
const Application = require("../models/Application");
const VisaApplication = require("../models/VisaApplication");
const Recruiter = require("../models/recruiter");
const Candidate = require("../models/Candidate");

// ✅ Recruiter Dashboard Overview
exports.getRecruiterDashboard = async (req, res) => {
    try {
        const recruiter = await Recruiter.findOne({ userId: req.user.id });
        if (!recruiter) return res.status(404).json({ success: false, message: "Recruiter not found" });

        const jobs = await Job.find({ recruiter: req.user.id });
        const applicants = await Application.find({ job: { $in: jobs.map(job => job._id) } })
            .populate("candidate", "fullName email resume");

        res.status(200).json({ success: true, recruiter, jobs, applicants });
    } catch (error) {
        console.error("Dashboard Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ✅ Create Job Posting
exports.createJobPost = async (req, res) => {
    try {
        const recruiter = await Recruiter.findOne({ userId: req.user.id });
        if (!recruiter) return res.status(404).json({ success: false, message: "Recruiter not found" });

        const job = new Job({ recruiter: req.user.id, ...req.body });
        await job.save();
        res.status(201).json({ success: true, message: "Job posted successfully", job });
    } catch (error) {
        console.error("Job Post Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ✅ Update Job Posting
exports.updateJobPost = async (req, res) => {
    try {
        const job = await Job.findOneAndUpdate(
            { _id: req.params.jobId, recruiter: req.user.id },
            req.body,
            { new: true }
        );
        if (!job) return res.status(404).json({ success: false, message: "Job not found or unauthorized" });

        res.status(200).json({ success: true, message: "Job updated successfully", job });
    } catch (error) {
        console.error("Update Job Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ✅ Delete Job Posting
exports.deleteJobPost = async (req, res) => {
    try {
        const job = await Job.findOneAndDelete({ _id: req.params.jobId, recruiter: req.user.id });
        if (!job) return res.status(404).json({ success: false, message: "Job not found or unauthorized" });

        res.status(200).json({ success: true, message: "Job deleted successfully" });
    } catch (error) {
        console.error("Delete Job Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ✅ View Applicants for a Job
exports.getApplicants = async (req, res) => {
    try {
        const applications = await Application.find({ job: req.params.jobId })
            .populate("candidate", "fullName email resume");
        res.status(200).json({ success: true, applications });
    } catch (error) {
        console.error("Fetch Applicants Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ✅ Sponsor Visa for Candidate
exports.sponsorVisa = async (req, res) => {
    try {
        const visaApplication = new VisaApplication({
            recruiter: req.user.id,
            ...req.body,
            status: "Pending",
        });
        await visaApplication.save();
        res.status(201).json({ success: true, message: "Visa sponsorship submitted", visaApplication });
    } catch (error) {
        console.error("Sponsor Visa Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ✅ Get All Visa Applications
exports.getVisaApplications = async (req, res) => {
    try {
        const visaApplications = await VisaApplication.find({ recruiter: req.user.id })
            .populate("candidate", "fullName email resume")
            .populate("job", "title company");

        res.status(200).json({ success: true, visaApplications });
    } catch (error) {
        console.error("Fetch Visa Applications Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ✅ Approve or Reject a Visa Application
exports.updateVisaStatus = async (req, res) => {
    try {
        const visaApplication = await VisaApplication.findOne({
            _id: req.params.applicationId,
            recruiter: req.user.id,
        });

        if (!visaApplication) return res.status(404).json({ success: false, message: "Visa application not found or unauthorized" });
        if (visaApplication.status !== "Pending") return res.status(400).json({ success: false, message: "Visa application is already processed" });

        visaApplication.status = req.body.status; // "Approved" or "Rejected"
        await visaApplication.save();
        res.status(200).json({ success: true, message: `Visa application ${req.body.status.toLowerCase()}`, visaApplication });
    } catch (error) {
        console.error("Update Visa Status Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ✅ Assign a Visa Application to Another Recruiter
exports.assignVisaToRecruiter = async (req, res) => {
    try {
        const { applicationId, newRecruiterId } = req.body;
        const visaApplication = await VisaApplication.findById(applicationId);
        if (!visaApplication) return res.status(404).json({ success: false, message: "Visa application not found" });

        const newRecruiter = await Recruiter.findOne({ userId: newRecruiterId });
        if (!newRecruiter) return res.status(400).json({ success: false, message: "Invalid recruiter assignment" });

        visaApplication.recruiter = newRecruiterId;
        await visaApplication.save();
        res.status(200).json({ success: true, message: "Visa application reassigned", visaApplication });
    } catch (error) {
        console.error("Assign Visa Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};