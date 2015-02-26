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
        winston.info("-- Check for done torrents");

        // Check every hour for done torrents
        new CronJob('* * 1 * * * *', function () {

            winston.info('CRON - Update :');


        }, null, true, "Europe/Paris");
    }
}