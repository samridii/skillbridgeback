const express = require('express');
const router = express.Router();
const { createGig, listGigs, getGig, updateGig, deleteGig } = require('../controllers/gigController');
const { protect, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createGigSchema } = require('../validators/gigValidator');

router.get('/', listGigs); // public, no auth needed
router.get('/:id', getGig); // public, no auth needed

router.post('/', protect, requireRole('verified'), validate(createGigSchema), createGig);
router.put('/:id', protect, requireRole('verified'), updateGig);
router.delete('/:id', protect, requireRole('verified'), deleteGig);

module.exports = router;