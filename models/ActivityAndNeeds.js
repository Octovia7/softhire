const mongoose = require("mongoose");

const prospectiveEmployeeSchema = new mongoose.Schema({
  role: { type: String, required: true },
  nationality: { type: String, required: true },
  currentResidence: { type: String, required: true },
  currentlyEmployed: { type: Boolean, required: true },
  passport: { type: String } // Cloudinary URL (optional)
}, { _id: false });

const ActivityAndNeedsSchema = new mongoose.Schema({
  numberOfEmployeesUK: { type: Number, required: true },
  employsMigrantWorkers: { type: Boolean, required: true },
  migrantWorkerCount: { type: Number }, // required if employsMigrantWorkers is true

  undefinedCosRequired: { type: Number, required: true },
  definedCosRequired: { type: Number, required: true },

  reasonsForSponsorship: [{ type: String, required: true }],
  sponsorshipJustification: { type: String, required: true },

  hasIdentifiedCandidates: { type: Boolean, required: true },
  prospectiveEmployees: [prospectiveEmployeeSchema],

  hasHRPlatform: { type: Boolean, required: true },
  hrPlatformName: { type: String }, // required if hasHRPlatform is true
  hrPlatformCoversAll: { type: Boolean }, // if true, show wantsBorderlessApp

  wantsBorderlessApp: { type: Boolean }, // required if hrPlatformCoversAll is true
  compliancePlan: { type: String } // required if wantsBorderlessApp === false
}, {
  timestamps: true
});

ActivityAndNeedsSchema.pre("validate", function (next) {
  const data = this;

  if (data.employsMigrantWorkers && typeof data.migrantWorkerCount !== "number") {
    return next(new Error("Please provide number of migrant workers."));
  }

  if (data.hasIdentifiedCandidates && (!data.prospectiveEmployees || data.prospectiveEmployees.length === 0)) {
    return next(new Error("Please provide prospective employees."));
  }

  if (data.hasHRPlatform) {
    if (!data.hrPlatformName) {
      return next(new Error("Please specify the HR platform name."));
    }

    if (typeof data.hrPlatformCoversAll !== "boolean") {
      return next(new Error("Please specify whether the HR platform covers Payslip, Rotas, Annual & Sick Leave."));
    }

    if (data.hrPlatformCoversAll) {
      if (typeof data.wantsBorderlessApp !== "boolean") {
        return next(new Error("Please specify if you want to use the Borderless compliance app."));
      }

      if (data.wantsBorderlessApp === false && !data.compliancePlan) {
        return next(new Error("Please describe how you plan to maintain Home Office compliance."));
      }
    }
  }

  next();
});

module.exports = mongoose.model("ActivityAndNeeds", ActivityAndNeedsSchema);
