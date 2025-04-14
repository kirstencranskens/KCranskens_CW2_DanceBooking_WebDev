// routes/publicRoutes.js
const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

// Renders the homepage.
router.get('/', publicController.index);

// Renders the courses page.
router.get('/courses', publicController.courses);

// Renders details for a specific course.
router.get('/course/:id', publicController.courseDetails);

// Renders the About Us page.
router.get('/about', (req, res) => {
    res.render('aboutUs', { title: 'About Us' });
});

// Renders the Locations page.
router.get('/locations', (req, res) => {
    res.render('location', { title: 'Our Locations' });
});

module.exports = router;
