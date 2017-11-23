'use strict';
var models = require('../models/oneTaskModels');

var mongoose = require('mongoose');
//  Task = mongoose.model('Tasks');

var User  = mongoose.model('User'),
 FBUser  = mongoose.model('FBUser'),
 GoogleUser  = mongoose.model('GoogleUser'),
 Task  = mongoose.model('Task'),
 Workspace  = mongoose.model('Workspace'),
 Comment  = mongoose.model('Comment'),
 Project  = mongoose.model('Project'),
 User  = mongoose.model('User');

exports.createUser = function(req, res) {
  var newUser = new models.User(req.body);
  newUser.save(function(err, user) {
    if (err)
      res.send(err);
    res.json(user);
  });
};

exports.createFBUser = function(req, res) {
  var newUser = new models.FBUser(req.body);
  newUser.save(function(err, user) {
    if (err)
      res.send(err);
    console.log("fb user created: " + JSON.stringify(req.body));
    res.json(user);
  });
};

exports.createGoogleUser = function(req, res) {
  var newUser = new models.GoogleUser(req.body);
  newUser.save(function(err, user) {
    if (err)
      res.send(err);
    console.log("google user created: " + JSON.stringify(req.body));
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
  Workspace.find({ "_id": req.params.workspaceid })
    .populate('MemberUserIds')
    .exec((err,workspace)=>{
      if(err)
        res.send(err);
      //delete workspace[0].MemberUserIds[0]["password"]; //remove passwords from response
      //console.log("----WS----: " + JSON.stringify(workspace));
      res.json(workspace[0]);
    })
};

exports.getUser = function(req,res){
  //var userdata = {userid:'', name:'', email:''};
  User.findById(req.params.userid, (err,user)=>{
    if(err)
      res.send(err);
    delete user[password];
    delete user[WorkspaceIds];
    res.json(user);
  })
};

exports.updateWorkspace = function(req,res){  
  console.log('updateWorkspace: ' + JSON.stringify(req.body));
  //var op = req.body.operation;
  //if(op == 'update'){
    Workspace.findById(req.body.wsid, (err,ws)=>{
      if(err)
        res.send(err);
      
      ws.MemberUserIds.push(req.body.userid);   //new member added to ws

      Workspace.update(
        {_id : req.body.wsid}, //condition
        ws,   //update
        (err, result)=>{
          if(err)
            res.send(err);
          else{
            if(result){
              //update user
              User.findById(req.body.userid, (err,user)=>{
                if(err)
                  res.send(err);
      
                user.WorkspaceIds.push({selected:false, workspaceId:req.body.wsid});   //new member added to ws

                User.update(
                  {_id : req.body.userid}, //condition
                  user,   //update
                  (err, result)=>{
                    if(err)
                      res.send(err);
                    else{
                      if(result){                                    
                        res.json(user);
                      }
                      else{
                        res.status(204);    //no content (WS not found)
                      }
                    }
                  }
                );
              })
              //res.status(200).json(result);
            }
            else{
              res.status(204);    //no content (WS not found)
            }
          }
        }
      );
    })
  //}
};

exports.getTasks = function(req,res){
  var workspaceid = req.params.workspaceid;
  var projid = req.params.projid;
  var userid = req.params.userid;
  console.log('getTasks called req.params.workspaceid= ' + workspaceid + '..projid= ' + projid);

  //Workspace.find({'projects._id': projid}, (err, foundWorkspace)=>{});
if(workspaceid && projid){
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
        return Task.findById(taskid)
          .populate('AssigneeUserId')
          .exec((err, task)=>{
          if(err)
            res.send(err);
          //console.log('****Task found--> ' + JSON.stringify(task)); 
          //TODO: remove passwords from assigneeUser
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
}

else{ //get tasks by assignee username
  Task.find({AssigneeUserId:userid},(err, tasks)=>{
    if(err)
      res.send(err);
    var TasksList = {tasks: tasks}; 
    res.json(TasksList);
  })
}

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
            res.status(204);  //no content (WS not found)
          }
        }
      }
    );
  });
};

exports.updateTask = function(req,res){  
  console.log('updateTask: ' + JSON.stringify(req.body));
  var op = req.body.operation;
  if(op == 'update'){
  Task.update(
    {_id : req.body.taskid}, //condition
    req.body,   //update -> status,title,description,AssigneeUserId
    (err, result)=>{
      if(err)
        res.send(err);
      else{
        if(result){
          Task.findById(req.body.taskid)
          .populate('AssigneeUserId')
          .exec((err, task)=>{
          if(err)
            res.send(err);
          //console.log('****Task found--> ' + JSON.stringify(task)); 
          //TODO: remove passwords from assigneeUser
          res.status(200).json(task);
        });
          
        }
        else{
          res.status(204);
        }
      }
    }
  );
  }
  else if(op == 'delete'){
    Workspace.update(
      {_id: req.body.workspaceid, 'projects._id': req.body.projectid},
      {$pull: {'projects.$.TaskIds': req.body.taskid}},
      (err, result)=>{
        if(err)
          res.send(err);
        else{
          if(result){
            //res.status(200).json(result);
            Task.remove({
              _id: req.body.taskid
            }, function(err) {
            if (err)
              res.send(err);
            res.json({ message: 'Task successfully deleted' });
            });
          }
          else{
            res.status(204);  //no content (WS not found)
          }
        }
      }
    );


  
  }

};

/*exports.deleteTask = function(req, res) {
  console.log('deleteTask: ' + JSON.stringify(req.params));
  Task.remove({
    _id: req.body.taskid
  }, function(err) {
    if (err)
      res.send(err);
    res.json({ message: 'Task successfully deleted' });
  });
};*/


exports.getComments = function(req,res){
  var taskid = req.params.taskid;
  var commentsResp = {comments: []};
  Comment.find({'TaskId': taskid})
    .populate('CommenterUserId')
    .exec((err, comments)=>{
      console.log('found comments:- ' + JSON.stringify(comments));
      //TODO: remove passwords from users
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
    newcommentsaved.populate('CommenterUserId',(err,newcommentpopulated)=>{
      res.json(newcommentpopulated);
    })
    
  });
};

exports.createProject = function(req,res){
  console.log('req received in createProject:- ' + JSON.stringify(req.body));
  var newProject = new Project();
  newProject.name = req.body.name;
  newProject.description = req.body.description;
  newProject.selected = false;
  newProject.OwnerUserId = req.body.username;

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