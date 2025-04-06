const ConsultRequest = require("../models/ConsultRequest");
const sendConsultEmail = require("../utils/sendConsultEmail");

exports.submitConsultForm = async (req, res) => {
    try {
        const {
            email,
            companyName,
            firstName,
            jobTitle,
            numberOfEmployees,
            mobileNumber,
            numberOfSponsoredEmployees,
            goals,
            hearAboutUs
        } = req.body;

        const newRequest = new ConsultRequest({
            email,
            companyName,
            firstName,
            jobTitle,
            numberOfEmployees,
            mobileNumber,
            numberOfSponsoredEmployees,
            goals,
            hearAboutUs
        });

        await newRequest.save();
        await sendConsultEmail(newRequest);  // sends to SoftHire

        res.status(201).json({ message: "Thank you, we’ll be in touch with you shortly." });
    } catch (err) {
        console.error("Consult form error:", err);
        res.status(500).json({ error: "Something went wrong." });
    }
};
