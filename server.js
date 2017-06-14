var express = require('express'),
  app = express(),
  port = process.env.PORT || 3000,
  mongoose = require('mongoose'),
  Task = require('./api/models/todoListModel'),
  bodyParser = require('body-parser'),
  mongourl = /*process.env.MONGOLAB_URI ||*/ 'mongodb://localhost/OneTaskDB';
  
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const flash = require('flash');
const passport = require('passport');
//const LocalStrategy = require('passport-local');
const uuid = require('node-uuid');
var cors = require('cors');

mongoose.Promise = global.Promise;
mongoose.connect(mongourl,(error)=>{    //'mongodb://localhost/OneTaskDB'
  if (error) 
    console.error(error);
  else 
    console.log('mongo connected on ' + mongourl);
});

app.use(cors({ origin: "http://localhost:8080", credentials: true}));   //used for cross-domain requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.use(session({
  secret: process.env.SESSION_SECRET || 'onetasksecretcookie',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({
    url: mongourl,
  }),
}));
//app.use(express.session({ secret: 'keyboard cat' }));
app.use(flash());
app.use(express.static('public'));
app.use(passport.initialize());
app.use(passport.session());
require('./api/config/passport')(passport);

require('./api/routes/authRoutes')(app,express,passport);
require('./api/routes/apiRoutes')(app,express);

app.listen(port);


console.log('OneTask RESTful Node server started on: ' + port);

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