var fs = require('fs');
var ini = require('ini');
var request = require('request');
var CronJob = require('cron').CronJob;
var winston = require('winston');


module.exports.start = function () {
// Open conf file
    var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));

// Update cron
    if (config.update.notification || config.update.automatic) {

        // CRON conf
        winston.info("-- Check for update every day");

        // Check every day for new update
        new CronJob('* * * 1 * * *', function () {

            winston.info('CRON - Update :');

            // TODO : Check for any update online
            var update = false;

            if (update) {
                if (config.update.notification) {
                    // TODO : Send a notification
                }

                if (config.update.automatic) {
                    // TODO : Automatically get the update and reboot the app
                }
            }

        }, null, true, "Europe/Paris");
    }
}