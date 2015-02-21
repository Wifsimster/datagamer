// Packages
var express = require('express');
var bodyParser = require('body-parser');
var uuid = require('node-uuid');
var fs = require('fs');
var ini = require('ini');
var request = require('request');
var app = express();

var config = require('./app/config.js');

// Singleton of Express app instance
GLOBAL.app = app;

// Configure template engine
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

// Configure paths
app.use(express.static(__dirname + '/public'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// Declare routes to use
require('./app/routes/collection.js');
require('./app/routes/cron.js');
require('./app/routes/datagamer.js');
require('./app/routes/generic.js');
require('./app/routes/transmission.js');
require('./app/routes/kickasstorrents.js');
require('./app/routes/renamer.js');
require('./app/routes/thepiratebay.js');
require('./app/routes/wanted.js');

// Initialize config.ini file
config.init();

var port = config.getPort();

// Start the server
app.listen(port);
console.log('Datagamer is running on port ' + port);

// -----------------------------------------------------
// ----                     CRON                    ----
// -----------------------------------------------------

// Inject CRONs
var search = require('./app/crons/search.js');


// Open conf file
var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));

if (config.search.scan_auto || config.collection.scan_auto || config.renamer.scan_auto || config.update.scan_auto) {
    console.log('Initialazing CRON :');
    require('./app/crons/collection.js');
    require('./app/crons/renamer.js');
    require('./app/crons/update.js');

    search.start();

} else {
    console.log('No CRON activated.');
}


