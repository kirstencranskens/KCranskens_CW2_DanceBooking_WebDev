// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const passport = require('../auth/passportConfig');
const { ensureAuthenticated } = require('../auth/authHelpers');

router.get('/login', authController.showLoginPage);
router.post('/login', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err) { 
            return next(err); 
        }
        if (!user) { 
            req.flash('error', info.message || 'Invalid credentials.');
            return res.redirect('/login'); 
        }
        req.logIn(user, function(err) {
            if (err) { 
                return next(err); 
            }
            // Check for a redirect value from the form
            const redirectUrl = req.body.redirect || (user.role === 'organiser' ? '/organiser' : '/');
            return res.redirect(redirectUrl);
        });
    })(req, res, next);
});

router.get('/register', authController.showRegisterPage);
router.post('/register', authController.postNewUser);
router.get('/logout', ensureAuthenticated, authController.logout);

module.exports = router;
