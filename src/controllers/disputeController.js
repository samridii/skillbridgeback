const Dispute = require('../models/Dispute');
const Order = require('../models/Order');

// either buyer or seller on the order can raise a dispute
const raiseDispute = async (req, res) => {
  try {
    const order = await Order.findById(req.body.orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const isParty = [order.buyer.toString(), order.seller.toString()].includes(req.user._id.toString());
    if (!isParty) {
      return res.status(403).json({ error: 'Not authorized on this order' });
    }

    const existing = await Dispute.findOne({ order: order._id });
    if (existing) return res.status(409).json({ error: 'Dispute already exists for this order' });

    const dispute = await Dispute.create({
      order: order._id,
      raisedBy: req.user._id,
      reason: req.body.reason,
    });

    order.status = 'disputed';
    await order.save();

    res.status(201).json(dispute);
  } catch (err) {
    res.status(500).json({ error: 'Failed to raise dispute' });
  }
};

// admin only, this is the endpoint that must never be reachable by a regular user
const resolveDispute = async (req, res) => {
  try {
    const { resolution, note } = req.body; // resolution is resolved_buyer, resolved_seller, or dismissed
    const validResolutions = ['resolved_buyer', 'resolved_seller', 'dismissed'];
    if (!validResolutions.includes(resolution)) {
      return res.status(400).json({ error: 'Invalid resolution value' });
    }

    const dispute = await Dispute.findById(req.params.id);
    if (!dispute) return res.status(404).json({ error: 'Dispute not found' });

    dispute.status = resolution;
    dispute.resolvedBy = req.user._id; // req.user set by protect middleware, already confirmed admin by requireRole
    dispute.resolutionNote = note;
    await dispute.save();

    res.status(200).json(dispute);
  } catch (err) {
    res.status(500).json({ error: 'Failed to resolve dispute' });
  }
};

const getDisputeQueue = async (req, res) => {
  try {
    const disputes = await Dispute.find({ status: 'open' }).populate('order raisedBy');
    res.status(200).json(disputes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch disputes' });
  }
};

module.exports = { raiseDispute, resolveDispute, getDisputeQueue };