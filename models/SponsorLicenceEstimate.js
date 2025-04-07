const mongoose = require("mongoose");

const sponsorLicenceEstimateSchema = new mongoose.Schema({
  licenceType: {
    type: String,
    enum: ["Skilled Worker", "Temporary Worker", "Skilled Worker and Temporary Worker"],
    required: true,
  },
  isSmallCompany: {
    type: Boolean,
    required: true,
  },
  priorityProcessing: {
    type: Boolean,
    default: false,
  },
  licenceFee: {
    type: Number,
    required: true,
  },
  priorityFee: {
    type: Number,
    default: 0,
  },
  totalLicenceFee: {
    type: Number,
    required: true,
  },
  estimatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("SponsorLicenceEstimate", sponsorLicenceEstimateSchema);
