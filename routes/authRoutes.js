// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const passport = require('../auth/passportConfig');
const { ensureAuthenticated } = require('../auth/authHelpers');

// GET /login – Show the login page.
router.get('/login', authController.showLoginPage);
// POST /login – Process login form submission.
router.post('/login', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err) { 
            return next(err); 
        }
        if (!user) { 
            // Flash an error message and redirect to the login page if authentication fails.
            req.flash('error', info.message || 'Invalid credentials.');
            return res.redirect('/login'); 
        }
        // Log the user in and redirect them; use the form's redirect or a default based on role.
        req.logIn(user, function(err) {
            if (err) { 
                return next(err); 
            }
            const redirectUrl = req.body.redirect || (user.role === 'organiser' ? '/organiser' : '/');
            return res.redirect(redirectUrl);
        });
    })(req, res, next);
});

// GET /register – Show the registration page.
router.get('/register', authController.showRegisterPage);

// POST /register – Process the registration form submission.
router.post('/register', authController.postNewUser);

// GET /logout – Log the user out (only if authenticated).
router.get('/logout', ensureAuthenticated, authController.logout);

module.exports = router;
