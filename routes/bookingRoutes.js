const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { ensureAuthenticated } = require('../auth/authHelpers');

// New route for cancelling a booking (using the booking record's _id)
router.get('/cancel/:bookingId', ensureAuthenticated, bookingController.cancelBooking);

// New route for viewing a user's bookings should come first
router.get('/my-bookings', ensureAuthenticated, bookingController.getUserBookings);

// Then the other routes:
router.get('/:courseId/options', bookingController.bookingOptions);
router.get('/:courseId', bookingController.showBookingForm);
router.post('/:courseId', bookingController.processBooking);

module.exports = router;
