var fs = require('fs');
var ini = require('ini');
var request = require('request');

var CODE = require('../../app/enums/codes');

// Search games by name
// This will automatically update Datagamer db
app.get("/datagamer/search/:name", function (req, res) {

    var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));

    var name = req.params.name;

    console.log("Datagamer - Searching game : " + name);

    request('http://' + config.search.datagamer.url + '/api/games/by/name/' + name, {
        headers: {
            "apiKey": config.search.datagamer.apikey
        }
    }, function (error, response, body) {
        if (!error) {
            var result = JSON.parse(body);

            if (result.code == CODE.SUCCESS.code) {
                console.log('Datagamer - Games found : ' + result.games);
                CODE.SUCCESS.games = result.games;
                res.send(CODE.SUCCESS);
            } else {
                console.log('Datagamer - No game found for : ' + name);
                res.send(CODE.NOT_FOUND);
            }
        } else {
            console.error(error);
            res.send(CODE.SERVER_ERROR);
        }
    })
});

// Ask for video games count
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

// Search a game by id
// This method will automatically update the game info on Datagamer db
app.get("/datagamer/game/info/:id", function (req, res) {

    var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));

    var id = req.params.id;

    console.log("Datagamer - Updating '" + id + "' info...");

    request('http://' + config.search.datagamer.url + '/api/games/by/id/' + id, {
        headers: {
            "apiKey": config.search.datagamer.apikey
        }
    }, function (error, response, body) {
        if (!error) {
            var result = JSON.parse(body);

            if (result.code == 200) {
                console.log('Datagamer responds with game info !');
                res.json(result);
            } else {
                res.json(CODE.SERVER_ERROR);
            }
        } else {
            console.error(error);
        }
    })
});