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
//const LocalStrategy = require('passport-local');
const uuid = require('node-uuid');

var cors = require('cors');




  //**************************

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/OneTaskDB'); 

app.use(cors({ origin: "http://localhost:8080", credentials: true}));   //used for cross-domain requests
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
  secret: process.env.SESSION_SECRET || 'onetasksecretcookie',
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
require('./api/config/passport')(passport);
app.set('views', './views');
app.set('view engine', 'pug');





// Create custom middleware functions


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



//**************************auth ends*****************************

var routes = require('./api/routes/oneTaskRoutes');
routes(app,express,passport);


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