// controllers/bookingController.js
const bookingModel = require('../models/bookingModel');
const courseModel = require('../models/courseModel');
const { ensureAuthenticated } = require('../auth/authHelpers');

// Gets all bookings for the logged‑in user and renders the bookings history page.
exports.getUserBookings = function(req, res) {
    // If user is not logged in, redirect to login with redirect URL.
if (!req.user) {
    return res.redirect('/login?redirect=/bookings');
  }
  const userEmail = req.user.email;
  bookingModel.getBookingsForUser(userEmail)
    .then((bookings) => {
      res.render('bookingHistory', {
        title: 'Your Bookings',
        bookings: bookings
      });
    })
    .catch((err) => {
      console.log("Error retrieving bookings: ", err);
      res.status(500).send("Error retrieving your bookings");
    });
};

// Retrieves course details and renders the booking form with course information.
exports.showBookingForm = function(req, res) {
    const courseId = req.params.courseId;
    courseModel.getCourseById(courseId)
      .then((course) => {
         if (!course) {
             return res.status(404).send("Course not found");
         }
         res.render('bookingForm', { 
           title: 'Book a Course', 
           courseId: courseId, 
           courseName: course.name 
         });
      })
      .catch((err) => {
          console.log("Error retrieving course:", err);
          res.status(500).send("Error retrieving course details");
      });
};

// Processes a booking: checks capacity, updates capacity, and renders a confirmation page.
exports.processBooking = function(req, res) {
    const courseId = req.params.courseId;
    courseModel.getCourseById(courseId)
      .then((course) => {
         if (!course) {
             return res.status(404).send("Course not found");
         }
         // Determine available capacity (defaulting to 20 if not provided)
         let capacity = (course.capacity !== undefined && course.capacity !== null) ? course.capacity : 20;
         
         return bookingModel.getBookingCountForCourse(courseId)
            .then((count) => {
                if (count >= capacity) {
                    return res.send("Course fully booked");
                }
                // Create booking data, including extra course details
                const bookingData = {
                    courseId: courseId,
                    userName: req.body.userName,
                    email: req.body.email,
                    bookedOn: new Date().toISOString().split('T')[0],
                    courseName: course.name,    
                    date: course.date,          
                    time: course.time,          
                    location: course.location   
                };

                
                bookingModel.addBooking(bookingData, function(err, bookingDoc) {
                    if (err) {
                        return res.status(500).send("Error processing booking");
                    }
                    // Log the booking document and update course capacity
                    bookingDoc.courseId = courseId;
                    console.log("Booking Doc:", bookingDoc);
                    
                    let newCapacity = capacity - 1;
                    courseModel.updateCourse(courseId, { capacity: newCapacity }, function(err, numReplaced) {
                        if (err) {
                            return res.status(500).send("Error updating course capacity");
                        }
                        res.render('bookingConfirmation', { booking: bookingDoc });
                    });
                });
            });
      })
      .catch((err) => {
          console.log("Error retrieving course details:", err);
          res.status(500).send("Error retrieving course details");
      });
};

// Renders a page with booking options for non-logged-in users.
// If the user is logged in, redirects directly to the booking form.
exports.bookingOptions = function(req, res) {
    const courseId = req.params.courseId;
    if (req.user) {
      return res.redirect('/book/' + courseId);
    }
    res.render('bookingOptions', { title: 'Book this Course', courseId: courseId });
  };

 // Cancels a booking: retrieves the booking, updates course capacity,
 // removes the booking, and redirects to the user's bookings page.
  exports.cancelBooking = function(req, res) {
    const bookingId = req.params.bookingId;
    
    bookingModel.db.findOne({ _id: bookingId }, function(err, booking) {
        if (err || !booking) {
            console.log("Error retrieving booking or booking not found:", err);
            return res.status(404).send("Booking not found");
        }
        const courseId = booking.courseId;
        
        courseModel.getCourseById(courseId)
          .then((course) => {
              if (!course) {
                  return res.status(404).send("Course not found");
              }

              let newCapacity = course.capacity + 1;
              courseModel.updateCourse(courseId, { capacity: newCapacity }, function(err, numReplaced) {
                  if (err) {
                      console.log("Error updating course capacity:", err);
                      return res.status(500).send("Error updating course capacity");
                  }

                  bookingModel.db.remove({ _id: bookingId }, {}, function(err, numRemoved) {
                      if (err) {
                          console.log("Error cancelling booking:", err);
                          return res.status(500).send("Error cancelling booking");
                      }
                      res.redirect('/book/my-bookings');
                  });
              });
          })
          .catch((err) => {
              console.log("Error retrieving course:", err);
              res.status(500).send("Error retrieving course details");
          });
    });
};

