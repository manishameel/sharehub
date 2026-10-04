const mongoose = require('mongoose');

const toolSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  images: [
    {
      type: String
    }
  ],
  pricePerDay: {
    type: Number,
    required: true
  },
  securityDeposit: {
    type: Number,
    required: true
  },
  availableFrom: {
    type: Date,
    required: true
  },
  availableTo: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Tool', toolSchema);