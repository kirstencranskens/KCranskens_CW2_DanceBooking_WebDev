// models/updateModel.js
const nedb = require('gray-nedb');

class UpdateModel {
  constructor(dbFilePath) {
    if (dbFilePath) {
      this.db = new nedb({ filename: dbFilePath, autoload: true });
      console.log('UpdateModel connected to ' + dbFilePath);
    } else {
      this.db = new nedb();
      console.log('UpdateModel running in in-memory mode');
    }
  }
  
  // Create a new update
  addUpdate(updateData, cb) {
    this.db.insert(updateData, function(err, doc) {
      if (err) {
        console.log('Error inserting update:', err);
        return cb(err);
      }
      console.log('Update inserted:', doc);
      cb(null, doc);
    });
  }
  
  // Retrieve all updates (sorted by newest first)
  getAllUpdates() {
    return new Promise((resolve, reject) => {
      this.db.find({}).sort({ createdAt: -1 }).exec(function(err, updates) {
        if (err) {
          reject(err);
        } else {
          resolve(updates);
        }
      });
    });
  }
}

const updateModelInstance = new UpdateModel();
module.exports = updateModelInstance;
