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
    const orgId = req.organization?._id;
    
    // Validate that organization context exists
    if (!orgId) {
      return res.status(403).json({ error: "Organization context missing or not verified." });
    }

    const { companyName, website, position, industry, ...otherFields } = req.body;

    // Build dynamic update object for all provided fields
    const updateFields = {};
    
    // Handle specific fields that sync with organization
    if (companyName !== undefined) updateFields.companyName = companyName;
    if (website !== undefined) updateFields.website = website;
    if (position !== undefined) updateFields.position = position;
    if (industry !== undefined) updateFields.industry = industry;
    
    // Handle any additional fields from request body
    Object.keys(otherFields).forEach(key => {
      if (otherFields[key] !== undefined) {
        updateFields[key] = otherFields[key];
      }
    });

    // Ensure required fields are set
    updateFields.userId = userId;
    updateFields.organization = orgId;

    const recruiter = await Recruiter.findOneAndUpdate(
      { userId },
      { $set: updateFields },
      { upsert: true, new: true, runValidators: true }
    ).populate("userId", "fullName email avatar isVerified");

    // Sync only the relevant fields to Organization
    const orgUpdateFields = {};
    if (companyName !== undefined) orgUpdateFields.name = companyName;
    if (website !== undefined) orgUpdateFields.website = website;
    if (industry !== undefined) orgUpdateFields.industry = industry;

    let updatedOrg = req.organization;
    if (Object.keys(orgUpdateFields).length > 0) {
      updatedOrg = await Organization.findByIdAndUpdate(
        orgId,
        { $set: orgUpdateFields },
        { new: true, runValidators: true }
      );
    }

    res.status(200).json({
      success: true,
      message: "Recruiter and organization updated successfully",
      recruiter,
      organization: updatedOrg,
    });
  } catch (err) {
    console.error("Error updating recruiter and organization:", err);
    
    // Handle validation errors specifically
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ 
        success: false,
        error: "Validation error", 
        details: errors 
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: "Server error while updating recruiter profile" 
    });
  }
};
