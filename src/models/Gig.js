const mongoose = require('mongoose');

const gigSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true, // set from session, never trusted from client input
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000,
  },
  category: {
    type: String,
    required: true,
    enum: ['tutoring', 'design', 'coding', 'writing', 'editing', 'other'], // whitelist categories
  },
  price: {
    type: Number,
    required: true,
    min: 1,
    max: 10000, // sanity cap, prevents absurd or overflow style values
  },
  deliveryDays: {
    type: Number,
    required: true,
    min: 1,
    max: 90,
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'removed'],
    default: 'active',
  },
}, { timestamps: true });

module.exports = mongoose.model('Gig', gigSchema);