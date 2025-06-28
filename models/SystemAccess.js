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
      validate: {
        validator: v => /^0\d{10}$/.test(v),
        message: "Phone number must be 11 digits and start with 0"
      }
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

// Add conditional validation for level1User
level1AccessUserSchema.pre('validate', function(next) {
  if (this.level1Access) {
    // If level1Access is true, ensure level1User is present and required fields are filled
    if (!this.level1User) {
      return next(new Error('level1User is required when level1Access is true'));
    }
    const requiredFields = [
      'firstName', 'lastName', 'phoneNumber', 'email', 'dateOfBirth', 'roleInCompany',
      'hasNINumber', 'nationality', 'isSettledWorker', 'hasConvictions', 'address'
    ];
    for (const field of requiredFields) {
      if (!this.level1User[field]) {
        return next(new Error(`${field} is required in level1User when level1Access is true`));
      }
    }
    // NI Number or Exempt Reason
    if (this.level1User.hasNINumber && !this.level1User.nationalInsuranceNumber) {
      return next(new Error('nationalInsuranceNumber is required if hasNINumber is true'));
    }
    if (this.level1User.hasNINumber === false && !this.level1User.niExemptReason) {
      return next(new Error('niExemptReason is required if hasNINumber is false'));
    }
    // Conviction details
    if (this.level1User.hasConvictions && !this.level1User.convictionDetails) {
      return next(new Error('convictionDetails is required if hasConvictions is true'));
    }
    // Immigration details for non-settled workers
    if (!this.level1User.isSettledWorker) {
      const immFields = ['immigrationStatus', 'passportNumber', 'homeOfficeReference', 'permissionExpiryDate'];
      for (const field of immFields) {
        if (!this.level1User[field]) {
          return next(new Error(`${field} is required for non-settled workers`));
        }
      }
    }
  }
  next();
});

module.exports = mongoose.model("Level1AccessUser", level1AccessUserSchema);

