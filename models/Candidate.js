const mongoose = require("mongoose");
const validator = require("validator");

const candidateSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      unique: true
    },

    skills: [
      {
        type: String,
        maxlength: [50, "Skill cannot exceed 50 characters"]
      }
    ],

    resume: {
      type: String,
      validate: {
        validator: validator.isURL,
        message: "Please provide a valid URL for the resume"
      }
    },

    experience: {
      type: Number,
      default: 0,
      min: [0, "Experience cannot be negative"],
      max: [50, "Experience cannot exceed 50 years"]
    },

    identity: {
      pronouns: {
        type: String,
        enum: ["She/Her", "He/Him", "They/Them"]
      },
      gender: {
        type: String,
        enum: ["Woman", "Man", "Non-binary", "Prefer not to say"]
      },
      ethnicity: {
        type: String,
        enum: [
          "Black/African-American",
          "East Asian",
          "Hispanic or Latino/a/x",
          "Middle Eastern",
          "Native American or Alaskan Native",
          "Pacific Islander",
          "South Asian",
          "Southeast Asian",
          "White",
          "Prefer not to say"
        ]
      }
    },

    // ✅ Subscription fields (updated)
    subscriptionPlan: {
      type: String,
      enum: ['Starter', 'Growth', 'Enterprise'],
      default: null
    },
    subscriptionStatus: {
      type: String,
      enum: ['Active', 'Cancelled', 'Expired'],
      default: null
    },
    subscriptionStartedAt: {
      type: Date
    },
    subscriptionExpiresAt: {
      type: Date
    },
    stripeSubscriptionId: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Candidate", candidateSchema);
