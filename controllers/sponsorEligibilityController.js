const SponsorEligibility = require("../models/SponsorEligibility");
const Organization = require("../models/Organization");
const Salary = require("../models/Salary");
const Recruiter = require("../models/Recruiter");
const User = require("../models/User");
const getMinSalary = require("../utils/getMinSalary");
const sendAssessmentEmails = require("../utils/mailer");

// const SponsorEligibility = require("../models/SponsorEligibility");
// const sendAssessmentEmails = require("../utils/mailer");

exports.submitSponsorAssessment = async (req, res) => {
  try {
    const {
      email,
      isUKRegistered,
      documentsSubmitted, // now expected as "Yes" or "No"
      knowsJobRoleAndCode,
      meetsSalaryThreshold,
      authorizingOfficerAvailable,
    } = req.body;

    const assessment = new SponsorEligibility({
      email,
      isUKRegistered,
      documentsSubmitted,
      knowsJobRoleAndCode,
      meetsSalaryThreshold,
      authorizingOfficerAvailable,
    });

    await assessment.save();

    await sendAssessmentEmails({
      email,
      isUKRegistered,
      documentsSubmitted,
      knowsJobRoleAndCode,
      meetsSalaryThreshold,
      authorizingOfficerAvailable,
    });

    const isEligible =
      isUKRegistered === "Yes" &&
      documentsSubmitted === "Yes" && // updated condition
      knowsJobRoleAndCode === "Yes" &&
      meetsSalaryThreshold === "Yes" &&
      authorizingOfficerAvailable === "Yes";

    if (isEligible) {
      res.status(201).json({
        status: "eligible",
        message:
          "Great! Your business is ready to apply for a UK Sponsor Licence for £995 + VAT. Our experts can help streamline the process.",
      });
    } else {
      res.status(200).json({
        status: "not-eligible",
        message:
          "Based on your answers, there are a few things you’ll need to address before applying for a sponsor licence. We can guide you through the steps and ensure your business meets all Home Office requirements.",
      });
    }
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
