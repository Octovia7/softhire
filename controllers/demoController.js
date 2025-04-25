const nodemailer = require("nodemailer");
const axios = require("axios");
const qs = require("querystring");
const ScheduleDemo = require("../models/ScheduleDemo");

exports.scheduleDemo = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    organization,
    date,
    time,
    countryCode,
    phoneNumber,
    comments,
    recaptchaToken,
  } = req.body;

  try {
    // Step 1: Validate input
    if (!recaptchaToken) {
      return res.status(400).json({ message: "Missing reCAPTCHA token" });
    }

    // Step 2: Verify reCAPTCHA
    const captchaResponse = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      qs.stringify({
        secret: process.env.RECAPTCHA_SECRET_KEY,
        response: recaptchaToken,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const captchaData = captchaResponse.data;
    console.log("reCAPTCHA verification result:", captchaData);

    if (!captchaData.success) {
      return res.status(400).json({
        message: "reCAPTCHA verification failed",
        details: captchaData["error-codes"] || "Unknown error",
      });
    }

    // Only continue if reCAPTCHA is successful
    // Step 3: Save to MongoDB
    const demo = new ScheduleDemo({
      firstName,
      lastName,
      email,
      organization,
      date,
      time,
      countryCode,
      phoneNumber,
      comments,
    });

    await demo.save();

    // Step 4: Send email
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
      subject: "New Schedule Demo Request",
      html: `
        <h2>New Schedule Demo Request</h2>
        <p><strong>First Name:</strong> ${firstName}</p>
        <p><strong>Last Name:</strong> ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Organization:</strong> ${organization}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
        <p><strong>Phone:</strong> ${countryCode} ${phoneNumber}</p>
        <p><strong>Comments:</strong> ${comments || "None"}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    // Step 5: Respond to client
    res.status(200).json({ message: "Demo request submitted successfully." });
  } catch (error) {
    console.error("Error in scheduleDemo controller:", error.message || error);
    res.status(500).json({ message: "Something went wrong while submitting the form." });
  }
};
