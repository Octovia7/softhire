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
authorisingOfficers: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: "AuthorisingOfficer"
}]
,
level1AccessUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Level1AccessUser" }],

supportingDocuments: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "SupportingDocuments"
},organizationSize: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "OrganizationSize"
},

declarations: { type: mongoose.Schema.Types.ObjectId, ref: "Declarations" },
isSubmitted: {
  type: Boolean,
  default: false
},
submittedAt: {
  type: Date
},isPaid: {
  type: Boolean,
  default: false
},
stripeSessionId: {
  type: String
},

 // other sections...
}, { timestamps: true });

module.exports = mongoose.model("SponsorshipApplication", SponsorshipApplicationSchema);
