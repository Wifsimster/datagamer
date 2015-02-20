var fs = require('fs');
var ini = require('ini');
var request = require('request');
var CronJob = require('cron').CronJob;


module.exports.init = function () {

    // Open conf file
    var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));

    // Search cron
    if (config.search.scan_auto) {

        // CRON conf
        var search_cron = config.search.cron.minute + ' ' + config.search.cron.hour + ' ' + config.search.cron.day;
        console.log("-- Search : " + search_cron);

        new CronJob('/45 ' + search_cron + ' * * *', function () {
            console.log('CRON - Search :');

            // Get wanted games list
            request('http://localhost:' + config.general.port + '/wanted/games', function (error, response, body) {
                if (!error && response.statusCode == 200) {

                    var games = JSON.parse(body);

                    for (var i = 0; i < games.length; i++) {

                        var game = games[i];

                        console.log("-- TPB : Searching for " + game.name + "...");

                        request('http://localhost:' + config.general.port + '/thepiratebay/search/' + game.name, function (error, response, body) {
                            if (!error && response.statusCode == 200) {

                                if (body) {

                                    var result = JSON.parse(body);

                                    if (result.code == 200) {
                                        var torrent = result.torrent;

                                        console.log("-- TPB : Found one tracker with the current filters : " + torrent.name);

                                        // If a tracker was found, add it to Transmission
                                        request.post('http://localhost:' + config.general.port + '/transmission/add', {form: {url: torrent.magnetLink}}, function (error, response, body) {

                                            console.error(error);
                                            console.log(body);

                                            if (!error) {
                                                console.log(body);
                                                var result = JSON.parse(body);
                                                console.log(result);

                                                if (!error && result.statusCode == 200) {
                                                    console.log("-- Tracker added to Transmission !");

                                                    // Update wanted game info that the game was snatched
                                                    game.snatched = true;
                                                    request.put('http://localhost:' + config.general.port + '/wanted/game', {form: game}, function (error, response, body) {
                                                        if (!error && response.statusCode == 202) {
                                                            console.log(response);
                                                            // Update wanted game info that the game was snatched

                                                        } else {
                                                            console.error(error);
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
                    }
                }
            });
        }, null, true, "Europe/Paris");
    }
}