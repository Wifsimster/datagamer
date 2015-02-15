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
        console.log('Transmission - Torrent was removed !');
    });
}

function addTorrent(url, downloadDirectory) {
    transmission.addUrl(url, {
        "download-dir": downloadDirectory
    }, function (err, result) {
        if (err) {
            console.error(err);
            return err;
        }

        console.log('Transmission - New torrent added - ID: ' + result.id);
        return result.id;
    });
}

function addTorrent(url) {

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
app.post("/transmission/add/", function (req, res) {

    var url = req.body.url;

    console.log("Transmission - Try to add '" + url);

    transmission.addUrl(url, function (err, result) {
        if (err) {
            console.error(err);
            res.status(500).send(err);
        } else {
            console.log('Transmission - New torrent added - ID: ' + result.name);
            res.send(result);
        }
    });
});