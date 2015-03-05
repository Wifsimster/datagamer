var fs = require('fs');
var ini = require('ini');
var request = require('request');
var winston = require('winston');

var CODE = require('../../app/enums/codes');

// Search games by name
// This will automatically update Datagamer db
app.get("/datagamer/search/:name", function (req, res) {

    var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));

    var name = req.params.name;

    winston.info("Datagamer - Searching game : " + name);

    request('http://' + config.search.datagamer.url + '/api/games/by/defaultTitle/' + name, {
        headers: {
            "apiKey": config.search.datagamer.apikey
        }
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var result = JSON.parse(body);

            if (result.code == 200) {
                //winston.info('Datagamer - Games found : ' + result.games);
                CODE.SUCCESS.games = result.games;
                res.send(CODE.SUCCESS);
            } else {
                winston.info('Datagamer - No game found for : ' + name);
                res.send(CODE.NOT_FOUND);
            }
        } else {
            winston.error(error);
            res.json(CODE.SERVER_ERROR);
        }
    })
});


// Ask for video games count
app.get("/datagamer/games/count", function (req, res) {

    var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));

    winston.info("Datagamer - Asking games count...");

    request('http://' + config.search.datagamer.url + '/api/games/count', {
        headers: {
            "apiKey": config.search.datagamer.apikey
        }
    }, function (error, response, body) {

        if (!error && response.statusCode == 200) {
            var result = JSON.parse(body);
            winston.info('Datagamer - Count : ' + result.count);
            res.json(result);
        } else {
            winston.error(error);
            res.json(CODE.SERVER_ERROR);
        }
    })
});

app.get("/datagamer/games/similar/:name", function (req, res) {

    var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));

    var name = req.params.name;

    winston.info("Datagamer - Searching games similar to " + name);

    request('http://' + config.search.datagamer.url + '/api/games/similar/by/80/for/' + name, {
        headers: {
            "apiKey": config.search.datagamer.apikey
        }
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            res.json(JSON.parse(body));
        } else {
            winston.error(error);
            res.json(CODE.SERVER_ERROR);
        }
    })
});

// Search a game by id
// This method will automatically update the game info on Datagamer db
app.get("/datagamer/game/info/:id", function (req, res) {

    var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));

    var id = req.params.id;

    winston.info("Datagamer - Updating '" + id + "' info...");

    request('http://' + config.search.datagamer.url + '/api/games/by/id/' + id, {
        headers: {
            "apiKey": config.search.datagamer.apikey
        }
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var result = JSON.parse(body);

            if (result.code == 200) {
                winston.info('Datagamer responds with game info !');
                res.json(result);
            } else {
                res.json(CODE.SERVER_ERROR);
            }
        } else {
            winston.error(error);
            res.json(CODE.SERVER_ERROR);
        }
    })
});

// Add a new user
app.post("/datagamer/request/user", function (req, res) {

    var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));

    var name = req.body.name;
    var email = req.body.email;

    winston.info("Datagamer - Adding '" + name + "' as a new user...");

    request.post('http://' + config.search.datagamer.url + '/api/users', {
        form: {
            name: name,
            email: email
        }
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var result = JSON.parse(body);

            if (result.code == 201) {
                winston.info('Datagamer - ' + result.user.name + ' added !');

                // Update config datagamer api key
                var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));
                config.search.datagamer.apikey = result.user.apiKey;
                fs.writeFileSync('./config.ini', ini.stringify(config));

                res.json(result);
            } else {
                winston.error('Datagamer - ' + result.message);
                res.json(result);
            }
        } else {
            winston.error(error);
            res.json(CODE.SERVER_ERROR);
        }
    })
});