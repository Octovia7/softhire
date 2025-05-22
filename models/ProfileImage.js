const mongoose = require("mongoose");

const ProfileImageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // Each user should have only one profile image
    },
    imageUrl: {
      type: String,
      required: true,
    },
    publicId: {
      type: String, // Optional: Store Cloudinary's public_id if you want to delete/update it later
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProfileImage", ProfileImageSchema);
