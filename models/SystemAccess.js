const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  line1: { type: String, required: true },
  line2: String,
  line3: String,
  city: { type: String, required: true },
  county: String,
  postcode: { type: String, required: true },
  country: { type: String, required: true }
}, { _id: false });

const level1AccessUserSchema = new mongoose.Schema({
  level1Access: { type: Boolean, required: true },
  level1User: {
    title: String,
    firstName: String,
    lastName: String,
    previouslyKnownAs: String,
    phoneNumber: {
      type: String,
    },
    email: String,
    dateOfBirth: Date,
    roleInCompany: String,
    hasNINumber: Boolean,
    nationalInsuranceNumber: String,
    niExemptReason: String,
    nationality: String,
    isSettledWorker: Boolean,
    immigrationStatus: String,
    passportNumber: String,
    homeOfficeReference: String,
    permissionExpiryDate: Date,
    hasConvictions: Boolean,
    convictionDetails: String,
    address: { type: addressSchema }
  }
}, { timestamps: true });


module.exports = mongoose.model("Level1AccessUser", level1AccessUserSchema);

