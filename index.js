require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const mustacheExpress = require('mustache-express');
const passport = require('./auth/passportConfig');
const flash = require('connect-flash');
const app = express();


// Configure Mustache as the template engine
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', path.join(__dirname, 'views'));

// Middleware for parsing form data and cookies
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(flash());

// Set up sessions (required by Passport)
app.use(session({
    secret: 'your session secret here',
    resave: false,
    saveUninitialized: false
}));

// Initialize Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Add this middleware to expose req.user to templates
app.use((req, res, next) => {
    if (req.user && req.user.role === 'organiser') {
      req.user.organiser = true;
    }
    res.locals.user = req.user;
    next();
  });
  
  

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// Import and mount route files
const publicRoutes = require('./routes/publicRoutes');
const authRoutes = require('./routes/authRoutes');
const organiserRoutes = require('./routes/organiserRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const updateModel = require('./models/updateModel');

app.use('/', publicRoutes);        // Public pages (landing, courses, course details)
app.use('/', authRoutes);          // Authentication routes (login, register, logout)
app.use('/organiser', organiserRoutes);  // Organiser-specific routes
app.use('/book', bookingRoutes);   // Booking routes

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});


exports.index = function(req, res) {
    // Get updates along with existing homepage content
    updateModel.getAllUpdates()
      .then((updates) => {
          res.render('index', { title: 'Prism Dance Studio', user: req.user, updates: updates });
      })
      .catch((err) => {
          console.log("Error retrieving updates:", err);
          res.render('index', { title: 'Prism Dance Studio', user: req.user });
      });
};

