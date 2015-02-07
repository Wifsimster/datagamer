var fs = require('fs');
var ini = require('ini');

var DATAGAMER_URL = "http://192.168.0.21:8084";
var API_KEY = "b3dae6c0-83a0-4721-9901-bf0ee7011af8";

// Search a game name on Datagamer database
app.get("/datagamer/search/:name", function (req, res) {

    var name = req.params.name;

    request(DATAGAMER_URL + '/api/games/by/name/' + escape(name), {
        headers: {
            "apiKey": API_KEY
        }
    }, function (error, response, body) {
        if (!error) {
            res.send(JSON.parse(body));
        } else {
            console.error(error);
        }
    })
});

// Ask Datagamer to search on Metacritic a new game missing from Datagamer database
app.put("/datagamer/request/:name", function (req, res) {

    var name = req.params.name;

    request(DATAGAMER_URL + '/metacritic/find/' + escape(name), {
        headers: {
            "apiKey": API_KEY
        }
    }, function (error, response, body) {
        if (!error) {
            res.send(JSON.parse(body));
        } else {
            console.error(error);
        }
    })
});