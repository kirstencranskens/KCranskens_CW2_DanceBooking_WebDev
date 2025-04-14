// routes/organiserRoutes.js
const express = require('express');
const router = express.Router();
const organiserController = require('../controllers/organiserController');
const { ensureOrganiser } = require('../auth/authHelpers');

// Organiser Dashboard
router.get('/', ensureOrganiser, organiserController.dashboard);

// Routes to create a new course
router.get('/new-course', ensureOrganiser, organiserController.showNewCourseForm);
router.post('/new-course', ensureOrganiser, organiserController.addNewCourse);

// Routes to edit an existing course
router.get('/edit-course/:id', ensureOrganiser, organiserController.showEditCourseForm);
router.post('/edit-course/:id', ensureOrganiser, organiserController.editCourse);

// Route to delete a course (also deletes associated bookings)
router.get('/delete-course/:id', ensureOrganiser, organiserController.deleteCourse);

// Route to view the class list for a specific course
router.get('/course/:id/bookings', ensureOrganiser, organiserController.showClassList);

// Routes for user management (list users and delete a user)
router.get('/users', ensureOrganiser, organiserController.listUsers);
router.get('/users/delete/:id', ensureOrganiser, organiserController.deleteUser);

// Routes to add a new organiser account
router.get('/new-organiser', ensureOrganiser, organiserController.showNewOrganiserForm);
router.post('/new-organiser', ensureOrganiser, organiserController.addNewOrganiser);

// Routes to add a new update (blog style post) and delete an update
router.get('/new-update', ensureOrganiser, organiserController.showNewUpdateForm);
router.post('/new-update', ensureOrganiser, organiserController.addNewUpdate);
router.get('/updates/delete/:id', ensureOrganiser, organiserController.deleteUpdate);

module.exports = router;
