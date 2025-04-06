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

const sendConsultEmail = async (data) => {
    const mailOptions = {
        from: process.env.EMAIL,
        to: process.env.EMAIL,  // example: softhire@example.com
        subject: "New Consultation Request",
        text: `
New consult request received:

Email: ${data.email}
Company: ${data.companyName}
Name: ${data.firstName}
Job Title: ${data.jobTitle}
Employees: ${data.numberOfEmployees}
Mobile: ${data.mobileNumber}
Sponsored Employees: ${data.numberOfSponsoredEmployees}
Goals: ${data.goals.join(", ")}
Heard about us from: ${data.hearAboutUs}
        `
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendConsultEmail;
