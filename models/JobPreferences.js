const mongoose = require('mongoose');

const jobPreferencesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  needsSponsorship: { type: Boolean, required: true },
  authorizedToWork: { type: Boolean, required: true },

  jobType: {
    type: String,
    enum: [
      'Intern',
      'Entry Level',
      'Mid Level',
      'Senior Level',
      'Manager',
      'Director',
      'VP',
      'C-Level',
    ],
    required: true,
  },

  openTo: {
    type: [String],
    enum: [
      'Full-time Employee',
      'Contractor',
      'Co-founder',
      'Internship',
      'Freelancer',
      'Part-time',
      'Consultant',
    ],
  },

  workLocation: { type: String },

  openToRemote: { type: Boolean, default: false },

  remotePreference: {
    type: String,
    enum: ['Remote Only', 'Fully Remote', 'Hybrid', 'Onsite'],
    default: 'Hybrid',
  },

  desiredSalary: { type: Number },

  salaryCurrency: {
    type: String,
    default: 'USD',
  },

  companySizePreferences: [
    {
      size: {
        type: String,
        enum: [
          'Seed',
          'Early',
          'Mid-size',
          'Large',
          'Very Large',
          'Massive',
          'Startup',
          'Public Company',
        ],
      },
      ideal: { type: Boolean },
      interested: { type: Boolean },
    },
  ],
});

module.exports = mongoose.model('JobPreferences', jobPreferencesSchema);
