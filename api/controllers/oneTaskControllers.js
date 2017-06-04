'use strict';
var models = require('../models/oneTaskModels');

var mongoose = require('mongoose');
//  Task = mongoose.model('Tasks');

var User  = mongoose.model('User'),
 Task  = mongoose.model('Task'),
 Workspace  = mongoose.model('Workspace'),
 Comment  = mongoose.model('Comment'),
 Project  = mongoose.model('Project');

exports.createUser = function(req, res) {
  var newUser = new models.User(req.body);
  newUser.save(function(err, task) {
    if (err)
      res.send(err);
    res.json(task);
  });
};

exports.createWorkspace = function(req, res) {
  var newUser = new models.User(req.body);
  newUser.save(function(err, task) {
    if (err)
      res.send(err);
    res.json(task);
  });
};