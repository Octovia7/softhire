const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const SponsorshipApplication = require("../models/SponsorshipApplication");
const { sendAdminApplicationDetails } = require("../utils/mailer");
const transporter = require("../utils/transporter");
const Candidate = require("../models/Candidate");
const Application = require("../models/Application");

// Create Stripe Checkout Session for Recurring Yearly Plan
exports.createSponsorshipCheckoutSession = async (req, res) => {
  try {
    const { applicationId, priceId } = req.body;
    const email = req.user.email;
    const userId = req.user.id;

    if (!priceId) {
      return res.status(400).json({ error: "Missing Stripe Price ID" });
    }

    const application = await SponsorshipApplication.findById(applicationId);
    if (!application || application.user.toString() !== userId) {
      return res.status(403).json({ error: "Unauthorized or application not found" });
    }

    if (application.isPaid) {
      return res.status(400).json({ error: "Already paid" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: email,
      line_items: [
        {
          price: priceId, // ✅ use your real Stripe Price ID here
          quantity: 1
        }
      ],
      success_url: `${process.env.CLIENT_URL}/payment/${applicationId}/success`,
      cancel_url: `${process.env.CLIENT_URL}/payment/${applicationId}/failed`,
      metadata: {
        applicationId,
        planType: "sponsorship"
      }
    });

    application.stripeSessionId = session.id;
    await application.save();

    res.status(200).json({ url: session.url });

  } catch (err) {
    console.error("❌ Error creating checkout session:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
};


exports.handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log("✅ Webhook received:", event.type);
  } catch (err) {
    console.error("❌ Webhook verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { planType } = session.metadata || {};
    const email = session.customer_email;

    try {
      // ✅ Handle Skilled Worker Visa Payment (Candidate)
      if (planType === "skilled-worker") {
        const candidate = await Candidate.findOne({ stripeSessionId: session.id }).populate("userId");

        if (!candidate) return res.status(404).send("Candidate not found");

        const application = await Application.findOne({ candidate: candidate.userId._id }).populate("job");

        candidate.paymentStatus = "Paid";
        candidate.paidAmount = session.amount_total || 35000;
        candidate.isSubmitted = true;
        candidate.cosSubmittedAt = new Date();
        await candidate.save();

        // ✅ Email to Admin
        await transporter.sendMail({
          from: process.env.EMAIL,
          to: process.env.CLIENT_CONTACT_EMAIL,
          subject: "✅ Skilled Worker Visa Payment Received",
          html: `
            <h3>✅ Skilled Worker Visa Application Paid</h3>
            <p><strong>Candidate:</strong> ${candidate.userId.fullName} (${candidate.userId.email})</p>
            <p><strong>Job:</strong> ${application?.job?.title || "N/A"}</p>
            <p><strong>CoS Ref:</strong> ${candidate.cosRefNumber || "N/A"}</p>
            <p><strong>Amount Paid:</strong> £${(candidate.paidAmount / 100).toFixed(2)}</p>
          `
        });

        // ✅ Confirmation Email to Candidate
        await transporter.sendMail({
          from: process.env.EMAIL,
          to: candidate.userId.email,
          subject: "✅ Payment Received – Skilled Worker Visa",
          text: `Hi ${candidate.userId.fullName},\n\nThank you for your payment of £${(candidate.paidAmount / 100).toFixed(2)}. Your skilled worker visa application has been submitted.\n\nRegards,\nSoftHire Team`
        });

        console.log("✅ Candidate payment marked as paid & confirmation email sent");
      }

      // ✅ Handle Sponsorship Application Payment
      else if (planType === "sponsorship") {
        const applicationId = session.metadata?.applicationId;
        const application = await SponsorshipApplication.findById(applicationId)
          .populate("user", "email fullName")
          .populate("aboutYourCompany organizationSize companyStructure gettingStarted activityAndNeeds authorisingOfficers level1AccessUsers supportingDocuments declarations");

        if (!application) return res.status(404).send("Sponsorship application not found");

        if (!application.isPaid) {
          application.isPaid = true;
          application.planPaidAt = new Date();
          application.planValidUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
          application.isSubmitted = true;
          application.paidAmount = session.amount_total || 139900;
          await application.save();
        }

        await transporter.sendMail({
          from: process.env.EMAIL,
          to: application.user.email,
          subject: "✅ Payment Received – Sponsor Licence Application",
          text: `Hi ${application.user.fullName},\n\nThank you for your payment of £${(application.paidAmount / 100).toFixed(2)}. Your sponsor licence application has been submitted.\n\nRegards,\nSoftHire Team`
        });

        await sendAdminApplicationDetails(application);
        console.log("✅ Sponsorship application marked as paid");
      }

      else {
        console.warn("⚠️ Unknown planType or missing metadata:", planType);
      }

    } catch (err) {
      console.error("❌ Webhook processing error:", err);
    }
  }

  res.status(200).json({ received: true });
};

exports.createCandidateCheckoutSession = async (req, res) => {
  try {
    const { cosRefNumber, priceId } = req.body;
    const email = req.user.email;
    const userId = req.user.id;

    if (!cosRefNumber || !priceId) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const candidate = await Candidate.findOne({ userId }).populate("userId");
    if (!candidate) {
      return res.status(404).json({ error: "Candidate not found." });
    }

    if (candidate.paymentStatus === "Paid") {
      return res.status(400).json({ error: "Payment already completed." });
    }

    // Save CoS ref and set status to pending before payment
    candidate.cosRefNumber = cosRefNumber;
    candidate.paymentStatus = "Pending";
    await candidate.save();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: email,
      client_reference_id: userId,
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      success_url: `${process.env.CLIENT_URL}/candidate/payment/${cosRefNumber}/success`,
      cancel_url: `${process.env.CLIENT_URL}/candidate/payment/${cosRefNumber}/failed`,
      metadata: {
        planType: "skilled-worker"
      }
    });

    candidate.stripeSessionId = session.id;
    await candidate.save();

    res.status(200).json({ url: session.url });

  } catch (error) {
    console.error("❌ Error creating checkout session:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Candidate payment status check
exports.getCandidatePaymentStatus = async (req, res) => {
  try {
    const candidate = await Candidate.findOne({ userId: req.user.id }).populate("userId", "fullName email");
    if (!candidate) {
      return res.status(404).json({ success: false, error: "Candidate not found" });
    }
    res.json({
      success: true,
      paymentStatus: candidate.paymentStatus || "Unpaid",
      cosRefNumber: candidate.cosRefNumber || "",
      stripeSessionId: candidate.stripeSessionId || "",
      name: candidate.userId?.fullName || "",
      email: candidate.userId?.email || ""
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server error" });
  }
};

