const mongoose = require("mongoose");

const CompanyAddressSchema = new mongoose.Schema({
  line1: { type: String, required: true },
  line2: { type: String },
  line3: { type: String },
  city: { type: String },
  county: { type: String },
  postcode: { type: String, required: true },
  country: { type: String, required: true },
  telephone: { type: String, required: true }, // 11-digit starting with '0'
}, { _id: false });

const AuthorisingOfficerSchema = new mongoose.Schema({
  title: { type: String },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  previouslyKnownAs: { type: String },

  phoneNumber: { type: String, required: true }, // 11-digit starting with '0'
  email: { type: String, required: true },

  dateOfBirth: { type: Date, required: true },
  companyAddress: { type: String, required: true },

  companyRole: { type: String, required: true },

  hasNationalInsuranceNumber: { type: Boolean, required: true },
  nationalInsuranceNumber: { type: String },
  niNumberExemptReason: { type: String },

  nationality: { type: String, required: true },
  isSettledWorker: { type: Boolean, required: true },
  immigrationStatus: { type: String, required: true },

  hasConvictions: { type: Boolean, required: true },
  convictionDetails: { type: String },

  hasUpcomingHoliday: { type: Boolean, required: true }
}, { timestamps: true });

module.exports = mongoose.model("AuthorisingOfficer", AuthorisingOfficerSchema);
