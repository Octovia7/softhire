// models/CompanyStructure.js
const mongoose = require("mongoose");

const CompanyStructureSchema = new mongoose.Schema({
  sector: { type: String, required: true },
  operatesInCareSector: { type: Boolean, required: true },
  operatesInDomiciliaryCare: { type: Boolean }, // Only if in care sector

  companyType: { type: String, required: true },
  entityType: { type: String, required: true },
  tradingDuration: { type: String, required: true },

  operatingRegions: [{
    type: String,
    enum: ["Wales", "Northern Ireland", "Scotland", "England"],
    required: true
  }],

  tradedUnderOtherNames: { type: Boolean, required: true },
  previousTradingNames: [{
    name: { type: String, required: true },
    from: { type: Date, required: true },
    to: { type: Date, required: true }
  }],

  vatRegistered: { type: Boolean, required: true },
  vatNumber: { type: String }, // Only if vatRegistered is true

  requiresGoverningBodyRegistration: { type: Boolean, required: true },
  governingBodyDetails: {
    name: { type: String },
    registrationNumber: { type: String },
    expiryDate: { type: Date }
  }
});

module.exports = mongoose.model("CompanyStructure", CompanyStructureSchema);

