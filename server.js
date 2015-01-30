// BASE SETUP
// =============================================================================
// Packages
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

// Configure
app.use(express.static(__dirname + '/public'));

var port = process.env.PORT || 8080;        // set our port

app.get('/', function (req, res) {
    res.render('index', {
        title: 'Home'
    });
});

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Datagamer is running on port ' + port);