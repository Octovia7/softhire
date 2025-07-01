const CertificateOfSponsorship = require('../models/Cos');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Document = require('../models/Document');

const COS_VALIDITY_MONTHS = parseInt(process.env.COS_VALIDITY_MONTHS) || 6;
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const transporter = require("../utils/transporter");

// exports.createCandidateCheckoutSession = async (req, res) => {
//   try {
//     const { applicationId, plan, cosRefNumber } = req.body;
//     const email = req.user.email;
//     const userId = req.user.id;

//     if (!cosRefNumber) {
//       return res.status(400).json({ error: "CoS reference number is required" });
//     }

//     const application = await Application.findById(applicationId).populate("job");

//     if (!application || application.candidate.toString() !== userId) {
//       return res.status(403).json({ error: "Not authorized or application not found" });
//     }

//     if (application.paymentStatus === "Paid") {
//       return res.status(400).json({ error: "Already paid" });
//     }

//     // Define plan pricing
//     const planPrices = {
//       "Skilled Worker": 15000, // ₹150.00
//       "Dependant": 10000       // ₹100.00
//     };

//     if (!planPrices[plan]) {
//       return res.status(400).json({ error: "Invalid plan selected" });
//     }

//     // Store CoS ref and update application before payment
//     application.cosRefNumber = cosRefNumber;
//     application.cosSubmittedAt = new Date();
//     application.plan = plan;

//     // Create Stripe checkout session
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       mode: "payment",
//       customer_email: email,
//       line_items: [
//         {
//           price_data: {
//             currency: "inr",
//             product_data: {
//               name: `${plan} Visa Fee`,
//             },
//             unit_amount: planPrices[plan],
//           },
//           quantity: 1,
//         },
//       ],
//       success_url: `https://softhire.co.uk/candidate-success`,
//       cancel_url: `https://softhire.co.uk/payment-cancel`,
//       metadata: {
//         applicationId,
//         plan,
//       },
//     });

//     application.stripeSessionId = session.id;
//     await application.save();

//     res.status(200).json({ url: session.url });

//   } catch (error) {
//     console.error("❌ Error creating checkout session:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

// exports.candidateWebhook = async (req, res) => {
//   const sig = req.headers["stripe-signature"];
//   let event;

//   try {
//     event = stripe.webhooks.constructEvent(
//       req.body,
//       sig,
//       process.env.STRIPE_WEBHOOK_SECRET
//     );
//     console.log("✅ Webhook received:", event.type);
//   } catch (err) {
//     console.error("❌ Webhook signature error:", err.message);
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   if (event.type === "checkout.session.completed") {
//     const session = event.data.object;
//     const { applicationId, plan } = session.metadata;

//     console.log("📦 Metadata from Stripe session:", session.metadata);
//     console.log("🔍 Finding application with ID:", applicationId);

//     try {
//       const application = await Application.findById(applicationId).populate("candidate job");

//       if (!application) {
//         console.error("❌ Application not found in DB for ID:", applicationId);
//         return res.status(404).json({ error: "Application not found" });
//       }

//       console.log("✅ Application found. Current payment status:", application.paymentStatus);

//       if (application.paymentStatus !== "Paid") {
//         application.paymentStatus = "Paid";
//         application.plan = plan;
//         await application.save();
//         console.log("✅ Candidate application marked as paid:", applicationId);
//       } else {
//         console.log("⚠️ Application already marked as paid:", applicationId);
//       }

//       // Send email to admin
//       const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL;
//       console.log("📬 Sending admin email to:", adminEmail);

//       await transporter.sendMail({
//         from: process.env.EMAIL,
//         to: adminEmail,
//         subject: "💳 Candidate Payment Received",
//         html: `
//           <h3>🧾 Payment Confirmation</h3>
//           <p><strong>Candidate:</strong> ${application.candidate.fullName} (${application.candidate.email})</p>
//           <p><strong>CoS Reference Number:</strong> ${application.cosRefNumber}</p>
//           <p><strong>Job Title:</strong> ${application.job.title}</p>
//           <p><strong>Plan:</strong> ${application.plan}</p>
//           <p><strong>Status:</strong> Paid</p>
//         `
//       });

//       console.log("✅ Admin email sent successfully");

//     } catch (err) {
//       console.error("❌ Webhook processing error:", err);
//     }
//   }

//   res.status(200).json({ received: true });
// };


// Utility: Check if required documents exist
const hasRequiredDocuments = async (candidateId) => {
  const requiredTypes = ['Passport', 'Police Check'];
  const documents = await Document.find({
    candidate: candidateId,
    type: { $in: requiredTypes },
  });

  const uploadedTypes = documents.map((doc) => doc.type);
  for (const type of requiredTypes) {
    if (!uploadedTypes.includes(type)) {
      return { valid: false, missing: type };
    }
  }
  return { valid: true };
};

// POST /cos/apply
exports.applyForCOS = async (req, res) => {
  try {
    const candidateId = req.user.id;
    const { jobId, visaType } = req.body;

    if (!visaType) {
      return res.status(400).json({ error: 'Visa type is required' });
    }

    // 1. Validate job
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // 2. Check application is hired
    const application = await Application.findOne({ job: jobId, candidate: candidateId });
    if (!application || application.status !== 'Hired') {
      return res.status(400).json({ error: 'You must be hired for this job to request a CoS' });
    }

    // 3. Required document check
    const docCheck = await hasRequiredDocuments(candidateId);
    if (!docCheck.valid) {
      return res.status(400).json({ error: `Missing required document: ${docCheck.missing}` });
    }

    // 4. Prevent duplicate CoS
    const existingCOS = await CertificateOfSponsorship.findOne({
      candidate: candidateId,
      job: jobId,
      status: { $in: ['pending', 'issued'] },
    });
    if (existingCOS) {
      return res.status(409).json({ error: 'A CoS has already been requested or issued for this job' });
    }

    // 5. Create pending CoS (no referenceNumber yet)
    const expiryDate = new Date(Date.now() + COS_VALIDITY_MONTHS * 30 * 24 * 60 * 60 * 1000);

    const newCOS = await CertificateOfSponsorship.create({
      candidate: candidateId,
      organization: job.organization,
      job: job._id,
      visaType,
      expiryDate,
      status: 'pending',
    });

    res.status(201).json({ message: 'CoS application submitted successfully', cos: newCOS });
  } catch (err) {
    console.error('Error applying for CoS:', err);
    res.status(500).json({ error: 'Server error while applying for CoS' });
  }
};

// GET /cos/applications
exports.getCOSApplications = async (req, res) => {
  try {
    const orgId = req.organization._id;

    const cosApplications = await CertificateOfSponsorship.find({ organization: orgId })
      .populate('candidate', 'name email')
      .populate('job', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({ cosApplications });
  } catch (err) {
    console.error('Error fetching CoS applications:', err);
    res.status(500).json({ error: 'Server error while fetching CoS applications' });
  }
};

// PUT /cos/:cosId/approve
// PUT /cos/:cosId/approve
exports.approveCOS = async (req, res) => {
  try {
    const { cosId } = req.params;
    const { referenceNumber } = req.body;

    if (!req.organization || !req.organization._id) {
      return res.status(403).json({ error: 'Organization context not available' });
    }

    if (!req.user || !req.user.id) {
      return res.status(403).json({ error: 'User context not available' });
    }

    if (!referenceNumber) {
      return res.status(400).json({ error: 'Official reference number from Home Office is required.' });
    }

    const cos = await CertificateOfSponsorship.findOne({
      _id: cosId,
      organization: req.organization._id,
    });

    if (!cos) {
      return res.status(404).json({ error: 'CoS not found' });
    }

    if (cos.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending CoS can be approved' });
    }

    cos.status = 'issued';
    cos.referenceNumber = referenceNumber;
    cos.issuedBy = req.user.id; // <-- changed from req.user._id
    cos.issueDate = new Date();
    cos.expiryDate = new Date(Date.now() + COS_VALIDITY_MONTHS * 30 * 24 * 60 * 60 * 1000);

    await cos.save();

    res.status(200).json({ message: 'CoS issued successfully', cos });
  } catch (err) {
    console.error('Error issuing CoS:', err.message, err.stack);
    res.status(500).json({ error: 'Server error while issuing CoS' });
  }
};


// PUT /cos/:cosId/revoke
exports.revokeCOS = async (req, res) => {
  try {
    const { cosId } = req.params;

    const cos = await CertificateOfSponsorship.findOne({
      _id: cosId,
      organization: req.organization._id,
    });

    if (!cos) {
      return res.status(404).json({ error: 'CoS not found' });
    }

    if (cos.status === 'revoked') {
      return res.status(400).json({ error: 'CoS is already revoked' });
    }

    cos.status = 'revoked';
    await cos.save();

    res.status(200).json({ message: 'CoS revoked successfully', cos });
  } catch (err) {
    console.error('Error revoking CoS:', err);
    res.status(500).json({ error: 'Server error while revoking CoS' });
  }
};
