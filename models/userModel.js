// models/userModel.js
const Datastore = require("gray-nedb");
const bcrypt = require('bcrypt');
const saltRounds = 10;

class UserModel {
    constructor(dbFilePath) {
        // Initialize database: use file storage if dbFilePath provided; otherwise run in memory.
        if (dbFilePath) {
            this.db = new Datastore({ filename: dbFilePath, autoload: true });
            console.log('UserModel connected to ' + dbFilePath);
        } else {
            this.db = new Datastore();
            console.log('UserModel running in in-memory mode');
        }
    }

    // Pre-seed the database with a default organiser.
    init() {
        this.db.insert({
            user: 'organiser1',
            email: 'organiser1@example.com',
            password: '$2b$10$V/tLP.HU.CHgNB6hciJoKuNFyOofi/lKb0FHg4HtlElZEwoVE9Ihm',
            role: 'organiser'
        });
        console.log('Pre-seeded organiser inserted');
        return this;
    }

    // Create a new user with a hashed password
create(username, email, password, cb) {
    const that = this;
    // Convert email to lowercase for consistent storage
    const lowerEmail = email.toLowerCase();
    bcrypt.hash(password, saltRounds)
        .then(function(hash) {
            // Create the user entry (default role can be assigned later)
            const entry = { user: username, email: lowerEmail, password: hash };
            that.db.insert(entry, function(err, doc) {
                if (err) {
                    console.log("Can't insert user:", username);
                    return cb(err);
                }
                cb(null, doc);
            });
        })
        .catch(cb);
}


// Looks up a user by email (ignores case) and calls the callback with the user data.
lookup(email, cb) {
    const lowerEmail = email.toLowerCase();
    this.db.find({ email: lowerEmail }, function(err, entries) {
        if (err) {
            return cb(err, null);
        } else {
            if (entries.length === 0) {
                return cb(null, null);
            }
            return cb(null, entries[0]);
        }
    });
}


// Retrieve all users
getAllUsers(cb) {
    this.db.find({}, function(err, users) {
      if (err) {
        return cb(err, null);
      }
      cb(null, users);
    });
  }
  
  // Remove a user by _id
  removeUser(id, cb) {
    this.db.remove({ _id: id }, {}, function(err, numRemoved) {
      cb(err, numRemoved);
    });
  }
  
}

// Create an instance of UserModel, initialize with a pre-seeded organiser, and export it.
const dao = new UserModel();
dao.init();
module.exports = dao;
