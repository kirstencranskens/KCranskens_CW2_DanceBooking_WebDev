// controllers/organiserController.js
const courseModel = require('../models/courseModel');
const bookingModel = require('../models/bookingModel');
//const bookingModel = new bookingModel();

exports.dashboard = function(req, res) {
    courseModel.getAllCourses()
        .then((courses) => {
            res.render('organiser', { 
                title: 'Organiser Dashboard', 
                user: req.user,
                courses: courses
            });
            console.log("Organiser dashboard loaded with courses.");
        })
        .catch((err) => {
            console.log("Error retrieving courses", err);
            res.status(500).send("Error retrieving courses");
        });
};

exports.showNewCourseForm = function(req, res) {
    res.render('newCourse', { title: 'Add New Course' });
};

exports.addNewCourse = function(req, res) {
    // Combine duration value and unit into a single string
    const durationValue = req.body.durationValue;
    const durationUnit = req.body.durationUnit;
    const duration = `${durationValue} ${durationUnit}`;

    const courseData = {
        name: req.body.name,
        description: req.body.description,
        duration: duration,
        price: req.body.price,
        date: req.body.date,
        time: req.body.time,
        location: req.body.location,
        capacity: req.body.capacity
    };
    courseModel.addCourse(courseData, function(err, doc) {
        if (err) {
            return res.status(500).send('Error adding course');
        }
        res.redirect('/organiser');
    });
};



exports.showEditCourseForm = function(req, res) {
    const id = req.params.id;
    courseModel.getCourseById(id)
      .then(course => {
          if (!course) {
              return res.status(404).send("Course not found");
          }
          // Set flags for the location dropdown
          course.isStudioA = course.location === 'Studio A';
          course.isStudioB = course.location === 'Studio B';
          course.isStudioC = course.location === 'Studio C';
          course.isStudioD = course.location === 'Studio D';
          course.isStudioE = course.location === 'Studio E';

          // Also split the duration if needed (as before)
          let durationParts = course.duration.split(' ');
          course.durationValue = durationParts[0];
          course.durationUnit = durationParts[1] || 'weeks';
          course.isDays = course.durationUnit === 'days';
          course.isWeeks = course.durationUnit === 'weeks';
          
          res.render('editCourse', { title: 'Edit Course', course: course });
      })
      .catch(err => {
          console.log("Error retrieving course:", err);
          res.status(500).send("Error retrieving course details");
      });
};


exports.editCourse = function(req, res) {
    const id = req.params.id;
    // Combine the new duration value and unit
    const durationValue = req.body.durationValue;
    const durationUnit = req.body.durationUnit;
    const duration = `${durationValue} ${durationUnit}`;

    const updateData = {
        name: req.body.name,
        description: req.body.description,
        duration: duration,
        price: req.body.price,
        date: req.body.date,
        time: req.body.time,
        location: req.body.location,
        capacity: req.body.capacity
    };
    courseModel.updateCourse(id, updateData, function(err, numReplaced) {
        if (err) {
            return res.status(500).send("Error updating course");
        }
        res.redirect('/organiser');
    });
};


exports.deleteCourse = function(req, res) {
    const id = req.params.id;
    courseModel.deleteCourse(id, function(err, numRemoved) {
        if (err) {
            return res.status(500).send("Error deleting course");
        }
        // After deleting the course, delete all bookings with this courseId
        bookingModel.db.remove({ courseId: id }, { multi: true }, function(err, numBookingsRemoved) {
            if (err) {
                console.log("Error deleting associated bookings:", err);
                // Optionally handle this error or log it and still redirect
            } else {
                console.log(`Deleted ${numBookingsRemoved} associated booking(s).`);
            }
            res.redirect('/organiser');
        });
    });
};


exports.showClassList = function(req, res) {
    const courseId = req.params.id;  // Expect the course id from the route
    bookingModel.getBookingsForCourse(courseId)
        .then((bookings) => {
            res.render('classList', { 
                title: 'Class List', 
                bookings: bookings 
            });
            console.log('Class list rendered for course', courseId);
        })
        .catch((err) => {
            console.log('Error retrieving class list:', err);
            res.status(500).send('Error retrieving class list');
        });
};


// List all users (organiser-only)
exports.listUsers = function(req, res) {
    const userModel = require('../models/userModel');
    userModel.getAllUsers(function(err, users) {
        if (err) {
            console.log("Error retrieving users:", err);
            return res.status(500).send("Error retrieving users");
        }
        
        // Separate users into organisers and regular users
        const organisers = [];
        const regularUsers = [];
        
        users.forEach(user => {
            // Mark the currently logged in organiser so they cannot be deleted
            if (req.user && req.user._id === user._id) {
                user.isCurrentUser = true;
            } else {
                user.isCurrentUser = false;
            }
            
            // Check the user's role
            if (user.role && user.role === 'organiser') {
                organisers.push(user);
            } else {
                regularUsers.push(user);
            }
        });
        
        res.render('userManagement', { 
            title: 'User Management', 
            organisers: organisers, 
            users: regularUsers 
        });
    });
};


  // Remove a user (organiser-only)
  exports.deleteUser = function(req, res) {
    const userId = req.params.id;
    // Prevent an organiser from deleting themselves
    if (req.user && req.user._id === userId) {
        return res.status(403).send("You cannot delete your own account.");
    }
    const userModel = require('../models/userModel');
    userModel.removeUser(userId, function(err, numRemoved) {
      if (err) {
        console.log("Error deleting user:", err);
        return res.status(500).send("Error deleting user");
      }
      res.redirect('/organiser/users');
    });
};

// Display the form to add a new organiser
exports.showNewOrganiserForm = function(req, res) {
    res.render('newOrganiser', { title: 'Add New Organiser' });
};

// Process new organiser creation
exports.addNewOrganiser = function(req, res) {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.pass;
    
    if (!username || !email || !password) {
        return res.status(400).send("All fields are required.");
    }
    
    const userModel = require('../models/userModel');
    userModel.create(username, email, password, function(err, newUser) {
        if (err) {
            return res.status(500).send("Error creating organiser.");
        }
        // Update the newly created user's role to 'organiser' in the database
        userModel.db.update({ _id: newUser._id }, { $set: { role: 'organiser' }}, {}, function(err, numReplaced) {
            if (err) {
                return res.status(500).send("Error updating organiser role.");
            }
            res.redirect('/organiser/users');
        });
    });
};

// Display the new update form
exports.showNewUpdateForm = function(req, res) {
    res.render('newUpdate', { title: 'Add New Update' });
};

// Process adding a new update
exports.addNewUpdate = function(req, res) {
    const updateData = {
        title: req.body.title,
        content: req.body.content,
        createdAt: new Date().toISOString()
    };
    const updateModel = require('../models/updateModel');
    updateModel.addUpdate(updateData, function(err, doc) {
        if (err) {
            return res.status(500).send('Error adding update');
        }
        res.redirect('/organiser'); // Or to a dedicated updates page if desired
    });
};


