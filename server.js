// =======================
// get the packages we need ============
// =======================
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); // get our config file
var User = require('./app/models/user'); // get our mongoose model

// =======================
// configuration =========
// =======================
var port = process.env.PORT || 8080; // used to create, sign, and verify tokens
mongoose.connect(config.database); // connect to database
app.set('superSecret', config.secret); // secret variable

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// use morgan to log requests to the console
app.use(morgan('dev'));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// =======================
// routes ================
// =======================
// basic route
app.get('/', function (req, res) {
  res.send('Hello! The API is at http://localhost:' + port + '/api');
});

app.post('/', (req, res) => {
  res.send(req.body);
});

app.get('/setup', (req, res) => {

  const nick = new User({
    name: 'Alexoo',
    password: '1234rr',
    admin: true
  });

  nick.save()
      .then((user) => {
        res.json({
          user
        });
      })
      .catch(err => {
        console.log(err);
      });
});

// =======================
// start the server ======
// =======================
app.listen(port);
console.log('Magic happens at http://localhost:' + port);

// API ROUTES ---------------
//create an instance of the Router for api purposes
const apiRoutes = express.Router();

apiRoutes.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the funky sexy API'
  })
});

apiRoutes.get('/users', (req, res) => {
  User.find({})
      .then(users => {
        res.json(users);
      })
});

apiRoutes.post('/login', (req, res) => {
  const name = req.body.name;
  const password = req.body.password;
  debugger;
  User.findOne({
    name,
    password
  }).then(user => {
    if ( !user ) {
      return res.status(400).send('no such username or password');
    }
    const token = jwt.sign(user, app.get('superSecret'), {
      expiresIn: 60 * 60 * 24 //expires in 24 hours
    });

    res.json({
      success: true,
      token
    })
  }).catch(err => {
    res.status(400)
       .send('no such username or password');
  })
});

app.use('/api', apiRoutes);