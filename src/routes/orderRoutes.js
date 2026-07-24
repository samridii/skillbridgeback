const express = require('express');
const router = express.Router();
const { createOrder, getOrder, confirmOrder } = require('../controllers/orderController');
const { protect, requireRole } = require('../middleware/auth');

router.post('/', protect, requireRole('verified'), createOrder);
router.get('/:id', protect, getOrder);
router.post('/:id/confirm', protect, confirmOrder);

module.exports = router;