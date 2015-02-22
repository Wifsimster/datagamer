// Packages
var express = require('express');
var bodyParser = require('body-parser');
var uuid = require('node-uuid');
var fs = require('fs');
var ini = require('ini');
var request = require('request');
var winston = require('winston');
var auth = require('basic-auth');
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

// Initialize config.ini file
config.init();

var port = config.getPort();

// Open conf file
var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));

// If debug is enable
if (config.advanced.debug) {
    winston.info('Datagamer is logging on ' + config.advanced.debug_directory + '\\datagamer.log');
    winston.add(winston.transports.File, {filename: config.advanced.debug_directory + '\\datagamer.log'});
}

// If basic authentication is enable
if (config.general.username && config.general.password) {
    winston.info('Basic authentication enable !');
    app.use(function (req, res, next) {
        var user = auth(req);

        if (user === undefined || user['name'] !== config.general.username || user['pass'] !== config.general.password) {
            res.statusCode = 401;
            res.setHeader('WWW-Authenticate', 'Basic realm="MyRealmName"');
            res.end('Unauthorized');
        } else {
            next();
        }
    });
}

// Declare routes to use
require('./app/routes/collection.js');
require('./app/routes/cron.js');
require('./app/routes/datagamer.js');
require('./app/routes/generic.js');
require('./app/routes/kickasstorrents.js');
require('./app/routes/renamer.js');
require('./app/routes/thepiratebay.js');
require('./app/routes/transmission.js');
require('./app/routes/update.js');
require('./app/routes/wanted.js');

// Start the server
app.listen(port);

// -----------------------------------------------------
// ----                     CRON                    ----
// -----------------------------------------------------

// Inject CRONs
var search = require('./app/crons/search.js');

winston.info('Datagamer is running on port ' + port);

if (config.search.scan_auto || config.collection.scan_auto || config.renamer.scan_auto || config.update.scan_auto) {
    winston.info('Initialazing CRON :');
    require('./app/crons/collection.js');
    require('./app/crons/renamer.js');
    require('./app/crons/update.js');

    search.start();

} else {
    winston.info('No CRON activated.');
}


