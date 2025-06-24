const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const SponsorshipApplication = require("../models/SponsorshipApplication");

// Create Stripe Checkout session
exports.createCheckoutSession = async (req, res) => {
  try {
    const { email, applicationId } = req.body;

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
            unit_amount: 25000, // £250.00 = 25000 pence
          },
          quantity: 1,
        },
      ],
      success_url: `https://softhire.co.uk/success`,
      cancel_url: `https://softhire.co.uk/cancel`,
      metadata: {
        applicationId, // Important for webhook to identify
      },
    });

    // Optionally save session ID to track
    await SponsorshipApplication.findByIdAndUpdate(applicationId, {
      stripeSessionId: session.id,
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
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

  // Only handle successful payment
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const applicationId = session.metadata.applicationId;

    try {
      await SponsorshipApplication.findByIdAndUpdate(applicationId, {
        isPaid: true,
      });
      console.log("✅ Application marked as paid:", applicationId);
    } catch (dbError) {
      console.error("Error updating payment status:", dbError);
    }
  }

  res.status(200).json({ received: true });
};
