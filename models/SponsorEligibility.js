const mongoose = require("mongoose");

const sponsorEligibilitySchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    isUKRegistered: {
      type: String,
      enum: ["Yes", "No - Foreign Company", "No - Planning to Register"],
      required: true,
    },
    documentsSubmitted: {
      type: String,
      enum: ["Yes", "No"], // ✅ Changed from array to string enum
      required: true,
    },
    knowsJobRoleAndCode: {
      type: String,
      enum: ["Yes", "No"],
      required: true,
    },
    meetsSalaryThreshold: {
      type: String,
      enum: ["Yes", "No"],
      required: true,
    },
    authorizingOfficerAvailable: {
      type: String,
      enum: ["Yes", "No", "Need More Information"],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SponsorEligibility", sponsorEligibilitySchema);
