const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",  // Gmail service
    auth: {
        user: process.env.EMAIL,  // Email from your .env file
        pass: process.env.EMAIL_PASSWORD,  // App password or email password from your .env file
    },
    tls: {
        rejectUnauthorized: false,  // Allow insecure TLS connections (use cautiously)
    }
});

const sendAssessmentEmails = async (assessmentData) => {
    const { organizationName, recruiterEmail, jobRole, jobCode, salaryOffered, salaryMeetsRequirement, authorizingOfficerAvailable, documentsSubmitted } = assessmentData;

    const mailOptions = {
        from: process.env.EMAIL,  // Sender email
        to: [recruiterEmail, process.env.EMAIL],  // Send email to recruiter and the configured email address
        subject: "New Sponsor License Eligibility Assessment Submitted",
        text: `
A new Sponsor License Eligibility Assessment has been submitted.

Organization: ${organizationName}
Recruiter Email: ${recruiterEmail}
Job Role: ${jobRole} (Code: ${jobCode})
Salary Offered: £${salaryOffered}
Salary meets requirement: ${salaryMeetsRequirement ? "✅ Yes" : "❌ No"}
Documents Submitted: ${documentsSubmitted.join(", ")}
Authorizing Officer Available: ${authorizingOfficerAvailable}

You can follow up with the organization for further steps.
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
