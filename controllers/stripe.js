const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const SponsorshipApplication = require("../models/SponsorshipApplication");

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

// Stripe Webhook Handler
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
    console.error("Webhook signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle successful checkout
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const applicationId = session.metadata.applicationId;

    try {
      const app = await SponsorshipApplication.findById(applicationId);
      if (!app) {
        console.error("No application found for payment.");
        return res.status(404).json({ error: "Application not found" });
      }

      // Only mark as paid if not already
      if (!app.isPaid) {
        app.isPaid = true;
        await app.save();
        console.log("✅ Application marked as paid:", applicationId);
      } else {
        console.log("⚠️ Application already marked as paid:", applicationId);
      }
    } catch (dbError) {
      console.error("Error updating payment status:", dbError);
    }
  }

  res.status(200).json({ received: true });
};
