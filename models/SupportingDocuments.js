const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  name: { type: String },
  url: { type: String, required: true }
}, { _id: false });

const SupportingDocumentsSchema = new mongoose.Schema({
  application: { type: mongoose.Schema.Types.ObjectId, ref: "SponsorshipApplication", required: true },

  // If applicable
  authorisingOfficerPassport: fileSchema,
  authorisingOfficerBRP: fileSchema,
  letterOfRejection: fileSchema,
  letterOfRevocationOrSuspension: fileSchema,
  recruitersAuthority: fileSchema,

  // Required
  auditedAnnualAccounts: fileSchema,
  certificateOfIncorporation: fileSchema,
  businessBankStatement: fileSchema,
  employersLiabilityInsurance: fileSchema,

  // Additional
  governingBodyRegistration: fileSchema,
  franchiseAgreement: fileSchema,
  serviceUserAgreements: fileSchema,
  vatRegistration: fileSchema,
  payeHMRCAcountsOfficeConfirmation: fileSchema,
  businessPremiseProof: fileSchema,
  hmrcTaxReturns: fileSchema,
  currentVacancies: fileSchema,
  contractsTenderAgreements: fileSchema,
  organisationChart: fileSchema,

  rightToWorkChecks: {
    isBritishNational: { type: String },
    startDate: { type: Date },
    rightToWorkDate: { type: Date },
    employeeName: { type: String },
    file: fileSchema
  },

}, {
  timestamps: true
});

// ✅ Prevent OverwriteModelError
module.exports = mongoose.models?.SupportingDocuments || mongoose.model("SupportingDocuments", SupportingDocumentsSchema);
