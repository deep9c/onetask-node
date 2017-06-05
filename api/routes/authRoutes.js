'use strict';
module.exports = function(app, express, passport) {
  
  

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
      }
    })(req, res, next);
  });
  /*app.get('/loginsuccessres', function(req, res) {
      res.json({ message: 'loginsuccess', user: req.user });
  });
  app.get('/loginfailureres', function(req, res) {
    //res.send(401,'Incorrect credentials');
    res.status(401).send('Incorrect credentials');
  });*/

  authRoutes.get('/logout', function(req, res) {
    req.logout();
    //res.send(200,'loggedout');
    res.status(200).send('loggedout');
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
  

  app.use('/auth', authRoutes);

  

};