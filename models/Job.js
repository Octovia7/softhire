const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  companyName: { type: String, required: true },
  isHiring: { type: Boolean, default: true },
  jobType: {
    type: String,
    enum: ['Intern', 'Full-time', 'Contractor', 'Co-founder'],
    required: true,
  },
  location: [String],
  remotePolicy: {
    type: String,
    enum: ['Fully Remote', 'Hybrid', 'Onsite'],
    default: 'Fully Remote'
  },
  postedAt: { type: Date, default: Date.now },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  organization: { // ✅ new reference
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },

  salary: Number,
  currency: { type: String, default: 'GBP' },
  collaborationHours: String,
  skills: [String],
  visaSponsorship: { type: Boolean, default: false },
  hiresIn: [String],
  relocation: { type: Boolean, default: false },
  contactPerson: {
    name: String,
    position: String,
    location: String,
    experience: String
  },
  companyOverview: String,
  jobSummary: String,
  responsibilities: [String],
  qualifications: [String],
  tools: [String],
  active: { type: Boolean, default: true }
});

module.exports = mongoose.model('Job', jobSchema);
