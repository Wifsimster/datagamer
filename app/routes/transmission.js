var Transmission = require('transmission');

var transmission = new Transmission({
    host: '192.168.0.21u',
    port: 9091,
    username: "wifsimster",
    password: "192lucie",
    url: '/transmission/rpc'
});

app.get("/transmission/torrents", function (req, res) {
    console.log("transmission test");
    transmission.get(function (err, data) {
        if (err) {
            console.error(err);
            res.send(err);
        }
        if (data) {
            if (data.torrents) {
                res.send(data);
            }
        } else {
            res.send(err);
        }
    });
});
