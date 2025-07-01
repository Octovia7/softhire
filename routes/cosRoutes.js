const express = require('express');
const router = express.Router();
const cosController = require('../controllers/cosController');
const {authenticate} = require('../middleware/authMiddleware');
const isVerifiedOrg = require('../middleware/isVerifiedOrg');
router.post('/cos/apply', authenticate, cosController.applyForCOS);
// Org views and manages CoS
router.get('/org/cos', authenticate, isVerifiedOrg, cosController.getCOSApplications);
router.patch('/org/:cosId/approve', authenticate, isVerifiedOrg, cosController.approveCOS);
router.patch('/org/:cosId/revoke', authenticate, isVerifiedOrg, cosController.revokeCOS);
router.post(
  "/candidate/create-checkout-session",
  authenticate,
  cosController.createCandidateCheckoutSession);
  router.post(
  "/candidate/webhook",
  express.raw({ type: "application/json" }),
  cosController.candidateWebhook
);
module.exports = router;


