// models/courseModel.js
const nedb = require('gray-nedb');

class CourseModel {
  constructor(dbFilePath) {
    // Initialize the database: use file storage if a path is provided, otherwise use in-memory mode.
    if (dbFilePath) {
      this.db = new nedb({ filename: dbFilePath, autoload: true });
      console.log('CourseModel connected to ' + dbFilePath);
    } else {
      this.db = new nedb();
      console.log('CourseModel running in in-memory mode');
    }
  }

  // Add a new course
  addCourse(courseData, cb) {
    this.db.insert(courseData, function(err, doc) {
      if (err) {
        console.log('Error inserting course:', err);
        return cb(err);
      }
      console.log('Course inserted:', doc);
      cb(null, doc);
    });
  }

  // Retrieve all courses
  getAllCourses() {
    return new Promise((resolve, reject) => {
      this.db.find({}, function(err, courses) {
        if (err) {
          reject(err);
        } else {
          resolve(courses);
        }
      });
    });
  }

  // Retrieve a course by its id
  getCourseById(id) {
    return new Promise((resolve, reject) => {
      this.db.findOne({ _id: id }, function(err, course) {
        if (err) {
          reject(err);
        } else {
          resolve(course);
        }
      });
    });
  }

  // Update a course by id
  updateCourse(id, updateData, cb) {
    this.db.update({ _id: id }, { $set: updateData }, {}, function(err, numReplaced) {
      if (err) {
        return cb(err);
      }
      cb(null, numReplaced);
    });
  }

  // Delete a course by id
  deleteCourse(id, cb) {
    this.db.remove({ _id: id }, {}, function(err, numRemoved) {
      if (err) {
        return cb(err);
      }
      cb(null, numRemoved);
    });
  }

  // Seed the database with sample courses
  init() {
    // Clear existing courses (for testing)
    this.db.remove({}, { multi: true }, (err, numRemoved) => {
      if (err) {
        console.log('Error clearing courses:', err);
      }
      // Insert sample courses
      this.db.insert([
        { 
            name: 'Beginner Dance Class', 
            description: 'Learn the basics of dance.', 
            duration: '12 weeks', 
            price: 100,
            date: '2023-06-15',
            time: '18:00',
            location: 'Studio A',
            capacity: 1
          },
          { 
            name: 'Advanced Dance Techniques', 
            description: 'Learn the basics of dance.', 
            duration: '14 weeks', 
            price: 150,
            date: '2025-04-02',
            time: '17:30',
            location: 'Studio C',
            capacity: 20
          },
          { 
            name: 'Weekend Dance Workshop', 
            description: 'Intensive dance workshop over a weekend.', 
            duration: '1 week', 
            price: 40,
            date: '2025-09-18',
            time: '13:00',
            location: 'Studio B',
            capacity: 20
          }
        
      ], (err, newDocs) => {
        if (err) {
          console.log('Error seeding courses:', err);
        } else {
          console.log('Sample courses inserted:', newDocs);
        }
      });
    });
  }
}

const courseModel = new CourseModel();
courseModel.init();  // Seed the database with sample courses on startup
module.exports = courseModel;

