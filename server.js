// BASE SETUP
// =============================================================================

// call the packages we need
var express = require('express');        // call express
var app = express();                 // define our app using express
var bodyParser = require('body-parser');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

// Enums
var CODE = require('./app/enums/codes');

// Middleware to use for all requests
app.use(function (req, res, next) {

    console.log('--');
});

// Test route to make sure everything is working (accessed at GET http://localhost:8080/api)
app.get('/', function (req, res) {
    res.json({message: 'Hooray ! Welcome to Datagamer !'});
});

// REGISTER OUR ROUTES -------------------------------
// API routes
//app.use('/api', require('./app/routes/api/developer'));
//app.use('/api', require('./app/routes/api/editor'));
//app.use('/api', require('./app/routes/api/game'));
//app.use('/api', require('./app/routes/api/genre'));
//app.use('/api', require('./app/routes/api/platform'));
//app.use('/api', require('./app/routes/api/user'));

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Datagamer is running on port ' + port);