var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/oneTaskModels').User;
var Workspace = require('../models/oneTaskModels').Workspace;
var Project = require('../models/oneTaskModels').Project;

module.exports = function(passport) {
	passport.serializeUser((user, done) => {
  		done(null, user._id);   //user._id is Model user's _id, which is actually the username
	});

	passport.deserializeUser((username, done) => {
  		/*const user = getUser(username);
  		delete user.password;
  		done(null, user);*/

  		User.findById(username, (err, user) => {
            done(err, user);
        });
	});

	// Configure Passport
	passport.use('local-signup', new LocalStrategy(
		{
			passReqToCallback : true	// allows us to pass back the entire request to the callback
		},
  		(req, username, password, done) => {
    		// asynchronous
        	// User.findOne wont fire unless data is sent back
        	//console.log('Passport-> '+req.body); //req.body doesnt log but it can be user. It's the request received from user
        	process.nextTick(function() {

        	// find a user whose username is the same as the forms username
        	// we are checking to see if the user trying to login already exists
        	User.findById(username, function(err, user) {		//this username is of the Model
	            // if there are any errors, return the error
            	if (err)
	                return done(err);

            	// check to see if theres already a user with that username
            	if (user) {
	                return done(null, false, {message: 'That username is already taken.'});
            	} else {

                	// if there is no user with that username create the user
                	var newUser = new User();
                	newUser._id = username;
                	newUser.password = newUser.generateHash(password);
                  newUser.name = req.body.name;
                  newUser.email = req.body.email;

                  var newProject = new Project();
                  newProject.name = 'My Personal Project';
                  newProject.description = 'Project for personal use';
                  newProject.selected = true;

                  var newWorkspace = new Workspace();
                  newWorkspace.name = 'Personal Projects';
                  newWorkspace.MemberUserIds.push(newUser._id);
                  newWorkspace.projects.push(newProject);   //projects are embedded into workspace

                  newUser.WorkspaceIds.push({selected:true, workspaceId: newWorkspace.id});

                	// save the user and workspace
                	newUser.save(function(err) {
	                    if (err)
                        	throw err;
                      newWorkspace.save();    //it's ok if workspace is not created after user is created.
                    	return done(null, newUser);
                	});
            	}

        });    

        });
  		}
  ));


  passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        //usernameField : 'email',
        //passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) { // callback with email and password from our form

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findById(username, function(err, user) {
            // if there are any errors, return the error before anything else
            if (err)
                return done(err);

            // if no user is found, return the message
            if (!user)
                return done(null, false, {message: 'No user found.'}); // req.flash is the way to set flashdata using connect-flash

            // if the user is found but the password is wrong
            if (!user.validPassword(password))
                return done(null, false, {message: 'Oops! Wrong password.'}); // create the loginMessage and save it to session as flashdata

            // all is well, return successful user
            return done(null, user);
        });

    }));


}