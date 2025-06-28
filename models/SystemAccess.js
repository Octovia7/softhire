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

const level1UserSchema = new mongoose.Schema({
  title: String,
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  previouslyKnownAs: String,

  phoneNumber: {
    type: String,
    required: true,
    validate: {
      validator: (v) => /^0\d{10}$/.test(v),
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
}, { _id: false });

const singleSystemAccessSchema = new mongoose.Schema({
  needsSystemAccess: { type: Boolean, required: true },
  needsLevel1Access: { type: Boolean, required: true },
  level1User: { type: level1UserSchema }
}, { _id: false });

const systemAccessSchema = new mongoose.Schema({
  accessEntries: { type: [singleSystemAccessSchema], default: [] }
}, { timestamps: true });

// module.exports = mongoose.model("SystemAccess", systemAccessSchema);


// 🔍 Conditional Validation
systemAccessSchema.pre("validate", function (next) {
  for (const entry of this.accessEntries) {
    const user = entry.level1User;

    if (entry.needsLevel1Access && !user) {
      return next(new Error("Level 1 user information is required."));
    }

    if (user) {
      if (user.hasNINumber && !user.nationalInsuranceNumber) {
        return next(new Error("Please enter the National Insurance Number."));
      }

      if (user.hasNINumber === false && !user.niExemptReason) {
        return next(new Error("Please provide a National Insurance exemption reason."));
      }

      if (user.hasConvictions && !user.convictionDetails) {
        return next(new Error("Please provide details of convictions or penalties."));
      }

      if (!user.isSettledWorker) {
        if (
          !user.immigrationStatus ||
          !user.passportNumber ||
          !user.homeOfficeReference ||
          !user.permissionExpiryDate
        ) {
          return next(
            new Error("Please complete all immigration details for non-settled workers.")
          );
        }
      }
    }
  }

  next();
});


module.exports = mongoose.model("SystemAccess", systemAccessSchema);
