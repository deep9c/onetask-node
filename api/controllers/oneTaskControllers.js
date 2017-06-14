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
  newUser.save(function(err, user) {
    if (err)
      res.send(err);
    res.json(user);
  });
};

/*exports.createWorkspace = function(req, res) {
  var newUser = new models.User(req.body);
  newUser.save(function(err, user) {
    if (err)
      res.send(err);
    res.json(user);
  });
};*/

exports.getWorkspace = function(req,res){
  Workspace.findById(req.params.workspaceid, (err,workspace)=>{
    if(err)
      res.send(err);
    res.json(workspace);
  })
};

exports.getTasks = function(req,res){
  var workspaceid = req.params.workspaceid;
  var projid = req.params.projid;
  console.log('getTasks called req.params.workspaceid= ' + workspaceid + '..projid= ' + projid);

  //Workspace.find({'projects._id': projid}, (err, foundWorkspace)=>{});

  Workspace.findById(workspaceid, (err,workspace)=>{
    if(err)
      res.send(err);
    
    var requiredprojindex = workspace.projects.findIndex((proj)=>{
      return proj._id == projid;
    });

    //console.log('reqd project::- ' + workspace.projects[requiredprojindex]);
    var TasksList = {tasks: []};
    if(workspace.projects[requiredprojindex].TaskIds){
      var promise1 = workspace.projects[requiredprojindex].TaskIds.map((taskid)=>{
        return Task.findById(taskid, (err, task)=>{
          if(err)
            res.send(err);
          //console.log('Task found--> ' + JSON.stringify(task));
          TasksList.tasks.push(task);
          return task;
        });
      
      });
      Promise.all(promise1).then((result)=>{
        //console.log('getTasks response -->> ' + JSON.stringify(TasksList));
        res.json(TasksList);    //array of Task json-objects
      });
    }
    
  })

};

exports.createTask = function(req,res){
  var newTask = new Task();
  newTask.title = req.body.title;
  newTask.description = req.body.description;
  newTask.status = 'pending';
  newTask.AssigneeUserId = req.body.username;
  newTask.FollowerUserIds.push(req.body.username);

  newTask.save((err,newtasksaved)=>{
    if(err)
        res.send(err);

    Workspace.update(
      {_id: req.body.workspaceid, 'projects._id': req.body.projectid},
      {$push: {'projects.$.TaskIds': newtasksaved._id}},
      (err, result)=>{
        if(err)
          res.send(err);
        else{
          if(result)
            res.status(200).json(newtasksaved);
          else{
            res.status(204);
          }
        }
      }
    );
  });
};

exports.getComments = function(req,res){
  var taskid = req.params.taskid;
  var commentsResp = {comments: []};
  Comment.find(
    {'TaskId': taskid}, 
    (err, comments)=>{
      console.log('found comments:- ' + comments);
      commentsResp.comments = comments;
      res.json(commentsResp);
    });
};

exports.createComment = function(req,res){
  console.log('req received in createComment:- ' + JSON.stringify(req.body));
  var newComment = new Comment(req.body);
  newComment.createdDateTime = new Date();

  newComment.save((err,newcommentsaved)=>{
    if(err)
        res.send(err);

    res.json(newcommentsaved);
  });
};

exports.createProject = function(req,res){
  console.log('req received in createProject:- ' + JSON.stringify(req.body));
  var newProject = new Project();
  newProject.name = req.body.name;
  newProject.description = req.body.description;
  newProject.selected = false;

  var workspaceid = req.body.wsid;

  Workspace.update(
    {_id: workspaceid},
    {$push: {'projects': newProject}},
    (err, result)=>{
      if(err)
        res.send(err);
      else{
        if(result)
          res.status(200).json(newProject);
        else{
          res.status(500);
        }
      }
    }
  );
};

exports.createWorkspace = function(req,res){
  console.log('received req into createWorkspace: ' + JSON.stringify(req.body));
  var newWorkspace = new Workspace();
  newWorkspace.name = req.body.workspacename;
  newWorkspace.MemberUserIds.push(req.body.username);
  //newWorkspace.projects.push(newProject);   //projects are embedded into workspace

  //get user here  
  User.findById(req.body.username, (err,user)=>{
    if(err)
      res.send(err);
    user.WorkspaceIds.push({selected:true, workspaceId: newWorkspace.id});
    user.save(function(err) {
    if (err)
      throw err;
    newWorkspace.save((err,ws)=>{
      res.json(ws);
    });
    
  });
  })
  
};