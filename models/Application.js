// models/Application.js
const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true
    },
    coverLetter: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['Submitted', 'Accepted', 'Rejected', 'Hired', 'Saved', 'Paid', 'AdminReview'],
      default: 'Submitted'
    },
    statusUpdatedAt: {
      type: Date,
      default: Date.now
    },
    cosRefNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
    },
    cosSubmittedAt: {
      type: Date
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed'],
      default: 'Pending'
    },
    stripeSessionId: {
      type: String
    },
    plan: {
      type: String,
      enum: ['Skilled Worker', 'Dependant'],
      required: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Application', applicationSchema);
