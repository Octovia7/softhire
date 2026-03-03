const Recruiter = require("../models/Recruiter");
const Organization = require("../models/Organization");
const mongoose = require("mongoose");

// GET /api/recruiter
exports.getRecruiterByOrg = async (req, res) => {
  try {
    const orgId = req.organization?._id;

    if (!orgId) {
      return res.status(403).json({ error: "Organization context missing or not verified." });
    }

    const recruiterData = await Recruiter.aggregate([
      { $match: { organization: orgId } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'organizations',
          localField: 'organization',
          foreignField: '_id',
          as: 'organizationData'
        }
      },
      { $unwind: { path: '$organizationData', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          userId: 1,
          companyName: 1,
          website: 1,
          position: 1,
          industry: 1,
          createdAt: 1,
          updatedAt: 1,
          user: {
            _id: '$user._id',
            fullName: '$user.fullName',
            email: '$user.email',
            avatar: '$user.avatar',
            isVerified: '$user.isVerified',
            role: '$user.role'
          },
          organization: {
            _id: '$organizationData._id',
            name: '$organizationData.name',
            website: '$organizationData.website',
            industry: '$organizationData.industry',
            status: '$organizationData.status'
          }
        }
      }
    ]);

    if (!recruiterData || recruiterData.length === 0) {
      return res.status(404).json({ error: "Recruiter not found for this organization." });
    }

    res.status(200).json({
      success: true,
      recruiter: recruiterData[0]
    });
  } catch (err) {
    console.error("Error fetching recruiter:", err);
    res.status(500).json({
      success: false,
      error: "Server error while fetching recruiter"
    });
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

    console.log(req.body);

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

    // Update recruiter using findOneAndUpdate
    await Recruiter.findOneAndUpdate(
      { userId },
      { $set: updateFields },
      { upsert: true, new: true, runValidators: true }
    );

    // Sync only the relevant fields to Organization
    const orgUpdateFields = {};
    if (companyName !== undefined) orgUpdateFields.name = companyName;
    if (website !== undefined) orgUpdateFields.website = website;
    if (industry !== undefined) orgUpdateFields.industry = industry;

    if (Object.keys(orgUpdateFields).length > 0) {
      await Organization.findByIdAndUpdate(
        orgId,
        { $set: orgUpdateFields },
        { new: true, runValidators: true }
      );
    }

    // Fetch the updated recruiter with aggregation pipeline (same as getRecruiterByOrg)
    const recruiterData = await Recruiter.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'organizations',
          localField: 'organization',
          foreignField: '_id',
          as: 'organizationData'
        }
      },
      { $unwind: { path: '$organizationData', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          userId: 1,
          companyName: 1,
          website: 1,
          position: 1,
          industry: 1,
          createdAt: 1,
          updatedAt: 1,
          user: {
            _id: '$user._id',
            fullName: '$user.fullName',
            email: '$user.email',
            avatar: '$user.avatar',
            isVerified: '$user.isVerified',
            role: '$user.role'
          },
          organization: {
            _id: '$organizationData._id',
            name: '$organizationData.name',
            website: '$organizationData.website',
            industry: '$organizationData.industry',
            status: '$organizationData.status'
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      message: "Recruiter and organization updated successfully",
      recruiter: recruiterData[0]
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

