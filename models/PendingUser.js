const mongoose = require("mongoose");

const pendingUserSchema = new mongoose.Schema({
    fullName: String,
    email: { type: String, unique: true },
    password: String,
    role: String,
    otpData: {
        otp: String,
        expires: Number,
    },
    organizationName: String,
    website: String,
    industry: String,
}, { timestamps: true });

module.exports = mongoose.model("PendingUser", pendingUserSchema);

