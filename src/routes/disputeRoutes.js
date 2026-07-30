const express = require('express');
const router = express.Router();
const { raiseDispute, resolveDispute, getDisputeQueue } = require('../controllers/disputeController');
const { protect, requireRole } = require('../middleware/auth');

router.post('/', protect, raiseDispute); // any order party can raise

router.get('/', protect, requireRole('admin'), getDisputeQueue);
router.post('/:id/resolve', protect, requireRole('admin'), resolveDispute); 

module.exports = router;