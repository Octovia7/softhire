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

module.exports = router;


