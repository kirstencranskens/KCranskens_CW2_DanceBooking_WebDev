const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { ensureAuthenticated } = require('../auth/authHelpers');

// Route for cancelling a booking by its _id.
// This route requires the user to be authenticated.
router.get('/cancel/:bookingId', ensureAuthenticated, bookingController.cancelBooking);

// Route to view all bookings for the logged‑in user.
// This route requires authentication and is placed before the course-specific routes.
router.get('/my-bookings', ensureAuthenticated, bookingController.getUserBookings);

// Route for non-logged-in booking options and booking functionalities:
// - First, display booking options for a course.
// - Then, show the booking form and process the booking request.
router.get('/:courseId/options', bookingController.bookingOptions);
router.get('/:courseId', bookingController.showBookingForm);
router.post('/:courseId', bookingController.processBooking);

module.exports = router;
