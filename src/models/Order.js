const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  gig: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gig',
    required: true,
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true, // set from session, never trusted from client
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true, // copied from gig at order time, not client input
  },
  price: {
    type: Number,
    required: true, // snapshot of gig price at order time, price changes later dont affect existing orders
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'released', 'disputed', 'cancelled'],
    default: 'pending',
  },
  buyerConfirmed: {
    type: Boolean,
    default: false,
  },
  sellerConfirmed: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);