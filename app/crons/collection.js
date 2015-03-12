var fs = require('fs');
var ini = require('ini');
var request = require('request');
var CronJob = require('cron').CronJob;
var winston = require('winston');

module.exports.start = function () {
    // Open conf file
    var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));

    // Collection cron
    if (config.collection.scan_auto) {

        // CRON conf
        var collection_cron = config.collection.cron.minute + ' ' + config.collection.cron.hour + ' ' + config.collection.cron.day;
        winston.info("CRON - Collection : " + collection_cron);

        new CronJob('* ' + collection_cron + ' * * *', function () {
            request('http://localhost:' + config.general.port + '/renamer/games/postprocessing', function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    winston.info("CRON - Collection : Post processing files done !");
                } else {
                    winston.error(error);
                }
            });
        }, null, true, "Europe/Paris");
    }
}