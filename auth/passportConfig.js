// auth/passportConfig.js
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');

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


passport.serializeUser(function(user, done) {
  done(null, user.email);
});

passport.deserializeUser(function(email, done) {
  userModel.lookup(email, function(err, user) {
    done(err, user);
  });
});

module.exports = passport;

