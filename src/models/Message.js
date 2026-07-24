const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true, // set from session, never trusted from client
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000,
  },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);