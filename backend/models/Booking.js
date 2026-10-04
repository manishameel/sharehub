const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  tool: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tool',
    required: true
  },
  borrower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  totalDays: {
    type: Number,
    required: true
  },
  rentalAmount: {
    type: Number,
    required: true
  },
  securityDeposit: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled'],
    default: 'pending'
  },
  pickupVerifiedAt: {
    type: Date
  },
  returnVerifiedAt: {
    type: Date
  },
  hasDamage: {
    type: Boolean,
    default: false
  },
  damageDescription: {
    type: String
  },
  damageAmount: {
    type: Number,
    default: 0
  },
  damageImages: [
    {
        type: String
    }
  ],
  refundAmount: {
    type: Number
  }

}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);