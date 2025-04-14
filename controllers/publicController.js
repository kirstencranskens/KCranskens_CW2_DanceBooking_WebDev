// controllers/publicController.js
const courseModel = require('../models/courseModel');
const updateModel = require('../models/updateModel');

// Renders the homepage, including updates and user info.
exports.index = function(req, res) {
    updateModel.getAllUpdates()
      .then((updates) => {
          res.render('index', { title: 'Prism Dance Studio', user: req.user, updates: updates });
      })
      .catch((err) => {
          console.log("Error retrieving updates:", err);
          res.render('index', { title: 'Prism Dance Studio', user: req.user });
      });
};

// Renders the courses page, separating current and upcoming courses based on date.
exports.courses = function(req, res) {
    courseModel.getAllCourses()
        .then((courses) => {
            const today = new Date();
            const currentCourses = courses.filter(course => {
                const courseDate = new Date(course.date);
                // Course is current if it starts on or before today
                return courseDate <= today;
            });
            const upcomingCourses = courses.filter(course => {
                const courseDate = new Date(course.date);
                // Course is upcoming if it starts after today
                return courseDate > today;
            });
            res.render('courses', { 
                title: 'Courses', 
                currentCourses: currentCourses,
                upcomingCourses: upcomingCourses
            });
        })
        .catch((err) => {
            console.log('Error retrieving courses:', err);
            res.status(500).send('Error retrieving courses');
        });
};
// Renders the details page for a specific course.
exports.courseDetails = function(req, res) {
    const id = req.params.id;
    courseModel.getCourseById(id)
        .then((course) => {
            if (!course) {
                return res.status(404).send("Course not found");
            }
           // Add a flag to check if the course is still available for booking.
            course.isAvailable = course.capacity > 0;
            res.render('courseDetails', { title: 'Course Details', ...course });
        })
        .catch((err) => {
            console.log('Error retrieving course:', err);
            res.status(500).send("Error retrieving course details");
        });
};

