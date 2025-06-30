const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const SponsorshipApplication = require("../models/SponsorshipApplication");
const { sendAdminApplicationDetails } = require("../utils/mailer");
const transporter = require("../utils/transporter");

// Create Stripe Checkout session
exports.createCheckoutSession = async (req, res) => {
  try {
    const { applicationId, plan } = req.body; // expect plan in body
    const email = req.user.email;
    const userId = req.user.id;

    const planPrices = {
      basic: 120000,     // £1200 in pence
      standard: 165000,  // £1650 in pence
      premium: 220000    // £2200 in pence
    };

    const planDurations = {
      basic: 12,
      standard: 12,
      premium: 12
    };

    if (!planPrices[plan]) {
      return res.status(400).json({ error: "Invalid plan selected" });
    }

    const application = await SponsorshipApplication.findById(applicationId);
    if (!application || application.user.toString() !== userId) {
      return res.status(404).json({ error: "Application not found or unauthorized" });
    }

    if (!application.isSubmitted) {
      return res.status(400).json({ error: "Submit your application before payment" });
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
          price_data: {
            currency: "gbp",
            product_data: {
              name: `Sponsor Licence - ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
            },
            unit_amount: planPrices[plan],
          },
          quantity: 1,
        },
      ],
      success_url: `https://softhire.co.uk/success`,
      cancel_url: `https://softhire.co.uk/cancel`,
      metadata: {
        applicationId,
        selectedPlan: plan,
        price: planPrices[plan],
        durationMonths: planDurations[plan]
      },
    });

    application.stripeSessionId = session.id;
    application.selectedPlan = plan;
    application.planPrice = planPrices[plan];
    await application.save();

    res.status(200).json({ url: session.url });

  } catch (error) {
    console.error("❌ Error creating Stripe session:", error);
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
        console.error("❌ Application not found");
        return res.status(404).send();
      }

      if (!app.isPaid) {
        const now = new Date();
        const validUntil = new Date();
        validUntil.setMonth(validUntil.getMonth() + Number(metadata.durationMonths || 12));

        app.isPaid = true;
        app.planPaidAt = now;
        app.planValidUntil = validUntil;
        app.planPrice = metadata.price;
        app.selectedPlan = metadata.selectedPlan;

        await app.save();
        console.log("✅ Application marked as paid:", app._id);
      }

      // Send confirmation to user
      await transporter.sendMail({
        from: process.env.EMAIL,
        to: app.user.email,
        subject: "✅ Payment Received – Sponsor Licence Application",
        text: `Hi ${app.user.fullName},\n\nThank you for purchasing the ${app.selectedPlan} plan. Your sponsorship application is now active until ${app.planValidUntil.toDateString()}.\n\nRegards,\nSoftHire Team`
      });

      // Send detailed application to admin
      await sendAdminApplicationDetails(app);
      console.log("📬 Admin notified with full application data");

    } catch (error) {
      console.error("❌ Webhook processing error:", error);
    }
  }

  res.status(200).json({ received: true });
};
