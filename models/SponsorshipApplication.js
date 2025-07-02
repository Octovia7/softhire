const mongoose = require("mongoose");

const SponsorshipApplicationSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },

  gettingStarted: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "GettingStarted" 
  },

  aboutYourCompany: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "AboutYourCompany" 
  },

  companyStructure: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CompanyStructure"
  },

  activityAndNeeds: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "ActivityAndNeeds" 
  },

  authorisingOfficers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AuthorisingOfficer"
    }
  ],

  level1AccessUsers: [
    { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Level1AccessUser" 
    }
  ],

  supportingDocuments: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SupportingDocuments"
  },

  organizationSize: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "OrganizationSize"
  },

  declarations: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Declarations" 
  },

  // Application submission
  isSubmitted: {
    type: Boolean,
    default: false
  },
  submittedAt: {
    type: Date
  },

  // Stripe Payment
  isPaid: {
    type: Boolean,
    default: false
  },
  stripeSessionId: {
    type: String
  },
  paidAmount: {
    type: Number, // 💰 Amount paid in smallest currency unit (e.g., 139900 for £1399.00)
    default: 0
  },
  paymentCompletedAt: {
    type: Date
  },


  planValidUntil: {
    type: Date
  }

}, { timestamps: true });

module.exports = mongoose.model("SponsorshipApplication", SponsorshipApplicationSchema);
