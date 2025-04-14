// controllers/authController.js

// Renders the login page with any flash error messages and an optional redirect URL.
exports.showLoginPage = function(req, res) {
    res.render('user/login', { 
      title: 'Sign In', 
      error: req.flash('error'),
      redirect: req.query.redirect 
    });
};
// Renders the registration page with any flash error messages and an optional redirect URL.
exports.showRegisterPage = function(req, res) {
    res.render('user/register', {
         title: 'Register',
          error: req.flash('error'),
           redirect: req.query.redirect 
    });
};

// Processes new user registration, ensuring all fields are filled, passwords match,
// and that no user exists with the provided email (case-insensitive). If valid, it creates
// the user and logs them in, then redirects to the specified URL.
exports.postNewUser = function(req, res, next) {
    const username = req.body.username;
    // Lower-case the email right away
    const email = req.body.email.toLowerCase();
    const password = req.body.pass;
    const confirm = req.body.confirm;
    const redirectUrl = req.body.redirect || '/';

    if (!username || !password || !email || !confirm) {
        req.flash('error', 'All fields are required.');
        return res.redirect('/register');
    }
    if (password !== confirm) {
        req.flash('error', 'Passwords do not match.');
        return res.redirect('/register');
    }
    const userModel = require('../models/userModel');
    userModel.lookup(email, function(err, existingUser) {
        if (err) {
            req.flash('error', 'Error checking for an existing user.');
            return res.redirect('/register');
        }
        if (existingUser) {
            req.flash('error', 'A user with the email ' + email + ' already exists.');
            return res.redirect('/register');
        }
        userModel.create(username, email, password, function(err, newUser) {
            if (err) {
                req.flash('error', 'Error creating user.');
                return res.redirect('/register');
            }
            console.log("Registered user", username);
            req.login(newUser, function(err) {
                if (err) { 
                    return next(err); 
                }
                return res.redirect(redirectUrl);
            });
        });
    });
};

// Logs the user out and redirects to the homepage.
exports.logout = function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
};

