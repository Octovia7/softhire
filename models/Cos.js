const mongoose = require('mongoose');

const certificateOfSponsorshipSchema = new mongoose.Schema({
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // assuming Candidate is tied to User
    required: true,
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
 issuedBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  required: function () {
    return this.status === 'issued';
  },
},
referenceNumber: {
  type: String,
  required: function () {
    return this.status === 'issued';
  },
},
  issueDate: {
    type: Date,
    default: Date.now,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'issued', 'revoked', 'expired'],
    default: 'pending',
  },
  notes: String,
  visaType: {
    type: String,
    required: true,
    trim: true,
  }
  
}, { timestamps: true });

module.exports = mongoose.model('CertificateOfSponsorship', certificateOfSponsorshipSchema);
