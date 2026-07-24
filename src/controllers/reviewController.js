const Review = require('../models/Review');
const Order = require('../models/Order');

// this is the core check, review only allowed on a real, completed, owned order
const createReview = async (req, res) => {
  try {
    const order = await Order.findById(req.body.orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // must be the buyer on this specific order, not just any logged in user
    if (order.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to review this order' });
    }

    // must be a genuinely completed order, this is the fake review injection defense
    if (order.status !== 'released') {
      return res.status(400).json({ error: 'Order must be completed before leaving a review' });
    }

    const existing = await Review.findOne({ order: order._id });
    if (existing) {
      return res.status(409).json({ error: 'Order already reviewed' });
    }

    const review = await Review.create({
      order: order._id,
      gig: order.gig,
      reviewer: req.user._id,
      rating: req.body.rating,
      comment: req.body.comment,
    });

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create review' });
  }
};

const getGigReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ gig: req.params.gigId }).populate('reviewer', 'fullName');
    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

module.exports = { createReview, getGigReviews };