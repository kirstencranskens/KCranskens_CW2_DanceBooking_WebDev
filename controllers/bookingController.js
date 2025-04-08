// controllers/bookingController.js
const bookingModel = require('../models/bookingModel');
const courseModel = require('../models/courseModel');
const { ensureAuthenticated } = require('../auth/authHelpers');

exports.getUserBookings = function(req, res) {
// Ensure the user is logged in (you could also attach ensureAuthenticated in your route)
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

exports.showBookingForm = function(req, res) {
    const courseId = req.params.courseId;
    courseModel.getCourseById(courseId)
      .then((course) => {
         if (!course) {
             return res.status(404).send("Course not found");
         }
         // Render bookingForm with both courseId and courseName
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


exports.processBooking = function(req, res) {
    const courseId = req.params.courseId;
    // We'll get the course details first before building bookingData.
    courseModel.getCourseById(courseId)
      .then((course) => {
         if (!course) {
             return res.status(404).send("Course not found");
         }
         // Use course.capacity if provided; otherwise, default to 20 (using an explicit check)
         let capacity = (course.capacity !== undefined && course.capacity !== null) ? course.capacity : 20;
         
         // Count current bookings for this course
         return bookingModel.getBookingCountForCourse(courseId)
            .then((count) => {
                if (count >= capacity) {
                    // Course is fully booked
                    return res.send("Course fully booked");
                }
                
                // Build bookingData including extra course details
                const bookingData = {
                    courseId: courseId,
                    userName: req.body.userName,
                    email: req.body.email,
                    bookedOn: new Date().toISOString().split('T')[0],
                    courseName: course.name,    // extra detail
                    date: course.date,          // extra detail
                    time: course.time,          // extra detail
                    location: course.location   // extra detail
                };

                // Otherwise, add the booking
                bookingModel.addBooking(bookingData, function(err, bookingDoc) {
                    if (err) {
                        return res.status(500).send("Error processing booking");
                    }
                    // (Optional) Ensure the booking document has the courseId (should already be there)
                    bookingDoc.courseId = courseId;
                    console.log("Booking Doc:", bookingDoc);
                    
                    // After adding the booking, decrement the course capacity by 1.
                    let newCapacity = capacity - 1;
                    courseModel.updateCourse(courseId, { capacity: newCapacity }, function(err, numReplaced) {
                        if (err) {
                            return res.status(500).send("Error updating course capacity");
                        }
                        // Render the booking confirmation page using the full booking document
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


exports.bookingOptions = function(req, res) {
    const courseId = req.params.courseId;
    // If the user is already logged in, you might want to skip this page.
    if (req.user) {
      return res.redirect('/book/' + courseId);
    }
    // Render the booking options page for non-logged-in users
    res.render('bookingOptions', { title: 'Book this Course', courseId: courseId });
  };

  exports.cancelBooking = function(req, res) {
    const bookingId = req.params.bookingId;
    
    // First, retrieve the booking to know which course it is associated with.
    bookingModel.db.findOne({ _id: bookingId }, function(err, booking) {
        if (err || !booking) {
            console.log("Error retrieving booking or booking not found:", err);
            return res.status(404).send("Booking not found");
        }
        const courseId = booking.courseId;
        
        // Get the course to retrieve the current capacity.
        courseModel.getCourseById(courseId)
          .then((course) => {
              if (!course) {
                  return res.status(404).send("Course not found");
              }
              // Increment the course capacity by 1
              let newCapacity = course.capacity + 1;
              courseModel.updateCourse(courseId, { capacity: newCapacity }, function(err, numReplaced) {
                  if (err) {
                      console.log("Error updating course capacity:", err);
                      return res.status(500).send("Error updating course capacity");
                  }
                  // Remove the booking
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

