const Message = require('../models/Message');
const Order = require('../models/Order');

// shared helper, confirms caller is buyer or seller on the order
const isOrderParty = (order, userId) => {
  return [order.buyer.toString(), order.seller.toString()].includes(userId.toString());
};

const sendMessage = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (!isOrderParty(order, req.user._id)) {
      return res.status(403).json({ error: 'Not authorized on this order' }); // idor check
    }

    const message = await Message.create({
      order: order._id,
      sender: req.user._id,
      content: req.body.content,
    });

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' });
  }
};

const getMessages = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (!isOrderParty(order, req.user._id)) {
      return res.status(403).json({ error: 'Not authorized on this order' }); // same idor check on reads too
    }

    const messages = await Message.find({ order: order._id }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

module.exports = { sendMessage, getMessages };