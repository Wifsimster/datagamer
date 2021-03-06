var Transmission = require('transmission');
var fs = require('fs');
var ini = require('ini');
var winston = require('winston');

var CODE = require('../../app/enums/codes');

// Open config.ini
var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));

var transmission = new Transmission({
    host: config.transmission.address,      // address
    port: config.transmission.port,         // 9091
    username: config.transmission.username, // id
    password: config.transmission.password, // password
    url: config.transmission.rpc_url        // /transmission/rpc
});

// -----------------------------------------------------
// ----                 ROUTES                      ----
// -----------------------------------------------------

// Check if Transmission is OK
app.get("/transmission/test", function (req, res) {
    transmission.get(function (err, data) {
        if (err) {
            winston.error(err);
            res.json(CODE.BAD_REQUEST);
        } else {
            winston.info("Transmission - Get torrent list for test !");
            res.json(CODE.SUCCESS);
        }
    });
});

// Get the torrents list
app.get("/transmission", function (req, res) {
    transmission.get(function (err, data) {
        if (!err) {
            winston.info("Transmission - Get torrents list !");
            CODE.SUCCESS.torrents = data.torrents;
            res.json(CODE.SUCCESS);
        } else {
            winston.error(err);
            res.json(CODE.BAD_REQUEST);
        }
    });
});


// Add a new torrent to Transmission
app.post("/transmission/add", function (req, res) {

    var url = req.body.url;

    winston.info("Transmission - Try to add '" + url);

    var options = {};

    if (config.transmission.directory) {
        options = {"download-dir": config.transmission.directory};
    }

    transmission.addUrl(url, options, function (err, result) {
        if (!err) {
            winston.info("Transmission - New torrent added '" + result.name + "'");
            CODE.SUCCESS_POST.torrent = result;

            // Set torrent to pause after add it
            if (config.transmission.pause_torrent) {
                winston.info('Transmission - Torrent ' + result.name + ' paused !');

                transmission.stop(result.id, function (err) {
                    res.json(CODE.SUCCESS_POST);
                });
            } else {
                res.json(CODE.SUCCESS_POST);
            }
        } else {
            winston.error(err);
            res.json(CODE.BAD_REQUEST);
        }
    });
});

// Remove torrent to Transmission
app.delete("/transmission/remove/:id", function (req, res) {
    var id = req.params.id;

    winston.info("Transmission - Trying to remove torrent '" + id + "'...");

    transmission.remove(id, function (err) {
        if (!err) {
            winston.info('Transmission - Torrent removed with success !');
            res.json(CODE.SUCCESS_DELETE);
        } else {
            winston.error(err);
            res.json(CODE.BAD_REQUEST);
        }
    });
});