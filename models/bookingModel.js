// models/bookingModel.js
const nedb = require('gray-nedb');

class BookingModel {
  constructor(dbFilePath) {
    // Initialize the database: use file storage if a path is provided; otherwise, use in-memory mode.
    if (dbFilePath) {
      this.db = new nedb({ filename: dbFilePath, autoload: true });
      console.log('BookingModel connected to ' + dbFilePath);
    } else {
      this.db = new nedb();
      console.log('BookingModel running in in-memory mode');
    }
  }

  // Adds a new booking to the database. The booking date is set automatically.
  addBooking(bookingData, cb) {
    const booking = {
      ...bookingData,
      bookedOn: new Date().toISOString().split('T')[0]
    };
    this.db.insert(booking, function(err, doc) {
      if (err) {
        console.log('Error inserting booking:', err);
        return cb(err);
      } else {
        console.log('Booking inserted:', doc);
        cb(null, doc);
      }
    });
  }

  // Retrieves the count of bookings for a specific course.
  getBookingCountForCourse(courseId) {
    return new Promise((resolve, reject) => {
      this.db.count({ courseId: courseId }, function(err, count) {
        if (err) {
          reject(err);
        } else {
          resolve(count);
        }
      });
    });
  }

  // Retrieve all bookings for a specific user by email
getBookingsForUser(email) {
    return new Promise((resolve, reject) => {
      this.db.find({ email: email }, function(err, bookings) {
        if (err) {
          reject(err);
        } else {
          resolve(bookings);
        }
      });
    });
  }

  // Retrieve all bookings for a specific course
getBookingsForCourse(courseId) {
    return new Promise((resolve, reject) => {
      this.db.find({ courseId: courseId }, function(err, bookings) {
        if (err) {
          reject(err);
        } else {
          resolve(bookings);
        }
      });
    });
  }  
  

 // Empty init function (can be used for seeding or initialization if needed).
  init() {}
}

// Create an instance of BookingModel, run any initialization code, and export it.
const bookingModelInstance = new BookingModel();
bookingModelInstance.init();
module.exports = bookingModelInstance;
