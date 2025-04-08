// models/bookingModel.js
const nedb = require('gray-nedb');

class BookingModel {
  constructor(dbFilePath) {
    if (dbFilePath) {
      this.db = new nedb({ filename: dbFilePath, autoload: true });
      console.log('BookingModel connected to ' + dbFilePath);
    } else {
      this.db = new nedb();
      console.log('BookingModel running in in-memory mode');
    }
  }

  // Create a new booking
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

  // Retrieve all bookings for a specific course
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
  

  // Seed the database with sample bookings
  init() {
    // Clear existing bookings (for testing)
    //this.db.remove({}, { multi: true }, (err, numRemoved) => {
    //  if (err) {
    //    console.log('Error clearing bookings:', err);
    //  }
      // Insert sample bookings
    //  this.db.insert([
    //    { courseId: 'sampleCourseId1', userName: 'Alice', email: 'alice@example.com', bookedOn: '2023-01-01' },
    //    { courseId: 'sampleCourseId2', userName: 'Bob', email: 'bob@example.com', bookedOn: '2023-01-02' }
    //  ], (err, newDocs) => {
    //    if (err) {
    //      console.log('Error seeding bookings:', err);
    //    } else {
    //      console.log('Sample bookings inserted:', newDocs);
    //    }
    //  });
    //});
  }
}

// Create an instance, seed the bookings, and export it
const bookingModelInstance = new BookingModel();
bookingModelInstance.init();
module.exports = bookingModelInstance;
