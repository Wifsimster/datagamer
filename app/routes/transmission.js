var Transmission = require('transmission');
var fs = require('fs');
var ini = require('ini');

// Open config.ini
var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));

var transmission = new Transmission({
    host: config.transmission.address,      // 192.168.0.21
    port: config.transmission.port,         // 9091
    username: config.transmission.username, // wifsimster
    password: config.transmission.password, // 192lucie
    url: config.transmission.rpc_url        // /transmission/rpc
});

function getTorrent(id) {
    transmission.get(id, function (err, result) {
        if (err) {
            throw err;
        }
        console.log('bt.get returned ' + result.torrents.length + ' torrents');
        result.torrents.forEach(function (torrent) {
            console.log('hashString', torrent.hashString);
        });
    });
}

function removeTorrent(id) {
    transmission.remove(id, function (err) {
        if (err) {
            throw err;
        }
        console.log('Torrent was removed !');
    });
}

function addTorrent(url, downloadDirectory) {
    transmission.addUrl(url, {
        "download-dir": downloadDirectory
    }, function (err, result) {
        if (err) {
            return console.log(err);
        }
        var id = result.id;
        console.log('New torrent added - ID: ' + id);
    });
}

function addTorrent(url) {
    transmission.addUrl(url, function (err, result) {
        if (err) {
            return console.log(err);
        }
        var id = result.id;
        console.log('New torrent added - ID: ' + id);
    });
}

// -----------------------------------------------------
// ----                 ROUTES                      ----
// -----------------------------------------------------

// Check if Transmission is OK
app.get("/transmission/test", function (req, res) {

    transmission.get(function (err, data) {
        if (!err) {
            if (data) {
                if (data.torrents) {
                    //console.log("Get torrent list !");
                    res.send(data);
                }
            } else {
                console.error(err);
                res.send(err);
            }
        } else {
            console.error(err);
            res.send(err);
        }

    });
});

// Add a new tracker to Transmission
app.post("/transmission/add", function (req, res) {

    var url = req.body.url;

    console.log("Try to add '" + url + "' to Transmission...");

    var result = addTorrent(url);

    console.log(result);

    res.send(result);
});