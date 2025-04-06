const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
        rejectUnauthorized: false,
    }
});

const sendAssessmentEmails = async (assessmentData) => {
    const {
        email,
        isUKRegistered,
        documentsSubmitted,
        knowsJobRoleAndCode,
        meetsSalaryThreshold,
        authorizingOfficerAvailable
    } = assessmentData;

    const mailOptions = {
        from: process.env.EMAIL,
        to: [email, process.env.EMAIL],
        subject: "New Sponsor License Eligibility Assessment Submitted",
        text: `
A new Sponsor License Eligibility Assessment has been submitted.

Submitted by: ${email}
Is UK Registered: ${isUKRegistered}
Documents Submitted: ${documentsSubmitted.length ? documentsSubmitted.join(", ") : "None"}
Knows Job Role & SOC Code: ${knowsJobRoleAndCode}
Meets Salary Threshold: ${meetsSalaryThreshold}
Authorizing Officer Available: ${authorizingOfficerAvailable}

You can follow up with the user for next steps.
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Assessment email sent successfully');
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

module.exports = sendAssessmentEmails;

