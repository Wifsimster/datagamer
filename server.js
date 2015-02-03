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

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

// Configure
app.use(express.static(__dirname + '/public'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));

// app.use(bodyParser()); // Deprecated
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

require('./app/routes/generic.js');
require('./app/routes/transmission.js');
require('./app/routes/kickasstorrents.js');
require('./app/routes/thepiratebay.js');

var port;

// Generate config.ini if first start
if (fs.existsSync('./config.ini')) {
    console.log('./config.ini found !')

    var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));

    if (typeof config.general.port === "undefined") {
        port = 8080;
    } else {
        port = config.general.port;
    }

} else {

    console.log('First time launching the app, generate default settings in ./config.ini file...');

    var port = 8080;
    var config = ini.parse(fs.readFileSync('./config.mdl', 'utf-8'));

    // [general]
    config.general.username = "";
    config.general.password = "";
    config.general.port = "8080";

    // [advanced]
    config.advanced.apikey = uuid.v4();
    config.advanced.debug = false;
    config.advanced.debug_directory = "";

    // [update]
    config.update.notification = false;
    config.update.automatic = false;

    // [search]
    config.search.new_releases = false;
    config.search.startup = false;
    config.search.cron.day = "1";
    config.search.cron.hour = "";
    config.search.cron.minute = "";

    // [thepiratebay]
    config.thepiratebay.proxy_server = "";
    config.thepiratebay.seed_ration = "";
    config.thepiratebay.seed_time = "";
    config.thepiratebay.min_score = "";

    // [kickasstorrents]
    config.kickasstorrents.proxy_server = "";
    config.kickasstorrents.seed_ration = "";
    config.kickasstorrents.seed_time = "";
    config.kickasstorrents.min_score = "";
    config.kickasstorrents.verified = false;

    // [transmission]
    config.transmission.address = "localhost";
    config.transmission.port = 9091;
    config.transmission.username = "";
    config.transmission.password = "";
    config.transmission.rpc_url = "/transmission/rpc";
    config.transmission.directory = "";
    config.transmission.remove_torrent = false;
    config.transmission.pause_torrent = false;

    // [renamer]
    config.renamer.from = "";
    config.renamer.to = "";
    config.renamer.folder_naming = "<name> (<year>)";
    config.renamer.detect_minute = "15";
    config.renamer.unrar = false;

    // Write in config.ini file
    fs.writeFileSync('./config.ini', ini.stringify(config));

    if (fs.existsSync('./config.ini')) {
        console.log('./config.ini created !');
    } else {
        console.error('./config.ini was not created !');
    }
}

// START THE SERVER
app.listen(port);
console.log('Datagamer is running on port ' + port);