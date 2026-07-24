const express = require('express');
const router = express.Router();
const { createReview, getGigReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createReviewSchema } = require('../validators/reviewValidator');

router.post('/', protect, validate(createReviewSchema), createReview);
router.get('/gig/:gigId', getGigReviews); // public, no auth needed

module.exports = router;