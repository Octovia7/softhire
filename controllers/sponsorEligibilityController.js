const SponsorEligibility = require("../models/SponsorEligibility");
const Organization = require("../models/Organization");
const Salary = require("../models/Salary");
const Recruiter = require("../models/Recruiter");
const User = require("../models/User"); // ✅ Import the User model
const getMinSalary = require("../utils/getMinSalary");
const sendAssessmentEmails = require("../utils/mailer");

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

        // Fetch the recruiter with their organization
        const recruiter = await Recruiter.findOne({ userId: req.user.id }).populate("organization");

        if (!recruiter || !recruiter.organization) {
            return res.status(400).json({ error: "Recruiter does not belong to any organization" });
        }

        const organizationId = recruiter.organization._id;
        const organizationName = recruiter.organization.name;

        // Fetch the email from the User schema using the recruiter's userId
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

        // Send email to recruiter and SoftHire team
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
