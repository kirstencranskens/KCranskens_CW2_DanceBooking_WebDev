// controllers/organiserController.js
const courseModel = require('../models/courseModel');
const bookingModel = require('../models/bookingModel');

// Renders the organiser dashboard with a list of all courses.
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
// Displays the form to add a new course.
exports.showNewCourseForm = function(req, res) {
    res.render('newCourse', { title: 'Add New Course' });
};
// Processes the form submission for adding a new course.
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

// Displays the form to edit an existing course with pre-filled details.
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

          // Split duration into value and unit
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

// Processes the edit course form submission and updates the course.
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

// Deletes a course and its associated bookings.
exports.deleteCourse = function(req, res) {
    const id = req.params.id;
    courseModel.deleteCourse(id, function(err, numRemoved) {
        if (err) {
            return res.status(500).send("Error deleting course");
        }
        // Delete all bookings associated with the course
        bookingModel.db.remove({ courseId: id }, { multi: true }, function(err, numBookingsRemoved) {
            if (err) {
                console.log("Error deleting associated bookings:", err);
                // Even if bookings deletion fails, still redirect
            } else {
                console.log(`Deleted ${numBookingsRemoved} associated booking(s).`);
            }
            res.redirect('/organiser');
        });
    });
};

// Renders the class list for a given course.
exports.showClassList = function(req, res) {
    const courseId = req.params.id;  
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


// Lists all users by separating organisers and regular users.
exports.listUsers = function(req, res) {
    const userModel = require('../models/userModel');
    userModel.getAllUsers(function(err, users) {
        if (err) {
            console.log("Error retrieving users:", err);
            return res.status(500).send("Error retrieving users");
        }
        
        
        const organisers = [];
        const regularUsers = [];
        // Mark the currently logged-in organiser so they cannot be deleted
        users.forEach(user => {
            // Separate based on role
            if (req.user && req.user._id === user._id) {
                user.isCurrentUser = true;
            } else {
                user.isCurrentUser = false;
            }
            
            
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


  // Deletes a user, ensuring an organiser cannot delete themselves.
  exports.deleteUser = function(req, res) {
    const userId = req.params.id;
    
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

// Displays the form to add a new organiser.
exports.showNewOrganiserForm = function(req, res) {
    res.render('newOrganiser', { title: 'Add New Organiser' });
};

// Processes the creation of a new organiser.
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
        
        // Update the new user's role to 'organiser'
        userModel.db.update({ _id: newUser._id }, { $set: { role: 'organiser' }}, {}, function(err, numReplaced) {
            if (err) {
                return res.status(500).send("Error updating organiser role.");
            }
            res.redirect('/organiser/users');
        });
    });
};

// Displays the form to add a new update.
exports.showNewUpdateForm = function(req, res) {
    res.render('newUpdate', { title: 'Add New Update' });
};

// Processes the addition of a new update.
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
        res.redirect('/'); // Redirect to the homepage
    });
};
// Deletes an update.
exports.deleteUpdate = function(req, res) {
    const updateId = req.params.id;
    const updateModel = require('../models/updateModel');
    updateModel.db.remove({ _id: updateId }, { multi: false }, function(err, numRemoved) {
        if (err) {
            console.error("Error deleting update:", err);
            return res.status(500).send("Error deleting update");
        }
        console.log(`Deleted update ${updateId}: ${numRemoved} removed.`);
        res.redirect('/'); // Redirect to the homepage
    });
};



