// Packages
var express = require('express');
var bodyParser = require('body-parser');
var uuid = require('node-uuid');
var fs = require('fs');
var ini = require('ini');
var request = require('request');
var CronJob = require('cron').CronJob;
var app = express();

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

// Routes
require('./app/routes/collection.js');
require('./app/routes/generic.js');
require('./app/routes/transmission.js');
require('./app/routes/kickasstorrents.js');
require('./app/routes/thepiratebay.js');
require('./app/routes/wanted.js');

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

    // [collection]
    config.collection.directory = "/your/games/collection";
    config.collection.scan = false;
    config.collection.cron.day = "1";
    config.collection.cron.hour = "*";
    config.collection.cron.minute = "*";

    // [search]
    config.search.directory = "";
    config.search.new_releases = false;
    config.search.startup = false;
    config.search.cron.day = "*";
    config.search.cron.hour = "1";
    config.search.cron.minute = "*";

    // [thepiratebay]
    config.thepiratebay.proxy_server = "";
    config.thepiratebay.seed_ration = "";
    config.thepiratebay.seed_time = "";

    // [thepiratebay.filter]
    config.thepiratebay.filters.favorite_words = "";
    config.thepiratebay.filters.forbidden_words = "";
    config.thepiratebay.filters.uploadDate = "";
    config.thepiratebay.filters.size_min = "";
    config.thepiratebay.filters.seeders = "";
    config.thepiratebay.filters.leechers = "";

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

// -----------------------------------------------------
// ----                     CRON                    ----
// -----------------------------------------------------
console.log('Initialazing CRON...');
// Config
var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));
var search_cron = config.search.cron.minute + ' ' + config.search.cron.hour + ' ' + config.search.cron.day;
var collection_cron = config.collection.cron.minute + ' ' + config.collection.cron.hour + ' ' + config.collection.cron.day;

// Search cron
new CronJob('/45 ' + search_cron + ' * * *', function () {
    console.log('Search cron activated !');

    // Get wanted games list
    request('http://localhost:' + config.general.port + '/wanted/games', function (error, response, body) {
        if (!error && response.statusCode == 200) {

            var games = JSON.parse(body);

            for(var i = 0 ; i < games.length; i++) {

                var name = games[i].Title;

                console.log("TPB - Searching for " + name + "...");

                request('http://localhost:' + config.general.port + '/thepiratebay/search/' + name, function (error, response, body) {
                    if (!error && response.statusCode == 200) {

                        var traker = JSON.parse(body);

                        // If tracker found by TPB
                        if(tracker) {
                            console.log("TPB - Found one tracker with the current filters");



                            console.log("Tracker added to Transmission !");
                        }
                    }
                });
            }
        }
    });

}, null, true, "Europe/Paris");

// Collection cron
new CronJob('* ' + collection_cron + ' * * *', function () {
    console.log('Collection cron activated !');
}, null, true, "Europe/Paris");