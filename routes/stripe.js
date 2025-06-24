const express = require("express");
const router = express.Router();
const stripeController = require("../controllers/stripe");

// Create Checkout Session
router.post("/create-checkout-session", stripeController.createCheckoutSession);

// Stripe Webhook (must use raw body)
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  stripeController.handleWebhook
);

module.exports = router;
