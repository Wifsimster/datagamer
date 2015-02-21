var fs = require('fs');
var ini = require('ini');
var request = require('request');
var CronJob = require('cron').CronJob;

// Nedb - Embedded database package
var Datastore = require('nedb');
var wanted_db = new Datastore('wanted.nedb');


module.exports.start = function () {

    // Open conf file
    var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));

    // Search cron
    if (config.search.scan_auto) {

        // CRON conf
        var search_cron = config.search.cron.minute + ' ' + config.search.cron.hour + ' ' + config.search.cron.day;
        console.log("CRON Search - " + search_cron);

        new CronJob('/45 ' + search_cron + ' * * *', function () {

            // Get wanted games list
            request('http://localhost:' + config.general.port + '/wanted/games', function (error, response, body) {
                if (!error && response.statusCode == 200) {

                    var games = JSON.parse(body);

                    for (var i = 0; i < games.length; i++) {

                        var game = games[i];

                        // If game is not already added to Transmission
                        if(!game.snatched) {

                            console.log("CRON Search - Searching for " + game.name + "...");

                            request('http://localhost:' + config.general.port + '/thepiratebay/search/' + game.name, function (error, response, body) {
                                if (!error && response.statusCode == 200) {

                                    if (body) {

                                        var result = JSON.parse(body);

                                        if (result.code == 200) {
                                            var torrent = result.torrent;

                                            console.log("CRON Search - Found one tracker with the current filters : " + torrent.name);

                                            // If a tracker was found, add it to Transmission
                                            request.post('http://localhost:' + config.general.port + '/transmission/add', {form: {url: torrent.magnetLink}}, function (error, response, body) {

                                                if (!error) {

                                                    var result = JSON.parse(body);

                                                    if (result.code == 200) {
                                                        console.log("CRON Search - Torrent added to Transmission : " + result.torrent.name);

                                                        wanted_db.loadDatabase();
                                                        console.log('Updating wanted game info ' + game.name + '...');

                                                        // Update wanted game info
                                                        game.snatched = true;
                                                        wanted_db.update({name: game.name}, game, function (err, newDoc) {
                                                            if (!err) {
                                                                console.log(game.name + ' set as snatched !');
                                                            } else {
                                                                console.error(err);
                                                            }
                                                        });

                                                    } else {
                                                        console.error(error);
                                                    }
                                                } else {
                                                    console.error(error);
                                                }
                                            });
                                        }
                                    }
                                } else {
                                    console.error(error);
                                }
                            });
                        } else {
                            console.log("No wanted game to search !");
                        }
                    }
                }
            });
        }, null, true, "Europe/Paris");
    }
}