// Packages
var express = require('express');
var bodyParser = require('body-parser');
var uuid = require('node-uuid');
var fs = require('fs');
var ini = require('ini');
var app = express();

// Nedb - Embedded database package
var Datastore = require('nedb');
var settings_db = new Datastore({filename: 'settings.nedb', autoload: true});

// Singleton of Express app instance
GLOBAL.app = app;
GLOBAL.settings_db = settings_db;

GLOBAL.SETTINGS;

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

// Configure
app.use(express.static(__dirname + '/public'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));
app.use(bodyParser());

var port = process.env.PORT || 8080;

require('./app/routes/generic.js');
require('./app/routes/transmission.js');
require('./app/routes/kickasstorrents.js');
require('./app/routes/thepiratebay.js');

// START THE SERVER
app.listen(port);
console.log('Datagamer is running on port ' + port);

// Generate config.ini if first start
if (fs.existsSync('./config.ini')) {
    console.log('./config.ini found !')
} else {
    console.log('First time launching the app, generate default settings in ./config.ini file...');

    var config = ini.parse(fs.readFileSync('./config.mdl', 'utf-8'));

    // [general]
    config.general.username = "";
    config.general.password = "";
    config.general.port = "8080";
    config.general.debug = false;
    config.general.apikey = uuid.v4();
    config.general.new_releases = true;
    config.general.startup = true;

    // [cron]
    config.cron.day = "1";
    config.cron.hour = "";
    config.cron.minute = "";

    // [transmission]
    config.transmission.address = "localhost";
    config.transmission.port = 9091;
    config.transmission.rpc_url = "/transmission/rpc";
    config.transmission.remove_torrent = true;

    // [renamer]
    config.renamer.folder_naming = "<name> (<year>)";
    config.renamer.detect_minute = "15";

    // Write in config.ini file
    fs.writeFileSync('./config.ini', ini.stringify(config));

    if (fs.existsSync('./config.ini')) {
        console.log('./config.ini created !')
    }
}

