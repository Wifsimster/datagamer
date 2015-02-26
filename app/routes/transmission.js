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
        if (!err) {
            winston.info("Transmission - Get torrent list for test !");
            res.send(CODE.SUCCESS);
        } else {
            console.error(err);
            res.send(CODE.BAD_REQUEST);
        }
    });
});

// Add a new torrent to Transmission
app.post("/transmission/add", function (req, res) {

    var url = req.body.url;

    winston.info("Transmission - Try to add '" + url);

    transmission.addUrl(url, function (err, result) {
        if (err) {
            console.error(err);
            res.status(500).send(CODE.BAD_REQUEST);
        } else {
            winston.info('Transmission - New torrent added - ID: ' + result.name);
            CODE.SUCCESS_POST.torrent = result;
            res.send(CODE.SUCCESS_POST);
        }
    });
});


// Remove torrent to Transmission
app.post("/transmission/remove/:id", function (req, res) {

    var id = req.params.id;

    winston.info("Transmission - Try to remove '" + id);

    transmission.remove(id, function (err) {
        if (err) {
            console.error(err);
            res.status(500).send(CODE.BAD_REQUEST);
        } else {
            winston.info('Transmission - Torrent removed with success !');
            res.send(CODE.SUCCESS_DELETE);
        }
    });
});