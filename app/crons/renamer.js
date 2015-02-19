var fs = require('fs');
var ini = require('ini');
var request = require('request');
var CronJob = require('cron').CronJob;

// Open conf file
var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));

// Renamer cron
if (config.renamer.scan_auto) {

    // CRON conf
    console.log("-- Renamer : " + config.renamer.detect_minute + " * *");

    new CronJob('* ' + config.renamer.detect_minute + ' * * * * *', function () {

        console.log('CRON - Renamer :');

        request('http://localhost:' + config.general.port + '/renamer/games/scan', function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log("200");
            }
        });
    }, null, true, "Europe/Paris");
}