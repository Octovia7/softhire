const nodemailer = require("nodemailer");
const axios = require("axios");
const qs = require("querystring");
const path = require("path");
const ScheduleDemo = require("../models/ScheduleDemo");
const scheduleDemoEmailTemplate = require("../utils/scheduleDemoEmailTemplate");

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
    // Step 1: Validate reCAPTCHA token
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

    // Step 3: Save demo request to MongoDB
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

    // Step 4: Send notification email to client
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
      replyTo: email,
      html: scheduleDemoEmailTemplate({
        firstName,
        lastName,
        email,
        organization,
        date,
        time,
        countryCode,
        phoneNumber,
        comments,
      }),
      attachments: [
        {
          filename: "logo.jpg",
          path: path.join(__dirname, "../public/images/logo.jpg"),
          cid: "logo", // Must match the cid used in <img src="cid:logo">
        },
      ],
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (emailErr) {
      console.warn("Demo saved but email not sent:", emailErr.message);
      return res.status(500).json({
        message: "Demo saved, but email notification failed.",
      });
    }

    // Step 5: Respond to client
    res.status(200).json({ message: "Demo request submitted successfully." });
  } catch (error) {
    console.error("Error in scheduleDemo controller:", error);
    res.status(500).json({
      message: "Something went wrong while submitting the form.",
    });
  }
};
