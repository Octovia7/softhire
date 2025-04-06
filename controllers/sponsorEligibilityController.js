const SponsorEligibility = require("../models/SponsorEligibility");
const Organization = require("../models/Organization");
const Salary = require("../models/Salary");
const Recruiter = require("../models/Recruiter");
const User = require("../models/User");
const getMinSalary = require("../utils/getMinSalary");
const sendAssessmentEmails = require("../utils/mailer");

// 1️⃣ Submit assessment
exports.submitSponsorAssessment = async (req, res) => {
    try {
        const {
            isUKRegistered,
            documentsSubmitted,
            jobRole,
            jobCode,
            salaryOffered,
            authorizingOfficerAvailable
        } = req.body;

        const recruiter = await Recruiter.findOne({ userId: req.user.id }).populate("organization");
        if (!recruiter || !recruiter.organization) {
            return res.status(400).json({ error: "Recruiter does not belong to any organization" });
        }

        const organizationId = recruiter.organization._id;
        const organizationName = recruiter.organization.name;
        const user = await User.findById(req.user.id);
        const recruiterEmail = user.email;

        const minSalary = await getMinSalary(String(jobCode));
        if (!minSalary) {
            return res.status(400).json({ error: "Job code not found in salary data" });
        }

        const salaryMeetsRequirement = Number(salaryOffered) >= minSalary;

        const assessment = new SponsorEligibility({
            organization: organizationId,
            isUKRegistered,
            documentsSubmitted,
            jobRole,
            jobCode,
            salaryOffered,
            salaryMeetsRequirement,
            authorizingOfficerAvailable
        });

        await assessment.save();

        await sendAssessmentEmails({
            organizationName,
            recruiterEmail,
            jobRole,
            jobCode,
            salaryOffered,
            salaryMeetsRequirement,
            authorizingOfficerAvailable,
            documentsSubmitted
        });

        res.status(201).json({ message: "Assessment Submitted Successfully", assessment });
    } catch (error) {
        console.error("Assessment submission error:", error);
        res.status(500).json({ error: error.message });
    }
};

// 2️⃣ Get all job roles and codes for dropdown
exports.getAllJobs = async (req, res) => {
    try {
        const jobs = await Salary.find({}, { _id: 0, jobType: 1, occupationCode: 1 }); // renamed correctly
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch job roles" });
    }
};

// 3️⃣ Get job details by job code (for showing min salary)
exports.getJobDetails = async (req, res) => {
    try {
        const { jobCode } = req.params;
        const job = await Salary.findOne({ occupationCode: jobCode });

        if (!job) {
            return res.status(404).json({ error: "Job not found" });
        }

        res.json({
            jobType: job.jobType,
            occupationCode: job.occupationCode,
            minSalary: job.standardRate?.annual || null
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch job details" });
    }
};
