// models/AuthorisingOfficer.js
const mongoose = require("mongoose");

const CompanyAddressSchema = new mongoose.Schema({
  line1: { type: String, required: true },
  line2: String,
  line3: String,
  city: String,
  county: String,
  postcode: { type: String, required: true },
  country: { type: String, required: true },
  telephone: { type: String, required: true },
}, { _id: false });

const AuthorisingOfficerSchema = new mongoose.Schema({
  title: String,
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  previouslyKnownAs: String,

  phoneNumber: { type: String },
  email: { type: String, required: true },

  dateOfBirth: { type: Date, required: true },
  companyAddress: { type: String },

  companyRole: { type: String, required: true },

  hasNationalInsuranceNumber: { type: Boolean, required: true },
  nationalInsuranceNumber: String,
  niNumberExemptReason: String,

  nationality: { type: String, required: true },
  isSettledWorker: { type: Boolean, required: true },
  immigrationStatus: { type: String },

  hasConvictions: { type: Boolean, required: true },
  convictionDetails: String,

  hasUpcomingHoliday: { type: Boolean, required: true }
}, { timestamps: true }); // timestamps are fine if this is a top-level model

module.exports = mongoose.model("AuthorisingOfficer", AuthorisingOfficerSchema);
