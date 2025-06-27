const mongoose = require("mongoose");

const AboutYourCompanySchema = new mongoose.Schema({
  tradingName: { type: String, required: true },
  registeredName: { type: String, required: true },
  website: { type: String, required: true },
  companiesHouseNumber: { type: String, required: true },
  registeredAddress: { type: Object, required: true },

  hasPayeReference: { type: Boolean, required: true },
  payeReferences: [{ type: String }], // Required if hasPayeReference is true
  payeExemptReason: { type: String },  // Required if hasPayeReference is false

  hasOtherLocations: { type: Boolean, required: true },
  otherWorkLocations: [{ type: Object }], // Required if hasOtherLocations is true

  sameAsRegistered: { type: Boolean, required: true },
  tradingAddress: { type: String }, // Required if sameAsRegistered is false

  description: { type: String, required: true },
  operatingHours: { type: String, required: true },
  operatingDays: [{ type: String, required: true }]
}, { timestamps: true });

module.exports = mongoose.model("AboutYourCompany", AboutYourCompanySchema);
