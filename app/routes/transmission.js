var Transmission = require('transmission');


app.get("/transmission/torrents", function (req, res) {

    var transmission = new Transmission({
        host: SETTINGS.transmission.address,   // 192.168.0.21
        port: SETTINGS.transmission.port,   // 9091
        username: SETTINGS.transmission.username, // wifsimster
        password: SETTINGS.transmission.password, // 192lucie
        url: SETTINGS.transmission.rpc_url // /transmission/rpc
    });

    console.log("transmission init");

    transmission.get(function (err, data) {
        if (!err) {
            if (data) {
                if (data.torrents) {
                    console.log("Get torrent list !");
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
