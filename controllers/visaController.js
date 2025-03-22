const VisaApplication = require("../models/VisaApplication");
const User = require("../models/User");

exports.requestVisa = async (req, res) => {
    try {
        const { visaType, expirationDate, documents } = req.body;
        const userId = req.user.id;

        // Ensure only candidates can apply
        const user = await User.findById(userId);
        if (!user || user.role !== "candidate") {
            return res.status(403).json({ message: "Only candidates can request a visa" });
        }

        // Check if they already have an active visa request
        const existingVisa = await VisaApplication.findOne({ candidate: userId, status: { $ne: "Expired" } });
        if (existingVisa) {
            return res.status(400).json({ message: "You already have an active visa application" });
        }

        // Create a new visa application (to be approved by a recruiter)
        const newVisa = new VisaApplication({
            candidate: userId, // Updated field name
            visaType,
            expirationDate,
            status: "Pending",
            documents,
        });

        await newVisa.save();

        res.status(201).json({ message: "Visa request submitted successfully", visa: newVisa });
    } catch (error) {
        console.error("Error requesting visa:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};