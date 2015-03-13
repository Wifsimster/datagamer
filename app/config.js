var fs = require('fs');
var ini = require('ini');

module.exports.init = function () {
    // Generate config.ini if first start
    if (fs.existsSync('./config.ini')) {
        console.log('./config.ini found !')

        var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));

        // config.ini file exist but no port define
        if (typeof config.general.port === "undefined") {
            config.port = 8080;

            // Write in config.ini file
            fs.writeFileSync('./config.ini', ini.stringify(config));

            console.warn("No port define in config.ini file, generate default port 8080 on config.ini file !");
        }
    } else {
        console.log('First time launching the app, generate default settings in ./config.ini file...');

        var port = 8080;
        var config = ini.parse(fs.readFileSync('./config.mdl', 'utf-8'));

        // [general]
        config.general.username = "";
        config.general.password = "";
        config.general.port = "8080";

        // [advanced]
        config.advanced.apikey = uuid.v4();
        config.advanced.debug = false;
        config.advanced.debug_directory = "";

        // [update]
        config.update.notification = false;
        config.update.automatic = false;

        // [collection]
        config.collection.directory = "/your/games/collection";
        config.ranamer.scan_auto = true;
        config.collection.cron.day = "1";
        config.collection.cron.hour = "*";
        config.collection.cron.minute = "*";

        // [search]
        config.search.directory = "";
        config.search.scan_auto = true;
        config.search.cron.day = "*";
        config.search.cron.hour = "1";
        config.search.cron.minute = "*";

        // [search.datagamer]
        config.search.datagamer.apikey = "";
        config.search.datagamer.url = "movie-discover.com:8084";

        // [thepiratebay]
        config.thepiratebay.proxy_server = "";
        config.thepiratebay.seed_ration = "";
        config.thepiratebay.seed_time = "";

        // [thepiratebay.filter]
        config.thepiratebay.filters.favorite_words = "";
        config.thepiratebay.filters.forbidden_words = "";
        config.thepiratebay.filters.uploadDate = "";
        config.thepiratebay.filters.size_min = "";
        config.thepiratebay.filters.seeders = "";
        config.thepiratebay.filters.leechers = "";

        // [kickasstorrents]
        config.kickasstorrents.proxy_server = "";
        config.kickasstorrents.seed_ration = "";
        config.kickasstorrents.seed_time = "";
        config.kickasstorrents.min_score = "";
        config.kickasstorrents.verified = false;

        // [transmission]
        config.transmission.address = "localhost";
        config.transmission.port = 9091;
        config.transmission.username = "";
        config.transmission.password = "";
        config.transmission.rpc_url = "/transmission/rpc";
        config.transmission.directory = "";
        config.transmission.remove_torrent = false;
        config.transmission.pause_torrent = false;

        // [renamer]
        config.renamer.from = "";
        config.renamer.to = "";
        config.ranamer.scan_auto = true;
        config.renamer.folder_naming = "<name> (<year>)";
        config.renamer.detect_minute = "15";
        config.renamer.unzip = false;

        // Write in config.ini file
        fs.writeFileSync('./config.ini', ini.stringify(config));

        if (fs.existsSync('./config.ini')) {
            console.log('./config.ini created !');
        } else {
            console.error('./config.ini was not created !');
        }
    }
}

// Return current port on config.ini
module.exports.getPort = function () {
    var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));
    return config.general.port;
}