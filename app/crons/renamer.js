var fs = require('fs');
var ini = require('ini');
var request = require('request');
var CronJob = require('cron').CronJob;
var winston = require('winston');

module.exports.start = function () {
    // Open conf file
    var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));

    // Renamer cron
    if (config.renamer.scan_auto) {

        // CRON conf
        winston.info("-- Renamer : " + config.renamer.detect_minute + " * *");

        new CronJob('* ' + config.renamer.detect_minute + ' * * * * *', function () {

            winston.info('CRON - Renamer :');

            request('http://localhost:' + config.general.port + '/renamer/games/postprocessing', function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    winston.info("200");
                }
            });
        }, null, true, "Europe/Paris");
    }
}