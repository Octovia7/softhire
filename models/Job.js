const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true }, // e.g., Backend Developer
  companyName: { type: String, required: true },
  companySize: { type: String }, // e.g., "11-50 employees"

  jobDescription: { type: String }, // full description
  jobSummary: { type: String }, // optional summary
  responsibilities: [String],
  qualifications: [String],
  tools: [String],

  jobType: {
    type: String,
    enum: [
      'Full-time employee',
      'Part-time employee',
      'Contractor',
      'Intern',
      'Freelancer',
      'Cofounder'
    ],
    required: true,
  },
  primaryRole: { type: String }, // e.g., "Backend Developer"
  additionalRoles: [String], // e.g., ["API Designer", "Infrastructure"]

  workExperience: { type: String }, // e.g., "2+ years", "0-1 years"

  skills: [String], // e.g., ['Node.js', 'MongoDB']

  location: [String], // e.g., ['London, UK']
  relocationRequired: { type: Boolean, default: false },
  relocationAssistance: { type: Boolean, default: false },

  remotePolicy: {
    type: String,
    enum: ['In Office', 'Onsite or Remote', 'Remote Only', 'WFH Flexibility'],
    default: 'Remote Only'
  },
  remoteCulture: {
    type: String,
    // enum: ['Mostly In-person', 'Mostly Remote'],
    // default: 'Mostly Remote'
  },
  hiresIn: [String], // e.g., ['India', 'UK', 'Germany']
  acceptWorldwide: { type: Boolean, default: false },
  timeZones: [String],

  collaborationHours: {
    start: { type: String }, // "09:00"
    end: { type: String },   // "17:00"
    timeZone: { type: String } // "Europe/London"
  },

  salary: {
    min: Number,
    max: Number
  },
  currency: { type: String, default: 'GBP' },
  equity: {
    min: Number,
    max: Number
  },

  visaSponsorship: { type: Boolean, default: false },
  autoSkipVisaCandidates: { type: Boolean, default: false },
  autoSkipRelocationCandidates: { type: Boolean, default: false },

  contactPerson: {
    name: String,
    position: String,
    location: String,
    experience: String
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isDraft: { type: Boolean, default: false }, // ✅ This enables draft logic
  postedAt: { type: Date, default: Date.now },
  isHiring: { type: Boolean, default: true },
  active: { type: Boolean, default: true }
});

module.exports = mongoose.model('Job', jobSchema);
