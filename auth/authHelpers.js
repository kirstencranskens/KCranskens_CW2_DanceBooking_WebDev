// auth/authHelpers.js
exports.ensureAuthenticated = function(req, res, next) {
    if (req.isAuthenticated && req.isAuthenticated()) {
      return next();
    }
    res.redirect('/login');
};

exports.ensureOrganiser = function(req, res, next) {
    if (req.isAuthenticated && req.isAuthenticated() && req.user.role === 'organiser') {
        return next();
    }
    res.status(403).send("Access denied: organiser privileges required.");
};
