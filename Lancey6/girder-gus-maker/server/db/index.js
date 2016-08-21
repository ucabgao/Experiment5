'use strict';
const Promise = require('bluebird');
const path = require('path');
const chalk = require('chalk');

var mongoose = require('mongoose');


const DATABASE_URI = require(path.join(__dirname, '../env')).DATABASE_URI;

var oldMongoose = false;
var db = mongoose.connect(DATABASE_URI);
if ( db.connection !== undefined ) {
  db = db.connection;
  oldMongoose = true;
}

// Require our models -- these should register the model into mongoose
// so the rest of the application can simply call mongoose.model('User')
// anywhere the User model needs to be used.
require('./models');

var startDbPromise = null;
if ( oldMongoose ) {
  startDbPromise = new Promise(function (resolve, reject) {
	    db.on('open', resolve);
		    db.on('error', reject);
  });
} else {
  startDbPromise = db;
}

console.log(chalk.yellow('Opening connection to MongoDB . . .'));
startDbPromise.then(function () {
    console.log(chalk.green('MongoDB connection opened!'));
});

module.exports = startDbPromise;
