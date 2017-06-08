'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt   = require('bcrypt-nodejs');

/*var TaskSchema = new Schema({
  name: {
    type: String,
    Required: 'Kindly enter the name of the task'
  },
  Created_date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: [{
      type: String,
      enum: ['pending', 'ongoing', 'completed']
    }],
    default: ['pending']
  }
});*/


var UserSchema = new Schema({
  _id: {  //username
    type: String,
    Required: true
  },
  name: {
    type: String,
    Required: true
  },
  email: {
    type: String,
    Required: true
  },
  password: {
    type: String,
    Required: true
  },
  WorkspaceIds: [{
    selected: Boolean,
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace'
    }
  }]  
});

var TaskSchema = new Schema({
  title: {
    type: String,
    Required: true
  },
  description: String,
  status: {
    type: String,
    Required: true,
    enum: ['pending', 'ongoing', 'completed']
  },
  AssigneeUserId: {
    type: String,
    ref: 'User'
  },
  FollowerUserIds: [{
    type: String,
    ref: 'User'
  }]
});

var ProjectSchema = new Schema({
  name: {
    type: String,
    Required: true
  },
  description: String,
  selected: Boolean,
  TaskIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Task'
  }]
});

var WorkspaceSchema = new Schema({
  name: {
    type: String,
    Required: true
  },
  MemberUserIds: [{
    type: String,
    ref: 'User'
  }],
  projects: [ProjectSchema]
});

var CommentSchema = new Schema({
  content: {
    type: String,
    Required: true
  },
  createdDateTime:{
    type: Date,
    Required: true
  },
  TaskId: {
    type: Schema.Types.ObjectId,
    ref: 'Task'
  },
  CommenterUserId: {
    type: String,
    ref: 'User'
  },
});

// methods ======================
// generating a hash
UserSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
UserSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

var User  = mongoose.model('User', UserSchema);
var Task  = mongoose.model('Task', TaskSchema);
var Workspace  = mongoose.model('Workspace', WorkspaceSchema);
var Comment  = mongoose.model('Comment', CommentSchema);
var Project  = mongoose.model('Project', ProjectSchema);

//module.exports = mongoose.model('Tasks', TaskSchema);




module.exports = {
    User: User,
    Task: Task,
    Workspace: Workspace,
    Comment: Comment,
    Project: Project
};