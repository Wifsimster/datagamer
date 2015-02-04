var Transmission = require('transmission');
var fs = require('fs');
var ini = require('ini');

app.get("/transmission/test", function (req, res) {

    // Open config.ini
    var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));

    var transmission = new Transmission({
        host: config.transmission.address,   // 192.168.0.21
        port: config.transmission.port,   // 9091
        username: config.transmission.username, // wifsimster
        password: config.transmission.password, // 192lucie
        url: config.transmission.rpc_url // /transmission/rpc
    });

    console.log("transmission init");

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
