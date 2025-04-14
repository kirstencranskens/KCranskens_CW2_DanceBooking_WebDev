// auth/authHelpers.js

// Checks if the user is logged in. Redirects to the login page if not.
exports.ensureAuthenticated = function(req, res, next) {
    if (req.isAuthenticated && req.isAuthenticated()) {
      return next();
    }
    res.redirect('/login');
};


// Checks if the logged-in user is an organiser. Sends a 403 error if not.
exports.ensureOrganiser = function(req, res, next) {
    if (req.isAuthenticated && req.isAuthenticated() && req.user.role === 'organiser') {
        return next();
    }
    res.status(403).send("Access denied: organiser privileges required.");
};
