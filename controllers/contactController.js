const ContactForm = require("../models/ContactForm");
const nodemailer = require("nodemailer");

exports.submitContactForm = async (req, res) => {
  try {
    const { firstName, lastName, email, countryCode, phoneNumber, message } = req.body;

    // Save to DB
    const form = new ContactForm({ firstName, lastName, email, countryCode, phoneNumber, message });
    await form.save();

    // Setup Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: process.env.CLIENT_CONTACT_EMAIL,
      subject: "New Contact Form Submission",
      html: `
        <html>
          <body style="font-family: Arial, sans-serif; color: #333;">
            <div style="text-align: center;">
              <img src=".\public\images\logo.jpg" alt="SoftHire Logo" style="max-width: 200px;"/>
            </div>
            <h3>New Contact Form Submission</h3>
            <p><strong>Name:</strong> ${firstName} ${lastName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${countryCode} ${phoneNumber}</p>
            <p><strong>Message:</strong><br>${message}</p>
          </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Form submitted and email sent successfully." });
  } catch (error) {
    console.error("Error submitting contact form:", error);
    res.status(500).json({ message: "Something went wrong." });
  }
};
