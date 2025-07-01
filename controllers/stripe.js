const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const SponsorshipApplication = require("../models/SponsorshipApplication");
const { sendAdminApplicationDetails } = require("../utils/mailer");
const transporter = require("../utils/transporter");

// Create Stripe Checkout session
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const SponsorshipApplication = require("../models/SponsorshipApplication");
const { sendAdminApplicationDetails } = require("../utils/mailer");
const transporter = require("../utils/transporter");

// Create Stripe Checkout Session for Recurring Yearly Plan
exports.createCheckoutSession = async (req, res) => {
  try {
    const { applicationId, plan } = req.body;
    const email = req.user.email;
    const userId = req.user.id;

    // ✅ Stripe Price IDs – Recurring Yearly
    const stripePriceIds = {
      basic: "price_1Rg7z82acj2EAQETeveypeTD",
      standard: "price_1Rg85d2acj2EAQET7cGjxHMl",
      premium: "price_1Rg86d2acj2EAQETu6YJzVHX"
    };

    if (!stripePriceIds[plan]) {
      return res.status(400).json({ error: "Invalid plan selected" });
    }

    const application = await SponsorshipApplication.findById(applicationId);
    if (!application || application.user.toString() !== userId) {
      return res.status(404).json({ error: "Application not found or unauthorized" });
    }

    if (!application.isSubmitted) {
      return res.status(400).json({ error: "Please submit the application before proceeding to payment." });
    }

    if (application.isPaid) {
      return res.status(400).json({ error: "This application has already been paid for." });
    }

    // ✅ Create Stripe subscription-based session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription", // 🔁 recurring
      customer_email: email,
      line_items: [
        {
          price: stripePriceIds[plan],
          quantity: 1
        }
      ],
      success_url: `https://softhire.co.uk/success`,
      cancel_url: `https://softhire.co.uk/cancel`,
      metadata: {
        applicationId,
        selectedPlan: plan
      }
    });

    // Save session ID and selected plan
    application.stripeSessionId = session.id;
    application.selectedPlan = plan;
    await application.save();

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("❌ Error creating Stripe session:", error);
    return res.status(500).json({ error: "Could not create Stripe session" });
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
  } catch (err) {
    console.error("❌ Webhook signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const metadata = session.metadata;

    try {
      const app = await SponsorshipApplication.findById(metadata.applicationId)
        .populate("user", "email fullName")
        .populate("aboutYourCompany")
        .populate("organizationSize")
        .populate("companyStructure")
        .populate("gettingStarted")
        .populate("activityAndNeeds")
        .populate("authorisingOfficers")
        .populate("level1AccessUsers")
        .populate("supportingDocuments")
        .populate("declarations");

      if (!app) {
        console.error("❌ Sponsorship application not found");
        return res.status(404).send();
      }

      // ✅ Mark as paid if not already
      if (!app.isPaid) {
        const now = new Date();
        const validUntil = new Date();
        validUntil.setFullYear(validUntil.getFullYear() + 1); // 1 year from now

        app.isPaid = true;
        app.planPaidAt = now;
        app.planValidUntil = validUntil;
        app.selectedPlan = metadata.selectedPlan;
        await app.save();

        console.log("✅ Application marked as paid:", app._id);
      }

      // ✅ Send confirmation email to client
      await transporter.sendMail({
        from: process.env.EMAIL,
        to: app.user.email,
        subject: "✅ Payment Received – Sponsor Licence Application",
        text: `Hi ${app.user.fullName},\n\nThank you for purchasing the ${app.selectedPlan} plan. Your subscription is now active until ${app.planValidUntil.toDateString()}.\n\nRegards,\nSoftHire Team`
      });

      // ✅ Notify admin with full application details
      await sendAdminApplicationDetails(app);
      console.log("📬 Admin notified with full application data");

    } catch (err) {
      console.error("❌ Webhook processing error:", err);
    }
  }

  res.status(200).json({ received: true });
};
