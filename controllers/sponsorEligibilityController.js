const SponsorEligibility = require("../models/SponsorEligibility");
const Organization = require("../models/Organization");

// Submit Sponsor Eligibility Assessment
exports.submitSponsorAssessment = async (req, res) => {
    try {
        const {
            organizationId,
            isUKRegistered,
            documentsSubmitted,
            jobRole,
            jobCode,
            salaryOffered,
            authorizingOfficerAvailable
        } = req.body;

        // Validate Organization
        const organization = await Organization.findById(organizationId);
        if (!organization) {
            return res.status(400).json({ error: "Invalid Organization ID" });
        }

        // Check Salary Requirement (Assume a function that fetches min salary)
        const minSalary = getMinSalary(jobCode); // Implement this function
        const salaryMeetsRequirement = salaryOffered >= minSalary;

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
        res.status(201).json({ message: "Assessment Submitted Successfully", assessment });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Fetch All Assessments
exports.getAllAssessments = async (req, res) => {
    try {
        const assessments = await SponsorEligibility.find().populate("organization");
        res.status(200).json(assessments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Dummy Function for Salary Validation
function getMinSalary(jobCode) {
    // You need to fetch actual data from https://www.gov.uk/government/publications/skilled-worker-visa-going-rates-for-eligible-occupations
    const jobSalaries = {
        "1234": 30000, // Example jobCode -> minSalary mapping
        "5678": 45000,
    };
    return jobSalaries[jobCode] || 0;
}
