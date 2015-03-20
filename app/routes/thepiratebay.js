var tpb = require('thepiratebay');
var fs = require('fs');
var ini = require('ini');
var winston = require('winston');

var CODE = require('../../app/enums/codes');

// Test TPB communication
app.get("/thepiratebay/test", function (req, res) {

    winston.info("TPB - Test call");

    tpb.recentTorrents()
        .then(function () {
            res.json(CODE.SUCCESS);
        })
        .catch(function (err) {
            winston.error(err);
            res.json(CODE.BAD_REQUEST);
        });
});

// Get the top 10 actual favorite video games on TPB
app.get("/thepiratebay/top", function (req, res) {

    winston.info("TPB - Getting TOP torrents");

    tpb.topTorrents('400')
        .then(function (results) {
            winston.info("TPB - Top torrent OK");
            var favorite_games = [];

            for (var i = 0; i < results.length; i++) {
                if (results[i].subcategory.name == "PC") {
                    favorite_games.push(results[i]);
                }
            }

            winston.info("TPB - Filtering PC torrents OK");
            CODE.SUCCESS.torrents = favorite_games;
            res.json(CODE.SUCCESS);
        })
        .catch(function () {
            winston.error(err);
            res.json(CODE.BAD_REQUEST);
        });
});

// Example :
//    name: 'Far.Cry.4.[v1.5].Repack-R.G.Mechanics',
//    size: '13.34 GiB',
//    link: 'http://thepiratebay.se/torrent/11668819/Far.Cry.4.[v1.5].Repack-R.G.Mechanics',
//    category: { id: '400', name: 'Games' },
//    seeders: '3610',
//    leechers: '380',
//    uploadDate: '12-09 2014',
//    magnetLink: 'magnet:?xt=urn:btih:0da12a42ef5aca2b75dc',
//    subcategory: { id: '401', name: 'PC' }
app.get("/thepiratebay/search/:name", function (req, res) {

    var name = req.params.name;

    winston.info("TPB - Searching for '" + name + "'...");

    // Open config.ini
    var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));

    // Search a tracker in game category
    tpb.search(name, {category: '400'})
        .then(function (torrents) {
            if (torrents.length > 0) {
                winston.info("TPB - " + torrents.length + " potential torrents to analysed");

                for (var i = 0; i < torrents.length; i++) {

                    var torrent = torrents[i];
                    torrent.score = 0;

                    // First, only take PC game tracker
                    if (torrent.subcategory.id == '401') {

                        winston.info("TPB - Torrent subject to be taken : " + torrent.name);

                        // Filter white list of words
                        if (config.thepiratebay.filters.favorite_words) {
                            var favorite_words = false;
                            var words = config.thepiratebay.filters.favorite_words.split(',');

                            // Looking for the word in the torrent name
                            for (var j = 0; j < words.length; j++) {
                                var word = words[j].trim();
                                winston.info('TPB -- ' + word);
                                var regex = new RegExp(word);
                                if (regex.test(torrent.name)) {
                                    torrents[i].score = torrents[i].score + 1;
                                }
                            }

                            // If no favorite words detected for this torrent, go to the next one
                            if (!favorite_words) {
                                favorite_torrent = null;
                                winston.info('TPB -      Torrent reject : No favorite word detected');
                                torrents[i].score = torrents[i].score - 1;
                            }
                        } else {
                            winston.info('TPB -      No favorite words detection');
                        }

                        // Filter black list of words
                        if (config.thepiratebay.filters.forbidden_words) {
                            var forbidden_words = false;
                            var words = config.thepiratebay.filters.forbidden_words.split(',');

                            // Looking for the word in the torrent name
                            for (var j = 0; j < words.length; j++) {
                                var word = words[j].trim();
                                var regex = new RegExp(word);
                                if (regex.test(torrent.name)) {
                                    forbidden_words = true;
                                }
                            }

                            // If forbidden words detected for this torrent, go to the next one
                            if (forbidden_words) {
                                winston.info('TPB -      Torrent reject : Forbidden word detected');
                                torrents[i].score = torrents[i].score - 1;
                            }
                        } else {
                            winston.info('TPB -      No forbidden words detection');
                        }

                        if (torrent.size && (/GiB/).test(torrent.size)) {
                            winston.log("TPB -      Torrent size detection : " + torrent.size);
                            torrent.size = parseInt(torrent.size.split('GiB'));

                            // Filter size : If torrent size <= config size reject the torrent
                            if (torrent.size <= config.thepiratebay.filters.size_min) {
                                winston.info("TPB -      Torrent reject : Size too small (" + torrent.size + ")");
                                torrents[i].score = torrents[i].score - 1;
                            }
                        } else {
                            winston.log("TPB -      Torrent reject : No size found");
                            torrents[i].score = torrents[i].score - 1;
                        }

                        // Filter seeders : If torrent seeders <= config seeders reject the torrent
                        if (torrent.seeders <= config.thepiratebay.filters.seeders) {
                            winston.info("TPB -      Torrent reject : Seeders too small (" + torrent.seeders + ")");
                            torrents[i].score = torrents[i].score - 1;
                        }

                        // Filter leechers : If torrent leechers <= config leechers reject the torrent
                        if (torrent.leechers <= config.thepiratebay.filters.leechers) {
                            winston.info("TPB -      Torrent reject : Leechers too small (" + torrent.leechers + ")");
                            torrents[i].score = torrents[i].score - 1;
                        }

                        // Filter uploadDate : 12-09 2014
                        if (config.thepiratebay.filters.uploadDate) {
                            var torrentDate = new Date();
                            var torrentDateArray = torrent.uploadDate.split(" ").split("-");
                            torrentDate.setFullYear(torrentDateArray[2], torrentDateArray[1], torrentDateArray[0]);

                            var filterDate = Date.parse(config.thepiratebay.filters.uploadDate);

                            winston.info("TPB -      Check date parsing :");
                            winston.info("TPB -          Torrent : " + torrent.uploadDate + " = " + torrentDate.getDay() + torrentDate.getMonth() + torrentDate.getFullYear());
                            winston.info("TPB -          Filter : " + filterDate);

                            // Compare millisconds
                            if (torrent.uploadDate.getTime() < filterDate) {
                                torrents[i].score = torrents[i].score - 1;
                            }
                        }
                    }
                }

                var favorite_torrent = null;

                // Return the torrent with the highest score
                for (var i = 0; i < torrents.length - 1; i++) {
                    var torrent = torrents[i];
                    if (torrent.score > torrent[i + 1].score) {
                        favorite_torrent = torrent;
                    }
                }

                if (favorite_torrent) {
                    winston.info("TPB - Return torrent is : " + favorite_torrent.name + ' with a score of ' + torrent.score);
                    CODE.SUCCESS.torrent = favorite_torrent;
                    res.json(CODE.SUCCESS);
                } else {
                    winston.info('TPB - No favorite torrent found for ' + name + ' !');
                    res.json(CODE.NOT_FOUND);
                }
            } else {
                winston.info('TPB - No torrent found for ' + name + ' !');
                res.json(CODE.NOT_FOUND);
            }
        })
        .catch(function () {
            winston.error(err);
            res.json(CODE.BAD_REQUEST);
        });
});
