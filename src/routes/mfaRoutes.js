const express = require('express');
const router = express.Router();
const { setupMfa, verifyMfaSetup, verifyMfaLogin } = require('../controllers/mfaController');

router.post('/setup', setupMfa);
router.post('/verify-setup', verifyMfaSetup);
router.post('/verify-login', verifyMfaLogin);

module.exports = router;