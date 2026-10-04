const Booking = require('../models/Booking');
const Tool = require('../models/Tool');
const stripe = require('../config/stripe');

const checkAvailability = async (toolId, startDate, endDate, excludeBookingId = null) => {
  const query = {
    tool: toolId,
    status: { $in: ['pending', 'confirmed', 'active'] },
    $or: [
      { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
    ]
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const overlapping = await Booking.find(query);
  return overlapping.length === 0;
};

const createBooking = async (req, res) => {
  try {
    const { toolId, startDate, endDate } = req.body;

    const tool = await Tool.findById(toolId);
    if (!tool) {
      return res.status(404).json({ message: 'Tool not found' });
    }

    if (tool.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot book your own tool' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    if (start < tool.availableFrom || end > tool.availableTo) {
      return res.status(400).json({ message: 'Selected dates are outside tool availability' });
    }

    const isAvailable = await checkAvailability(toolId, start, end);
    if (!isAvailable) {
      return res.status(400).json({ message: 'Tool is already booked for these dates' });
    }

    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const rentalAmount = totalDays * tool.pricePerDay;

    const booking = await Booking.create({
      tool: toolId,
      borrower: req.user._id,
      owner: tool.owner,
      startDate: start,
      endDate: end,
      totalDays,
      rentalAmount,
      securityDeposit: tool.securityDeposit
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ borrower: req.user._id })
      .populate('tool', 'title pricePerDay images')
      .populate('owner', 'name email');
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOwnerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ owner: req.user._id })
      .populate('tool', 'title pricePerDay images')
      .populate('borrower', 'name email');
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const createPaymentIntent = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.borrower.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'Booking is not pending payment' });
    }

    const totalAmount = booking.rentalAmount + booking.securityDeposit;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount * 100,
      currency: 'inr',
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never'
      },
      metadata: {
        bookingId: booking._id.toString()
      }
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      amount: totalAmount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ message: 'Payment not completed' });
    }

    const bookingId = paymentIntent.metadata.bookingId;
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = 'confirmed';
    await booking.save();

    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const QRCode = require('qrcode');
const jwt = require('jsonwebtoken');

const generateQR = async (req, res) => {
  try {
    const { type } = req.query;

    if (!['pickup', 'return'].includes(type)) {
      return res.status(400).json({ message: 'Invalid QR type' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.borrower.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (type === 'pickup' && booking.status !== 'confirmed') {
      return res.status(400).json({ message: 'Booking is not ready for pickup' });
    }

    if (type === 'return' && booking.status !== 'active') {
      return res.status(400).json({ message: 'Booking is not active yet' });
    }

    const qrToken = jwt.sign(
      { bookingId: booking._id.toString(), type },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const qrImage = await QRCode.toDataURL(qrToken);

    res.status(200).json({ qrToken, qrImage });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const verifyQR = async (req, res) => {
  try {
    const { qrToken, hasDamage, damageDescription, damageAmount, damageImages } = req.body;

    const decoded = jwt.verify(qrToken, process.env.JWT_SECRET);
    const booking = await Booking.findById(decoded.bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (decoded.type === 'pickup') {
      if (booking.status !== 'confirmed') {
        return res.status(400).json({ message: 'Booking is not ready for pickup' });
      }
      booking.status = 'active';
      booking.pickupVerifiedAt = new Date();
      await booking.save();
      return res.status(200).json({ message: 'Pickup confirmed', booking });
    }

    if (decoded.type === 'return') {
      if (booking.status !== 'active') {
        return res.status(400).json({ message: 'Booking is not active' });
      }

      booking.status = 'completed';
      booking.returnVerifiedAt = new Date();
      booking.hasDamage = hasDamage || false;
      booking.damageDescription = damageDescription || '';
      booking.damageAmount = hasDamage ? (damageAmount || 0) : 0;
      booking.damageImages = damageImages || [];
      booking.refundAmount = booking.securityDeposit - booking.damageAmount;

      await booking.save();
      return res.status(200).json({ message: 'Return confirmed', booking });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createBooking, getMyBookings, getOwnerBookings, createPaymentIntent, confirmPayment, generateQR, verifyQR };

