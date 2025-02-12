const Job = require("../models/Job");
const Application = require("../models/Application");
const VisaApplication = require("../models/VisaApplication");
const User = require("../models/User");

// ✅ Recruiter Dashboard Overview
exports.getRecruiterDashboard = async (req, res) => {
    try {
        const recruiterId = req.user.id;
        const jobs = await Job.find({ recruiter: recruiterId });
        const applicants = await Application.find({ recruiter: recruiterId }).populate("candidate");

        res.status(200).json({ success: true, jobs, applicants });
    } catch (error) {
        console.error("Dashboard Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ✅ Create Job Posting
exports.createJobPost = async (req, res) => {
    try {
        const recruiterId = req.user.id;
        const { title, description, requirements, salary, visaSponsorship } = req.body;

        const job = new Job({
            recruiter: recruiterId,
            title,
            description,
            requirements,
            salary,
            visaSponsorship,
        });

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
        const { jobId } = req.params;
        const updates = req.body;
        const job = await Job.findByIdAndUpdate(jobId, updates, { new: true });

        if (!job) return res.status(404).json({ success: false, message: "Job not found" });
        res.status(200).json({ success: true, message: "Job updated successfully", job });
    } catch (error) {
        console.error("Update Job Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ✅ Delete Job Posting
exports.deleteJobPost = async (req, res) => {
    try {
        const { jobId } = req.params;
        await Job.findByIdAndDelete(jobId);
        res.status(200).json({ success: true, message: "Job deleted successfully" });
    } catch (error) {
        console.error("Delete Job Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ✅ View Applicants for a Job
exports.getApplicants = async (req, res) => {
    try {
        const { jobId } = req.params;
        const applications = await Application.find({ job: jobId }).populate("candidate");

        res.status(200).json({ success: true, applications });
    } catch (error) {
        console.error("Fetch Applicants Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ✅ Update Application Status (Accept/Reject)
exports.updateApplicationStatus = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { status } = req.body; // e.g., "accepted", "rejected"

        const application = await Application.findByIdAndUpdate(applicationId, { status }, { new: true });

        if (!application) return res.status(404).json({ success: false, message: "Application not found" });
        res.status(200).json({ success: true, message: "Application status updated", application });
    } catch (error) {
        console.error("Update Application Status Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ✅ Sponsor Visa for Candidate
exports.sponsorVisa = async (req, res) => {
    try {
        const recruiterId = req.user.id;
        const { candidateId, jobId, visaType, sponsorshipDetails } = req.body;

        const visaApplication = new VisaApplication({
            recruiter: recruiterId,
            candidate: candidateId,
            job: jobId,
            visaType,
            sponsorshipDetails,
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
        const recruiterId = req.user.id;
        const visaApplications = await VisaApplication.find({ recruiter: recruiterId }).populate("candidate job");

        res.status(200).json({ success: true, visaApplications });
    } catch (error) {
        console.error("Fetch Visa Applications Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ✅ Approve a Visa Application
exports.approveVisa = async (req, res) => {
    try {
        const { applicationId } = req.params;

        const visaApplication = await VisaApplication.findOne({ _id: applicationId, recruiter: req.user.id });
        if (!visaApplication) {
            return res.status(404).json({ success: false, message: "Visa application not found or unauthorized" });
        }

        if (visaApplication.status !== "Pending") {
            return res.status(400).json({ success: false, message: "Visa application is already processed" });
        }

        visaApplication.status = "Approved";
        await visaApplication.save();

        res.status(200).json({ success: true, message: "Visa application approved", visaApplication });
    } catch (error) {
        console.error("Approve Visa Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ✅ Reject a Visa Application
exports.rejectVisa = async (req, res) => {
    try {
        const { applicationId } = req.params;

        const visaApplication = await VisaApplication.findOne({ _id: applicationId, recruiter: req.user.id });
        if (!visaApplication) {
            return res.status(404).json({ success: false, message: "Visa application not found or unauthorized" });
        }

        if (visaApplication.status !== "Pending") {
            return res.status(400).json({ success: false, message: "Visa application is already processed" });
        }

        visaApplication.status = "Rejected";
        await visaApplication.save();

        res.status(200).json({ success: true, message: "Visa application rejected", visaApplication });
    } catch (error) {
        console.error("Reject Visa Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ✅ Assign a Visa Application to a Recruiter
exports.assignVisaToRecruiter = async (req, res) => {
    try {
        const { applicationId, newRecruiterId } = req.body;

        const newRecruiter = await User.findById(newRecruiterId);
        if (!newRecruiter || newRecruiter.role !== "recruiter") {
            return res.status(400).json({ success: false, message: "Invalid recruiter assignment" });
        }

        const visaApplication = await VisaApplication.findById(applicationId);
        if (!visaApplication) {
            return res.status(404).json({ success: false, message: "Visa application not found" });
        }

        visaApplication.recruiter = newRecruiterId;
        await visaApplication.save();

        res.status(200).json({ success: true, message: "Visa application reassigned", visaApplication });
    } catch (error) {
        console.error("Assign Visa Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
