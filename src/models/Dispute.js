const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    unique: true, // one active dispute per order
  },
  raisedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true, // set from session, never trusted from client
  },
  reason: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
  },
  status: {
    type: String,
    enum: ['open', 'resolved_buyer', 'resolved_seller', 'dismissed'],
    default: 'open',
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // admin who resolved it, for audit trail
  },
  resolutionNote: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
}, { timestamps: true });

module.exports = mongoose.model('Dispute', disputeSchema);