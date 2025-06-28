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
        to: [email, process.env.EMAIL],
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

module.exports = sendAssessmentEmails;
const sendSponsorshipFormEmail = async (applicationData) => {
    const { user, gettingStarted, aboutYourCompany, companyStructure, activityAndNeeds, authorisingOfficer, systemAccess, supportingDocuments, organizationSize, declarations, _id } = applicationData;

    const mailOptions = {
        from: process.env.EMAIL,
        to: process.env.EMAIL, // Admin/Owner
        subject: `📄 Sponsor Licence Form Submitted (Paid) – ${user?.fullName || "Unknown User"}`,
        text: `
✅ A sponsor licence form has been submitted and paid.

👤 User:
- Name: ${user?.fullName || "N/A"}
- Email: ${user?.email || "N/A"}

📋 Getting Started:
- Registered in UK: ${gettingStarted?.registeredInUK}
- Has UK Presence: ${gettingStarted?.hasUKPresence}

🏢 About Your Company:
- Name: ${aboutYourCompany?.companyName}
- Type: ${aboutYourCompany?.companyType}
- Industry: ${aboutYourCompany?.industry}
- Address: ${aboutYourCompany?.companyAddress}

🏗️ Structure:
- Type: ${companyStructure?.structureType}
- Parent Company: ${companyStructure?.hasParentCompany}

🛠️ Activity:
- Trading Activities: ${activityAndNeeds?.tradingActivities}
- Job Roles: ${activityAndNeeds?.jobRoles}

👨‍💼 Authorising Officer:
- Name: ${authorisingOfficer?.fullName}
- Email: ${authorisingOfficer?.email}
- Phone: ${authorisingOfficer?.phone}

🔐 System Access:
- Who will use SMS: ${systemAccess?.whoWillUse}

📎 Supporting Documents:
- ${supportingDocuments?.documents?.join(", ")}

📊 Size:
- Organization Size: ${organizationSize?.size}

✅ Declaration:
- Confirmed: ${declarations?.confirmed}

📌 Application ID: ${_id}
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("✅ Sponsorship form email sent to admin.");
    } catch (err) {
        console.error("❌ Error sending sponsorship form email:", err);
    }
};
