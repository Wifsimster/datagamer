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
require('./app/routes/datagamer.js');
require('./app/routes/generic.js');
require('./app/routes/transmission.js');
require('./app/routes/kickasstorrents.js');
require('./app/routes/renamer.js');
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
    config.ranamer.scan_auto = true;
    config.collection.cron.day = "1";
    config.collection.cron.hour = "*";
    config.collection.cron.minute = "*";

    // [search]
    config.search.directory = "";
    config.search.scan_auto = true;
    config.search.cron.day = "*";
    config.search.cron.hour = "1";
    config.search.cron.minute = "*";

    // [search.datagamer]
    config.search.datagamer.apikey = "b3dae6c0-83a0-4721-9901-bf0ee7011af8";
    config.search.datagamer.url = "localhost:8084";

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
    config.ranamer.scan_auto = true;
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
if (config.search.scan_auto || config.collection.scan_auto || config.renamer.scan_auto || config.update.scan_auto) {
    console.log('Initialazing CRON :');
} else {
    console.log('No CRON activated.');
}

// Open conf file
var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));

// Search cron
if (config.search.scan_auto) {

    // CRON conf
    var search_cron = config.search.cron.minute + ' ' + config.search.cron.hour + ' ' + config.search.cron.day;
    console.log("-- Search : " + search_cron);

    new CronJob('/45 ' + search_cron + ' * * *', function () {
        console.log('CRON - Search :');

        // Get wanted games list
        request('http://localhost:' + config.general.port + '/wanted/games', function (error, response, body) {
            if (!error && response.statusCode == 200) {

                var games = JSON.parse(body);

                for (var i = 0; i < games.length; i++) {

                    var name = games[i].name;

                    console.log("-- TPB : Searching for " + name + "...");

                    request('http://localhost:' + config.general.port + '/thepiratebay/search/' + name, function (error, response, body) {
                        if (!error && response.statusCode == 200) {

                            if (body) {
                                var tracker = JSON.parse(body);

                                // If tracker found by TPB
                                if (tracker) {
                                    console.log("-- TPB : Found one tracker with the current filters");

                                    console.log(tracker);

                                    request.post('http://localhost:' + config.general.port + '/transmission/add', {url: tracker.magnetLink}, function (error, response, body) {
                                        if (!error && response.statusCode == 200) {

                                            console.log("-- Tracker added to Transmission !");
                                        } else {
                                            console.error(error);
                                        }
                                    });
                                }
                            }
                        } else {
                            console.error(error);
                        }
                    });
                }
            }
        });
    }, null, true, "Europe/Paris");
}

// Collection cron
if (config.collection.scan_auto) {

    // CRON conf
    var collection_cron = config.collection.cron.minute + ' ' + config.collection.cron.hour + ' ' + config.collection.cron.day;
    console.log("-- Collection : " + collection_cron);

    new CronJob('* ' + collection_cron + ' * * *', function () {
        console.log('CRON - Collection :');

        request('http://localhost:' + config.general.port + '/collection/games/scan', function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log("200");
            }
        });
    }, null, true, "Europe/Paris");
}

// Renamer cron
if (config.renamer.scan_auto) {

    // CRON conf
    console.log("-- Renamer : " + config.renamer.detect_minute + " * *");

    new CronJob('* ' + config.renamer.detect_minute + ' * * * * *', function () {

        console.log('CRON - Renamer :');

        request('http://localhost:' + config.general.port + '/renamer/games/scan', function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log("200");
            }
        });
    }, null, true, "Europe/Paris");
}

// Update cron
if (config.update.notification || config.update.automatic) {

    // CRON conf
    console.log("-- Check for update every day");

    // Check every day for new update
    new CronJob('* * * 1 * * *', function () {

        console.log('CRON - Update :');

        // TODO : Check for any update online
        var update = false;

        if (update) {
            if (config.update.notification) {
                // TODO : Send a notification
            }

            if (config.update.automatic) {
                // TODO : Automatically get the update and reboot the app
            }
        }

    }, null, true, "Europe/Paris");
}