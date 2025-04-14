// routes/organiserRoutes.js
const express = require('express');
const router = express.Router();
const organiserController = require('../controllers/organiserController');
const { ensureOrganiser } = require('../auth/authHelpers');

router.get('/', ensureOrganiser, organiserController.dashboard);
router.get('/new-course', ensureOrganiser, organiserController.showNewCourseForm);
router.post('/new-course', ensureOrganiser, organiserController.addNewCourse);
router.get('/edit-course/:id', ensureOrganiser, organiserController.showEditCourseForm);
router.post('/edit-course/:id', ensureOrganiser, organiserController.editCourse);
router.get('/delete-course/:id', ensureOrganiser, organiserController.deleteCourse);
router.get('/course/:id/bookings', ensureOrganiser, organiserController.showClassList);
router.get('/users', ensureOrganiser, organiserController.listUsers);
router.get('/users/delete/:id', ensureOrganiser, organiserController.deleteUser);
router.get('/new-organiser', ensureOrganiser, organiserController.showNewOrganiserForm);
router.post('/new-organiser', ensureOrganiser, organiserController.addNewOrganiser);
router.get('/new-update', ensureOrganiser, organiserController.showNewUpdateForm);
router.post('/new-update', ensureOrganiser, organiserController.addNewUpdate);
router.get('/updates/delete/:id', ensureOrganiser, organiserController.deleteUpdate);

module.exports = router;
