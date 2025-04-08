// models/userModel.js
const Datastore = require("gray-nedb");
const bcrypt = require('bcrypt');
const saltRounds = 10;

class UserModel {
    constructor(dbFilePath) {
        if (dbFilePath) {
            this.db = new Datastore({ filename: dbFilePath, autoload: true });
            console.log('UserModel connected to ' + dbFilePath);
        } else {
            this.db = new Datastore();
            console.log('UserModel running in in-memory mode');
        }
    }

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
    // Ensure email is always stored in lowercase
    const lowerEmail = email.toLowerCase();
    bcrypt.hash(password, saltRounds)
        .then(function(hash) {
            // Assign a default role "user" if needed; you can also do this later
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


    // Lookup a user by email; calls cb(err, user) with user = null if not found
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

const dao = new UserModel();
dao.init();
module.exports = dao;
