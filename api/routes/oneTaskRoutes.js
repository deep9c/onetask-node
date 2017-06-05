'use strict';
module.exports = function(app, express, passport) {
  var todoList = require('../controllers/todoListController');
  var oneTaskControllers = require('../controllers/oneTaskControllers');


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


  // Create auth routes
  const authRoutes = express.Router();

/*authRoutes.post('/login',
  passport.authenticate('local', {
    failureRedirect: '/',
    successRedirect: '/dashboard',
    failureFlash: true,
  })
);*/
  authRoutes.post('/login', (req,res,next)=>{
    passport.authenticate('local-login', (err,user,info)=>{
      if(!user){
        return res.status(401).send(info.message);
      }
      else if(err){
        return res.status(500).send('Login failed! Please try again later');
      }
      else{
        req.login(user, function(error) {
          if (error){ 
            return next(error);
          }
          console.log("Request Login supossedly successful.");
          return res.json({ message: 'loginsuccess', user: req.user });
        });                
        //return res.status(200).json({user: req.user});
        //return res.json({ message: 'loginsuccess', user: req.user });
      }
    })(req, res, next);
  });
  app.get('/loginsuccessres', function(req, res) {
      res.json({ message: 'loginsuccess', user: req.user });
  });
  app.get('/loginfailureres', function(req, res) {
    //res.send(401,'Incorrect credentials');
    res.status(401).send('Incorrect credentials');
  });

  authRoutes.get('/logout', function(req, res) {
    req.logout();
    //res.send(200,'loggedout');
    res.status(200).send('loggedout');
    //res.redirect('/');
  });

  authRoutes.post('/register', (req,res,next)=>{
    passport.authenticate('local-signup', (err,user,info)=>{
      if(!user){
        return res.status(409).send(info.message);
      }
      else if(err){
        return res.status(500).send('Registration failed! Please try again later');
      }
      else{
        return res.status(201).send('User created');
      }
    })(req, res, next);
  });
  app.get('/registersuccessres', function(req, res) {
    res.status(201).send('User created');
  });
  app.get('/registerfailureres', function(req, res) {
    res.status(409).send('Username already exists');
  });

  app.use('/auth', authRoutes);



  function checkAuthentication(req, res, next) {
    //console.log('isAuthenticated called:- ' + JSON.stringify(req));
    if (!req.isAuthenticated()) {
      req.flash('error', 'You must be logged in.');
      //console.log('error! You must be logged in.');
      //return res.redirect('/');
      return res.json({ message: 'isAuthenticatedFailed', user: req.user });
    }
    //console.log('success! You are already logged in.');
    return next();  //will move on to the next middleware
    //return res.json({ message: 'isAuthenticatedSuccess', user: req.user });
  }

  // Create API routes
  const apiRoutes = express.Router();

  apiRoutes.use(checkAuthentication);

  apiRoutes.get('/me', (req, res) => {
    console.log('received request into /api/me');
    res.json({ user: req.user });
  });

  app.use('/api', apiRoutes);

};