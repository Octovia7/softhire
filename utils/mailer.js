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
        documentsSubmitted, // now a string ("Yes"/"No")
        knowsJobRoleAndCode,
        meetsSalaryThreshold,
        authorizingOfficerAvailable
    } = assessmentData;

    const mailOptions = {
        from: process.env.EMAIL,
        to: process.env.EMAIL,
        subject: "New Sponsor License Eligibility Assessment Submitted",
        text: `
A new Sponsor License Eligibility Assessment has been submitted.

Submitted by: ${email}
Is UK Registered: ${isUKRegistered}
Documents Submitted: ${documentsSubmitted === "Yes" ? "Yes (sufficient)" : "No or insufficient"}
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
const sendAdminApplicationDetails = async (application) => {
    const adminEmail = process.env.EMAIL;

    const formatted = `
Sponsor Licence Application Paid ✔

📌 User: ${application.user?.email || "N/A"}
📄 Application ID: ${application._id}
🕒 Submitted At: ${application.submittedAt || "Not submitted"}

✅ Company Info:
- Name: ${application.aboutYourCompany?.companyName || "N/A"}
- Size: ${application.organizationSize?.size || "N/A"}
- Structure: ${application.companyStructure?.structureType || "N/A"}

✅ Officers:
${application.authorisingOfficers?.map((a, i) =>
  `  ${i + 1}. ${a.fullName} (${a.email})`
).join("\n") || "None"}

✅ Level 1 Users:
${application.level1AccessUsers?.map((u, i) =>
  `  ${i + 1}. ${u.fullName} (${u.email})`
).join("\n") || "None"}

📎 Supporting Documents:
- ${application.supportingDocuments?.summary || "Not Provided"}

📢 Declaration: ${application.declarations?.agreed ? "Agreed" : "Not agreed"}

This application has been successfully paid. Stripe Session ID: ${application.stripeSessionId}
    `;

    try {
        await transporter.sendMail({
            from: adminEmail,
            to: adminEmail,
            subject: "✅ New Sponsorship Application Paid",
            text: formatted,
        });
        console.log("📧 Admin application details sent.");
    } catch (err) {
        console.error("❌ Failed to send admin application email:", err);
    }
};

module.exports = {
    sendAssessmentEmails,
    sendAdminApplicationDetails
};

