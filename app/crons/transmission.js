var fs = require('fs');
var ini = require('ini');
var request = require('request');
var CronJob = require('cron').CronJob;
var winston = require('winston');

// Nedb - Embedded database package
var Datastore = require('nedb');
var wanted_db = new Datastore('wanted.nedb');

module.exports.start = function () {

    // Open conf file
    var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));

    // CRON
    if (config.transmission.remove_torrent) {

        // CRON conf

        // Check every hour for done torrents
        new CronJob('*/30 * * * * * *', function () {
            winston.info("CRON Transmission - Check for done torrents [TODO]");

            request('http://localhost:' + config.general.port + '/transmission', function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    winston.info("CRON Transmission - Get the list of torrents");
                } else {
                    winston.error(error);
                }
            });

            // Get torrents list
            for(var i = 0 ; i < torrents.length ; i++){
                // If torrent is stop, remove it
                if(torrent.get()) {

                }
            }
        }, null, true, "Europe/Paris");
    }
}