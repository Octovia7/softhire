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

  // ✅ On successful payment
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const applicationId = session.metadata.applicationId;

    try {
      const app = await SponsorshipApplication.findById(applicationId)
        .populate("user", "email fullName")
        .populate("aboutYourCompany")
        .populate("authorisingOfficers")
        .populate("organizationSize");

      if (!app) {
        console.error("❌ Application not found:", applicationId);
        return res.status(404).json({ error: "Application not found" });
      }

      // ✅ Mark as paid
      if (!app.isPaid) {
        app.isPaid = true;
        await app.save();
        console.log("✅ Application marked as paid:", applicationId);
      }

      const { user, aboutYourCompany, authorisingOfficers, organizationSize } = app;

      const commonDetails = `
Sponsor Licence Application - Payment Confirmation

👤 Full Name: ${user.fullName}
📧 Email: ${user.email}

🏢 Company Name: ${aboutYourCompany?.companyName || "N/A"}
🏭 Industry: ${aboutYourCompany?.industry || "N/A"}
🏛️ Company Type: ${aboutYourCompany?.companyType || "N/A"}
👨‍💼 Authorising Officer: ${authorisingOfficers?.map(officer => officer.fullName).join(", ") || "N/A"}
👥 Number of Employees: ${organizationSize?.size || "N/A"}
📄 Application ID: ${applicationId}
`;

      // ✅ Email to client
      await transporter.sendMail({
        from: process.env.EMAIL,
        to: user.email,
        subject: "✅ Payment Received – Sponsor Licence Application",
        text: `Hi ${user.fullName},\n\nThank you for your payment. Your application has been successfully submitted.\n${commonDetails}\n\nRegards,\nSoftHire Team`,
      });

      console.log("📧 Email sent to client:", user.email);

      // ✅ Email to admin
      await transporter.sendMail({
        from: process.env.EMAIL,
        to: "support@softhire.co.uk", // change to real admin address
        subject: `📥 New Sponsor Licence Application – ${user.fullName}`,
        text: `A new sponsor licence application has been paid for.\n\n${commonDetails}`,
      });

      console.log("📬 Admin notified");

    } catch (error) {
      console.error("❌ Error processing payment:", error);
    }
  }

  res.status(200).json({ received: true });
};

