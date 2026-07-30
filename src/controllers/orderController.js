const Order = require('../models/Order');
const Gig = require('../models/Gig');

// buyer places an order on an active gig
const createOrder = async (req, res) => {
  try {
    const gig = await Gig.findById(req.body.gigId);
    if (!gig || gig.status !== 'active') {
      return res.status(404).json({ error: 'Gig not available' });
    }

    if (gig.seller.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: 'Cannot order your own gig' }); // stops self-dealing
    }

    const order = await Order.create({
      gig: gig._id,
      buyer: req.user._id,
      seller: gig.seller,
      price: gig.price, // snapshot, immune to later gig price edits
      status: 'in_progress',
    });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create order' });
  }
};

// only buyer or seller on this specific order can view it, this is the idor check
const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const isParty = [order.buyer.toString(), order.seller.toString()].includes(req.user._id.toString());
    if (!isParty) {
      return res.status(403).json({ error: 'Not authorized to view this order' });
    }

    res.status(200).json(order);
  } catch (err) {
    res.status(400).json({ error: 'Invalid order id' });
  }
};
// VULNERABLE VERSION FOR DEMONSTRATION - read then write with artificial delay to expose the race window
const confirmOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const isBuyer = order.buyer.toString() === req.user._id.toString();
    const isSeller = order.seller.toString() === req.user._id.toString();
    if (!isBuyer && !isSeller) {
      return res.status(403).json({ error: 'Not authorized on this order' });
    }

    if (order.status !== 'in_progress') {
      return res.status(400).json({ error: 'Order is not in a confirmable state' });
    }

    const field = isBuyer ? 'buyerConfirmed' : 'sellerConfirmed';
    const updated = await Order.findOneAndUpdate(
      { _id: order._id, status: 'in_progress' },
      { [field]: true },
      { new: true }
    );

    if (updated.buyerConfirmed && updated.sellerConfirmed) {
      const released = await Order.findOneAndUpdate(
        { _id: updated._id, status: 'in_progress', buyerConfirmed: true, sellerConfirmed: true },
        { status: 'released' },
        { new: true }
      );
      return res.status(200).json(released);
    }

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to confirm order' });
  }
};

module.exports = { createOrder, getOrder, confirmOrder };