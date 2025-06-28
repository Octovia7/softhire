const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const SponsorshipApplication = require("../models/SponsorshipApplication");
const { sendAdminApplicationDetails } = require("../utils/mailer");
// Create Stripe Checkout session
exports.createCheckoutSession = async (req, res) => {
  try {
    const { applicationId } = req.body;
    const email = req.user.email;
    const userId = req.user.id;

    console.log("✅ Using email:", email);
    console.log("💡 Initiating checkout session for user:", email, "Application ID:", applicationId);

    // Validate application exists and belongs to current user
    const application = await SponsorshipApplication.findById(applicationId);
    if (!application) {
      console.warn("❌ Application not found:", applicationId);
      return res.status(404).json({ error: "Application not found" });
    }

    if (application.user.toString() !== userId) {
      console.warn("❌ Unauthorized access attempt by user:", userId);
      return res.status(403).json({ error: "Not authorized to pay for this application" });
    }

    if (!application.isSubmitted) {
      console.warn("⚠️ Application not submitted yet:", applicationId);
      return res.status(400).json({ error: "Please complete and submit your application before payment" });
    }

    if (application.isPaid) {
      console.warn("⚠️ Application already paid:", applicationId);
      return res.status(400).json({ error: "Application already paid" });
    }

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: "Sponsor Licence Application Fee",
            },
            unit_amount: 25000,
          },
          quantity: 1,
        },
      ],
      success_url: `https://softhire.co.uk/success`,
      cancel_url: `https://softhire.co.uk/cancel`,
      metadata: {
        applicationId,
      },
    });

    console.log("✅ Stripe session created. ID:", session.id);

    await SponsorshipApplication.findByIdAndUpdate(applicationId, {
      stripeSessionId: session.id,
    });

    console.log("✅ Session ID saved to application:", applicationId);
    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("❌ Error creating checkout session:", error);
    res.status(500).json({ error: "Could not create Stripe session" });
  }
};


// const transporter = require("../utils/email"); 




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

  // ✅ Handle successful payment
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const applicationId = session.metadata.applicationId;

    try {
      const app = await SponsorshipApplication.findById(applicationId)
        .populate("user", "email fullName")
        .populate("aboutYourCompany")
        .populate("authorisingOfficer")
        .populate("level1User")
        .populate("organizationSize");

      if (!app) {
        console.error("❌ Application not found:", applicationId);
        return res.status(404).json({ error: "Application not found" });
      }

      // ✅ Mark as paid (only once)
      if (!app.isPaid) {
        app.isPaid = true;
        await app.save();
        console.log("✅ Application marked as paid:", applicationId);
      }

      const user = app.user;

      // ✅ Send confirmation email to client
      await require("../utils/transporter").sendMail({
        from: process.env.EMAIL,
        to: user.email,
        subject: "✅ Payment Received – Sponsor Licence Application",
        text: `Hi ${user.fullName},\n\nThank you for your payment. We’ve received your sponsor licence application.\n\nRegards,\nTeam SoftHire`,
      });
      console.log("📧 Confirmation email sent to client:", user.email);

      // ✅ Send full details to admin/owner
      await sendAdminApplicationDetails(app);
      console.log("📬 Admin notified with full application data");

    } catch (error) {
      console.error("❌ Error in webhook handler:", error);
    }
  }

  res.status(200).json({ received: true });
};
