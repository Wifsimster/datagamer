// Packages
var express = require('express');
var bodyParser = require('body-parser');
var uuid = require('node-uuid');
var app = express();

// Nedb - Embedded database package
var Datastore = require('nedb');
var settings_db = new Datastore({filename: 'settings.nedb', autoload: true});

// Singleton of Express app instance
GLOBAL.app = app;
GLOBAL.settings_db = settings_db;

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

// Configure
app.use(express.static(__dirname + '/public'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));
app.use(bodyParser());

var port = process.env.PORT || 8080;

require('./app/routes/generic.js');

// START THE SERVER
app.listen(port);
console.log('Datagamer is running on port ' + port);

// Init database settings at startup
var settings = {
    username: "",
    password: "",
    port: "8080",
    debug: false,
    apikey: uuid.v4(),
    new_releases: true,
    startup: true,
    cron: {
        day: "1",
        hour: "",
        minute: ""
    },
    transmission: {
        host: "localhost:9091",
        rpc_url: "transmission",
        remove_torrent: true
    },
    renamer: {
        folder_naming: "<name> (<year>)",
        detect_minute: "15"
    }
};

settings_db.count({}, function (err, count) {
    if (count > 0) {
        // Do nothing ! Settings already created once.
        console.log("Settings found.");
    } else {
        settings_db.insert(settings, function (err, newDoc) {
            if (!err)
                console.log("No settings found, create new one !");
        });
    }
});
