var Transmission = require('transmission');
var fs = require('fs');
var ini = require('ini');
var winston = require('winston');

var CODE = require('../../app/enums/codes');

// Open config.ini
var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));

var transmission = new Transmission({
    host: config.transmission.address,      // 192.168.0.21
    port: config.transmission.port,         // 9091
    username: config.transmission.username, // wifsimster
    password: config.transmission.password, // 192lucie
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
            CODE.SUCCESS.torrents = data;
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
        if (err) {
            winston.error(err);
            res.json(CODE.BAD_REQUEST);
        } else {
            winston.info('Transmission - New torrent added - ID: ' + result.name);
            CODE.SUCCESS_POST.torrent = result;
            res.json(CODE.SUCCESS_POST);
        }
    });
});

// Remove torrent to Transmission
app.delete("/transmission/remove/:id", function (req, res) {
    var id = req.params.id;

    winston.info("Transmission - Try to remove '" + id);

    transmission.remove(id, function (err) {
        if (err) {
            winston.error(err);
            res.json(CODE.BAD_REQUEST);
        } else {
            winston.info('Transmission - Torrent removed with success !');
            res.json(CODE.SUCCESS_DELETE);
        }
    });
});