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
  letterOfRevocation: fileSchema,
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
  payeConfirmation: fileSchema,
  businessPremiseProof: fileSchema,
  hmrcTaxReturns: fileSchema,
  currentVacancies: fileSchema,
  tenderAgreements: fileSchema,
  orgChart: fileSchema,

  // Right to Work Checks
  rightToWorkChecks: [fileSchema],

  // Optional additional docs
  additionalDocuments: [fileSchema]

}, {
  timestamps: true
});

// ✅ Prevent OverwriteModelError
module.exports = mongoose.models?.SupportingDocuments || mongoose.model("SupportingDocuments", SupportingDocumentsSchema);
