const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const SponsorshipApplication = require("../models/SponsorshipApplication");
const { sendAdminApplicationDetails } = require("../utils/mailer");
const transporter = require("../utils/transporter");
const Candidate = require("../models/Candidate");
const Application = require("../models/Application");

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


exports.handleWebhook =  async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET // ✅ Only ONE webhook secret
    );
    console.log("✅ Webhook received:", event.type);
  } catch (err) {
    console.error("❌ Webhook signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const metadata = session.metadata || {};
    const { applicationId, plan, planType } = metadata;
    const email = session.customer_email;

    console.log(`📦 Webhook for ${email} | Plan: ${plan} | Type: ${planType}`);

    try {
      // 📌 ONE-TIME: Candidate pays for visa (application-based)
      if (planType === "one-time") {
        const application = await Application.findById(applicationId).populate("candidate job");
        if (!application) {
          console.error("❌ Application not found");
          return res.status(404).send();
        }

        if (application.paymentStatus !== "Paid") {
          application.paymentStatus = "Paid";
          await application.save();
        }

        await transporter.sendMail({
          from: process.env.EMAIL,
          to: process.env.ADMIN_EMAIL || process.env.EMAIL,
          subject: "💳 One-time Payment Received",
          html: `
            <h3>🧾 Visa Fee Paid</h3>
            <p><strong>Candidate:</strong> ${application.candidate.fullName} (${application.candidate.email})</p>
            <p><strong>Job:</strong> ${application.job.title}</p>
            <p><strong>Plan:</strong> ${application.oneTimePlan}</p>
            <p><strong>CoS Ref:</strong> ${application.cosRefNumber}</p>
          `
        });

        console.log("✅ One-time application marked as paid");

      // 📌 SUBSCRIPTION: Candidate subscribes to platform (Candidate model)
      } else if (planType === "subscription") {
        const candidate = await Candidate.findOne({ userId: session.client_reference_id }).populate("userId");

        if (!candidate) {
          console.error("❌ Candidate not found");
          return res.status(404).send();
        }

        candidate.subscriptionPlan = plan;
        candidate.subscriptionStatus = "Active";
        candidate.subscriptionStartedAt = new Date();
        candidate.stripeSubscriptionId = session.subscription;
        await candidate.save();

        await transporter.sendMail({
          from: process.env.EMAIL,
          to: process.env.ADMIN_EMAIL || process.env.EMAIL,
          subject: "📅 Subscription Started",
          html: `
            <h3>💼 Subscription Activated</h3>
            <p><strong>Candidate:</strong> ${candidate.userId.fullName} (${candidate.userId.email})</p>
            <p><strong>Plan:</strong> ${plan}</p>
            <p><strong>Status:</strong> Active</p>
          `
        });

        console.log("✅ Candidate subscription saved");

      // 📌 SPONSORSHIP: Recruiter pays for sponsorship application
      } else if (planType === "sponsorship") {
        const app = await SponsorshipApplication.findById(applicationId).populate("user", "email fullName");

        if (!app) {
          console.error("❌ Sponsorship application not found");
          return res.status(404).send();
        }

        if (!app.isPaid) {
          const now = new Date();
          const validUntil = new Date();
          validUntil.setFullYear(validUntil.getFullYear() + 1);

          app.isPaid = true;
          app.planPaidAt = now;
          app.planValidUntil = validUntil;
          app.selectedPlan = plan;
          await app.save();

          await transporter.sendMail({
            from: process.env.EMAIL,
            to: app.user.email,
            subject: "✅ Payment Received – Sponsor Licence Application",
            text: `Hi ${app.user.fullName},\n\nThank you for purchasing the ${plan} plan. Your subscription is now active until ${app.planValidUntil.toDateString()}.\n\nRegards,\nSoftHire Team`
          });

          await sendAdminApplicationDetails(app);
          console.log("✅ Sponsorship marked as paid and admin notified");
        }
      } else {
        console.warn("⚠️ Unknown planType or missing data");
      }

    } catch (err) {
      console.error("❌ Webhook processing error:", err);
    }
  }

  res.status(200).json({ received: true });
};




// Create Stripe Checkout Session (Candidate)
exports.createCandidateCheckoutSession = async (req, res) => {
  try {
    const { applicationId, plan, planType, cosRefNumber, priceId } = req.body;
    const email = req.user.email;
    const userId = req.user.id;

    if (!priceId || !plan || !planType) {
      return res.status(400).json({ error: "Missing required payment information" });
    }

    if (planType === "one-time") {
      // Required: applicationId & CoS Ref
      if (!cosRefNumber || !applicationId) {
        return res.status(400).json({ error: "Application ID and CoS reference number are required" });
      }

      const application = await Application.findById(applicationId);
      if (!application || application.candidate.toString() !== userId) {
        return res.status(403).json({ error: "Application not found or unauthorized" });
      }

      if (application.paymentStatus === "Paid") {
        return res.status(400).json({ error: "Already paid" });
      }

      application.cosRefNumber = cosRefNumber;
      application.cosSubmittedAt = new Date();
      application.oneTimePlan = plan; // ✅ Must match schema field
      await application.save();
    }

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: planType === "subscription" ? "subscription" : "payment",
      customer_email: email,
      client_reference_id: userId, // Useful for subscriptions
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      success_url: `https://softhire.co.uk/candidate-success`,
      cancel_url: `https://softhire.co.uk/payment-cancel`,
      metadata: {
        applicationId: applicationId || "",
        plan,
        planType
      }
    });

    // Save session ID in application for one-time
    if (planType === "one-time") {
      await Application.findByIdAndUpdate(applicationId, {
        stripeSessionId: session.id
      });
    }

    res.status(200).json({ url: session.url });

  } catch (error) {
    console.error("❌ Error creating checkout session:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// exports.candidateWebhook = async (req, res) => {
//   const sig = req.headers["stripe-signature"];
//   let event;

//   try {
//     event = stripe.webhooks.constructEvent(
//       req.body,
//       sig,
//       process.env.STRIPE_CANDIDATE_WEBHOOK_SECRET
//     );
//     console.log("✅ Webhook received:", event.type);
//   } catch (err) {
//     console.error("❌ Webhook signature error:", err.message);
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   if (event.type === "checkout.session.completed") {
//     const session = event.data.object;
//     const { applicationId, plan, planType } = session.metadata;
//     const email = session.customer_email;

//     console.log(`📦 Webhook session for ${email} | Plan: ${plan} | Type: ${planType}`);

//     try {
//       if (planType === "one-time") {
//         const application = await Application.findById(applicationId).populate("candidate job");

//         if (!application) {
//           console.error("❌ Application not found for one-time payment");
//           return res.status(404).send();
//         }

//         if (application.paymentStatus !== "Paid") {
//           application.paymentStatus = "Paid";
//           await application.save();
//           console.log("✅ One-time application marked as paid:", applicationId);
//         }

//         // Admin notification
//         await transporter.sendMail({
//           from: process.env.EMAIL,
//           to: process.env.ADMIN_EMAIL || process.env.EMAIL,
//           subject: "💳 One-time Payment Received",
//           html: `
//             <h3>🧾 Visa Fee Paid</h3>
//             <p><strong>Candidate:</strong> ${application.candidate.fullName} (${application.candidate.email})</p>
//             <p><strong>Job:</strong> ${application.job.title}</p>
//             <p><strong>Plan:</strong> ${application.oneTimePlan}</p>
//             <p><strong>CoS Ref:</strong> ${application.cosRefNumber}</p>
//           `
//         });

//       } else if (planType === "subscription") {
//         const candidate = await Candidate.findOne({ userId: session.client_reference_id }).populate("userId");

//         if (!candidate) {
//           console.error("❌ Candidate not found for subscription webhook");
//           return res.status(404).send();
//         }

//         candidate.subscriptionPlan = plan;
//         candidate.subscriptionStatus = "Active";
//         candidate.subscriptionStartedAt = new Date();
//         candidate.stripeSubscriptionId = session.subscription;
//         await candidate.save();

//         console.log("✅ Candidate subscription updated");

//         // Admin notification
//         await transporter.sendMail({
//           from: process.env.EMAIL,
//           to: process.env.EMAIL || process.env.EMAIL,
//           subject: "📅 Subscription Started",
//           html: `
//             <h3>💼 Subscription Activated</h3>
//             <p><strong>Candidate:</strong> ${candidate.userId.fullName} (${candidate.userId.email})</p>
//             <p><strong>Plan:</strong> ${plan}</p>
//             <p><strong>Status:</strong> Active</p>
//           `
//         });
//       }

//     } catch (err) {
//       console.error("❌ Webhook processing error:", err);
//     }
//   }

//   res.status(200).json({ received: true });
// };

