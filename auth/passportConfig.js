// auth/passportConfig.js
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');

// authenticate using email and password
passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  function(email, password, done) {
    // Convert email to lowercase before lookup
    userModel.lookup(email.toLowerCase(), function(err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, { message: 'Invalid credentials.' });
      }
      // Compare the provided password with the stored hashed password
      bcrypt.compare(password, user.password, function(err, result) {
        if (err) {
          return done(err);
        }
        if (result) {
          return done(null, user);
        } else {
          return done(null, false, { message: 'Invalid credentials.' });
        }
      });
    });
  }
));

// Serialize user by storing their email in the session
passport.serializeUser(function(user, done) {
  done(null, user.email);
});

// Deserialize user: retrieve full user details using their email
passport.deserializeUser(function(email, done) {
  userModel.lookup(email, function(err, user) {
    done(err, user);
  });
});

module.exports = passport;

