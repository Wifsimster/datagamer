var fs = require('fs');
var ini = require('ini');
var request = require('request');
var CronJob = require('cron').CronJob;
var winston = require('winston');

module.exports.start = function () {

    // Open conf file
    var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));

    winston.info("CRON Transmission * */15 *");

    // CRON
    if (config.transmission.remove_torrent) {

        // Check every 15 mn for done torrents
        new CronJob('* */15 * * * * *', function () {
            winston.info("CRON Transmission - Checking for done torrents");

            request('http://localhost:' + config.general.port + '/transmission', function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    //winston.info("CRON Transmission - Get the list of torrents");
                    var result = JSON.parse(body);
                    var torrents = result.torrents;

                    if (torrents) {
                        for (var i = 0; i < torrents.length; i++) {
                            // If torrent is finished, remove it
                            if (torrents[i].isFinished) {
                                request('http://localhost:' + config.general.port + '/transmission/remove/' + torrents[i].id, function (error, response, body) {
                                    if (!error && response.statusCode == 200) {
                                        var result = JSON.parse(body);
                                        if (result.code == 204) {
                                            winston.info("CRON Transmission - Remove " + torrents[i].name);
                                        } else {
                                            winston.error("CRON Transmission - " + result.message);
                                        }
                                    } else {
                                        winston.error("CRON Transmission - " + error);
                                    }
                                });
                            }
                        }
                    } else {
                        winston.info("CRON Transmission - No torrents");
                    }
                } else {
                    winston.error("CRON Transmission - " + error);
                }
            });
        }, null, true, "Europe/Paris");
    }
}