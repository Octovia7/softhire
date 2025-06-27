const mongoose = require("mongoose");
const GettingStartedSchema = new mongoose.Schema({
  hasSponsorLicense: {
    value: { type: Boolean ,required : true},
    licenseNumber: { type: String }, // Required if value is true
  },
  hadSponsorLicenseBefore: {
    value: { type: Boolean},
   licenseNumber: { type: String }, // Required if value is true
  },
  hadLicenseRevokedOrSuspended: { type: Boolean, required: true },
  rejectedBefore: {
    value: { type: Boolean, required: true },
    reason: { type: String }, // Required if value is true
  },
  wantsToSponsorSkilledWorkers: { type: Boolean, required: true },
  isRecruitmentAgency: {
    value: { type: Boolean, required: true },
    contractsOutToOthers: { type: Boolean }, // Required if value is true
  }
}, { timestamps: true });

module.exports = mongoose.model("GettingStarted", GettingStartedSchema);
