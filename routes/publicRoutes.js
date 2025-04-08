// routes/publicRoutes.js
const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

router.get('/', publicController.index);
router.get('/courses', publicController.courses);
router.get('/course/:id', publicController.courseDetails);
router.get('/about', (req, res) => {
    res.render('aboutUs', { title: 'About Us' });
});
router.get('/locations', (req, res) => {
    res.render('location', { title: 'Our Locations' });
});

module.exports = router;
