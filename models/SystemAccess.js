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
  needsSystemAccess: { type: Boolean, required: true },
  needsLevel1Access: { type: Boolean, required: true },
  level1User: {
    title: String,
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    previouslyKnownAs: String,

    phoneNumber: {
      type: String,
      required: true,
      validate: {
        validator: v => /^0\d{10}$/.test(v),
        message: "Phone number must be 11 digits and start with 0"
      }
    },

    email: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    roleInCompany: { type: String, required: true },

    hasNINumber: { type: Boolean, required: true },
    nationalInsuranceNumber: String,
    niExemptReason: String,

    nationality: { type: String, required: true },
    isSettledWorker: { type: Boolean, required: true },
    immigrationStatus: String,
    passportNumber: String,
    homeOfficeReference: String,
    permissionExpiryDate: Date,

    hasConvictions: { type: Boolean, required: true },
    convictionDetails: String,

    address: { type: addressSchema, required: true }
  }
}, { timestamps: true });

module.exports = mongoose.model("Level1AccessUser", level1AccessUserSchema);

