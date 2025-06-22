const mongoose = require("mongoose");

const SponsorshipApplicationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  gettingStarted: { type: mongoose.Schema.Types.ObjectId, ref: "GettingStarted" },
  aboutYourCompany: { type: mongoose.Schema.Types.ObjectId, ref: "AboutYourCompany" },
companyStructure: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "CompanyStructure"
},
activityAndNeeds: { type: mongoose.Schema.Types.ObjectId, ref: "ActivityAndNeeds" },
authorisingOfficer: { type: mongoose.Schema.Types.ObjectId, ref: "AuthorisingOfficer" },
systemAccess: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'SystemAccess'
},
supportingDocuments: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "SupportingDocuments"
},organizationSize: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "OrganizationSize"
},


 // other sections...
}, { timestamps: true });

module.exports = mongoose.model("SponsorshipApplication", SponsorshipApplicationSchema);
