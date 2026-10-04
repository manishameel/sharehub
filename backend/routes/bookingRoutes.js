const express = require('express');
const protect = require('../middleware/authMiddleware');
const { createBooking, getMyBookings, getOwnerBookings } = require('../controllers/bookingController');
const { createPaymentIntent, confirmPayment } = require('../controllers/bookingController');
const { generateQR, verifyQR } = require('../controllers/bookingController');



const router = express.Router();

router.post('/', protect, createBooking);
router.get('/my-bookings', protect, getMyBookings);
router.get('/owner-bookings', protect, getOwnerBookings);


router.post('/:id/create-payment-intent', protect, createPaymentIntent);
router.post('/confirm-payment', protect, confirmPayment);

router.get('/:id/generate-qr', protect, generateQR);
router.post('/verify-qr', protect, verifyQR);

module.exports = router;