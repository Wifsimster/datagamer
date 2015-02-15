var fs = require('fs');
var ini = require('ini');
var request = require('request');

// Search a game name on Datagamer database
app.get("/datagamer/search/:name", function (req, res) {

    var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));

    var name = req.params.name;

    console.log("Datagamer - Searching game : " + name);

    request('http://' + config.search.datagamer.url + '/api/games/by/name/' + escape(name), {
        headers: {
            "apiKey": config.search.datagamer.apikey
        }
    }, function (error, response, body) {
        if (!error) {
            res.send(JSON.parse(body));
        } else {
            console.error(error);
        }
    })
});

// Ask for video games count on Datagamer
app.get("/datagamer/games/count", function (req, res) {

    var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));

    console.log("Datagamer - Asking games count...");

    request('http://' + config.search.datagamer.url + '/api/games/count', {
        headers: {
            "apiKey": config.search.datagamer.apikey
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

    var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));

    var name = req.params.name;

    request('http://' + config.search.datagamer.url + '/metacritic/find/' + escape(name), {
        headers: {
            "apiKey": config.search.datagamer.apikey
        }
    }, function (error, response, body) {
        if (!error) {
            res.send(JSON.parse(body));
        } else {
            console.error(error);
        }
    })
});