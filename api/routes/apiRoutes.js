'use strict';
module.exports = function(app, express) {
  var todoList = require('../controllers/todoListController');
  var oneTaskControllers = require('../controllers/oneTaskControllers');


  function checkAuthentication(req, res, next) {
    if (!req.isAuthenticated()) {
      req.flash('error', 'You must be logged in.');
      return res.json({ message: 'isAuthenticatedFailed', user: req.user });
    }
    return next();  //will move on to the next middleware
  }

  // Create API routes
  const apiRoutes = express.Router();

  apiRoutes.use(checkAuthentication);

  apiRoutes.get('/me', (req, res) => {
    console.log('received request into /api/me');
    res.json({ user: req.user });
  });

  /*apiRoutes.get('/workspace/:workspaceid',(req,res)=>{
    oneTaskControllers.getWorkspace();
  })*/
  apiRoutes.route('/workspace/:workspaceid')
    .get(oneTaskControllers.getWorkspace);

  apiRoutes.route('/workspace')
    .post(oneTaskControllers.createWorkspace); 

  apiRoutes.route('/task/:userid/:workspaceid/:projid')
    .get(oneTaskControllers.getTasks);

  apiRoutes.route('/task')
    .post(oneTaskControllers.createTask);

  apiRoutes.route('/comment')
    .post(oneTaskControllers.createComment);  

  apiRoutes.route('/comment/:taskid')
    .get(oneTaskControllers.getComments);

  apiRoutes.route('/project')
    .post(oneTaskControllers.createProject);

 

  // todoList Routes
  app.route('/tasks')
    .get(todoList.list_all_tasks)
    .post(todoList.create_a_task);


  app.route('/tasks/:taskId')
    .get(todoList.read_a_task)
    .put(todoList.update_a_task)
    .delete(todoList.delete_a_task);

    app.route('/user')
    .post(oneTaskControllers.createUser);

    app.route('/workspace')
    .post(oneTaskControllers.createWorkspace);


  app.use('/api', apiRoutes);

};