const express = require('express');
const router = express.Router();
const { sendMessage, getMessages } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { sendMessageSchema } = require('../validators/messageValidator');

router.post('/:orderId', protect, validate(sendMessageSchema), sendMessage);
router.get('/:orderId', protect, getMessages);

module.exports = router;