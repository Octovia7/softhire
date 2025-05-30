const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  profileImage: { type: mongoose.Schema.Types.ObjectId, ref: 'ProfileImage' },

  name: { type: String, required: true },
  location: { type: String, required: true },
  primaryRole: { type: String, required: true },
  yearsOfExperience: { type: String },
  openToRoles: { type: [String] },
  bio: { type: String },

  socialProfiles: {
    website: { type: String },
    linkedIn: { type: String },
    github: { type: String },
    twitter: { type: String },
  },

  workExperience: [
    {
      company: { type: String },
      title: { type: String },
      startDate: { type: String },
      endDate: { type: String },
      current: { type: Boolean, default: false },
      description: { type: String }
    }
  ],

  education: {
    college: { type: String },
    graduationYear: { type: String },
    degree: { type: String },
    major: { type: String },
    gpa: { type: String },
  },

  skills: { type: [String] },
  achievements: { type: [String] },

  identity: {
    pronouns: { type: String },
    genderIdentity: { type: String },
    raceEthnicity: { type: String },
    displayPronouns: { type: Boolean, default: false }
  },

  // ✅ New references
  jobPreferences: { type: mongoose.Schema.Types.ObjectId, ref: 'JobPreferences' },
  jobExpectations: { type: mongoose.Schema.Types.ObjectId, ref: 'JobExpectations' }

}, { timestamps: true });

module.exports = mongoose.model('Profile', ProfileSchema);
