// controllers/authController.js
exports.showLoginPage = function(req, res) {
    res.render('user/login', { 
      title: 'Sign In', 
      error: req.flash('error'),
      redirect: req.query.redirect 
    });
};

exports.showRegisterPage = function(req, res) {
    res.render('user/register', { title: 'Register', error: req.flash('error'), redirect: req.query.redirect });
};

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



exports.logout = function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
};

