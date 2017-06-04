var express = require('express'),
  app = express(),
  port = process.env.PORT || 3000,
  mongoose = require('mongoose'),
  Task = require('./api/models/todoListModel'),
  bodyParser = require('body-parser');
  
  //************auth*************
//const express = require('express');
//const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const flash = require('flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const uuid = require('node-uuid');
const appData = require('./data.json');
var cors = require('cors');
// Create app data (mimics a DB)
const userData = appData.users;
const exclamationData = appData.exclamations;

function getUser(username) {
  const user = userData.find(u => u.username === username);
  return Object.assign({}, user);
}


  //**************************

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/OneTaskDB'); 


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//************auth*************
/*var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://localhost:8080');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
}*/

app.use(session({
  secret: process.env.SESSION_SECRET || 'awesomecookiesecret',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({
    url: process.env.MONGO_URL || 'mongodb://localhost/OneTaskDB',
  }),
}));
//app.use(express.session({ secret: 'keyboard cat' }));
app.use(flash());
app.use(express.static('public'));
app.use(passport.initialize());
app.use(passport.session());
app.use(cors({ origin: "http://localhost:8080", credentials: true}));		//used for cross-domain requests
app.set('views', './views');
app.set('view engine', 'pug');

// Configure Passport
passport.use(new LocalStrategy(
  (username, password, done) => {
    const user = getUser(username);

    if (!user || user.password !== password) {
      return done(null, false, { message: 'Username and password combination is wrong' });
    }

    delete user.password;

    return done(null, user);
  }
));

// Serialize user in session
passport.serializeUser((user, done) => {
  done(null, user.username);
});

passport.deserializeUser((username, done) => {
  const user = getUser(username);

  delete user.password;

  done(null, user);
});

// Create custom middleware functions
function isAuthenticated(req, res, next) {
  if (!req.user) {
    req.flash('error', 'You must be logged in.');
    //console.log('error! You must be logged in.');
    //return res.redirect('/');
    return res.json({ message: 'isAuthenticatedFailed', user: req.user });
  }
  //console.log('success! You are already logged in.');
  return next();	//will move on to the next middleware
  //return res.json({ message: 'isAuthenticatedSuccess', user: req.user });
}

/*// Create home route
app.get('/', (req, res) => {
  if (req.user) {
    return res.redirect('/dashboard');
  }

  return res.render('index');
});

app.get('/dashboard',
  isAuthenticated,
  (req, res) => {
    res.render('dashboard');
  }
);
*/

// Create auth routes
const authRoutes = express.Router();

/*authRoutes.post('/login',
  passport.authenticate('local', {
    failureRedirect: '/',
    successRedirect: '/dashboard',
    failureFlash: true,
  })
);*/
authRoutes.post('/login',
  passport.authenticate('local', {
    failureRedirect: '/failurejson',
    successRedirect: '/successjson'    
  })
);
app.get('/successjson', function(req, res) {
    res.json({ message: 'loginsuccess', user: req.user });
});
app.get('/failurejson', function(req, res) {
    //res.send(401,'Incorrect credentials');
    res.status(401).send('Incorrect credentials');
});

authRoutes.get('/logout', function(req, res) {
    req.logout();
    //res.send(200,'loggedout');
    res.status(200).send('loggedout');
    //res.redirect('/');
});

/*authRoutes.post('/register',
  );*/

app.use('/auth', authRoutes);

// Create API routes
const apiRoutes = express.Router();

apiRoutes.use(isAuthenticated);

apiRoutes.get('/me', (req, res) => {
  res.json({ user: req.user });
});

app.use('/api', apiRoutes);
//**************************auth ends*****************************

var routes = require('./api/routes/todoListRoutes');
routes(app);


app.listen(port);


console.log('todo list RESTful API server started on: ' + port);

app.use(function(req, res) {
  res.status(404).send({url: 'Sorry! '+req.originalUrl + ' not found'})
});

/*
const express = require('express');

const app = express();

app.listen(3000, function() {
  console.log('listening on 3000')
})

//app.get(path, callback)

app.get('/', (req, res) => {
  res.send('hello world')
})

*/