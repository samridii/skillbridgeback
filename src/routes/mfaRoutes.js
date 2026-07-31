const express = require('express');
const router = express.Router();
const { setupMfa, verifyMfaSetup, verifyMfaLogin } = require('../controllers/mfaController');
const { mfaLimiter } = require('../middleware/rateLimiter');

router.post('/setup', setupMfa);
router.post('/verify-setup', mfaLimiter, verifyMfaSetup);
router.post('/verify-login', mfaLimiter, verifyMfaLogin);

module.exports = router;