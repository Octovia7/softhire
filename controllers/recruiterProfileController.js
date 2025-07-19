const Recruiter = require("../models/Recruiter");
const Organization = require("../models/Organization");

// GET /api/recruiter
exports.getRecruiterByOrg = async (req, res) => {
  try {
    const orgId = req.organization._id;

    const recruiter = await Recruiter.findOne({ organization: orgId }).populate("userId", "fullName email avatar");
    if (!recruiter) {
      return res.status(404).json({ error: "Recruiter not found for this organization." });
    }

    res.status(200).json(recruiter);
  } catch (err) {
    console.error("Error fetching recruiter:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.upsertRecruiter = async (req, res) => {
  try {
    const userId = req.user.id;
    const orgId = req.organization._id;
    const { companyName, website, position, industry } = req.body;

    // Build dynamic update object
    const updateFields = {};
    if (companyName) updateFields.companyName = companyName;
    if (website) updateFields.website = website;
    if (position) updateFields.position = position;
    if (industry) updateFields.industry = industry;
    updateFields.userId = userId;
    updateFields.organization = orgId;

    const recruiter = await Recruiter.findOneAndUpdate(
      { userId },
      updateFields,
      { upsert: true, new: true, runValidators: true }
    );

    // Sync only the updated fields to Organization
    const orgUpdateFields = {};
    if (companyName) orgUpdateFields.name = companyName;
    if (website) orgUpdateFields.website = website;
    if (industry) orgUpdateFields.industry = industry;

    let updatedOrg = req.organization;
    if (Object.keys(orgUpdateFields).length > 0) {
      updatedOrg = await Organization.findByIdAndUpdate(
        orgId,
        { $set: orgUpdateFields },
        { new: true }
      );
    }

    res.status(200).json({
      message: "Recruiter and organization updated successfully",
      recruiter,
      organization: updatedOrg,
    });
  } catch (err) {
    console.error("Error updating recruiter and organization:", err);
    res.status(500).json({ error: "Server error" });
  }
};
