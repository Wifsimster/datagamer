var tpb = require('thepiratebay');
var fs = require('fs');
var ini = require('ini');

app.get("/thepiratebay/test", function (req, res) {

    // Open config.ini
    var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));

    tpb.recentTorrents()
        .then(function (results) {
            res.send(results);
        })
        .catch(function () {
            console.error(err);
            res.send(err);
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

    console.log("Searching TPB for '" + name + "'...");

    // Open config.ini
    var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));

    // Search a tracker in game category
    tpb.search(name, {category: '400'})
        .then(function (torrents) {

            // The torrent send to transmission if it passed the filter
            var favorite_torrent = null;

            for (var i = 0; i < torrents.length; i++) {

                var torrent = torrents[i];

                // Set the favorite torrent as current before filters
                favorite_torrent = torrent;

                // First, only take PC game tracker
                if (torrent.subcategory.id == '401') {

                    console.log("Torrent subject to be taken : " + torrent.name);

                    // Filter white list of words
                    if (config.thepiratebay.filters.favorite_words) {
                        var words = config.thepiratebay.filters.favorite_words.split(',');
                        for (var i = 0; i < words.length; i++) {
                            // TODO : Check in the torrent name if the word exist, if so keep this torrent and go on
                        }
                    }

                    // Filter black list of words
                    if (config.thepiratebay.filters.forbidden_words) {
                        var words = config.thepiratebay.filters.forbidden_words.split(',');
                        for (var i = 0; i < words.length; i++) {
                            // TODO : Check in the torrent name if the word exist, if so reject this torrent and go to the next one
                        }
                    }

                    // Filter size : If torrent size <= config size reject the torrent
                    if (torrent.size <= config.thepiratebay.filters.size_min) {
                        console.log("-- Torrent reject : Size too small (" + torrent.size + ")");
                        favorite_torrent = null;
                    }

                    // Filter seeders : If torrent seeders <= config seeders reject the torrent
                    if (torrent.seeders <= config.thepiratebay.filters.seeders) {
                        console.log("-- Torrent reject : Seeders too small (" + torrent.seeders + ")");
                        favorite_torrent = null;
                    }

                    // Filter leechers : If torrent leechers <= config leechers reject the torrent
                    if (torrent.leechers <= config.thepiratebay.filters.leechers) {
                        console.log("-- Torrent reject : Leechers too small (" + torrent.leechers + ")");
                        favorite_torrent = null;
                    }

                    // Filter uploadDate : 12-09 2014
                    if (config.thepiratebay.filters.uploadDate) {
                        var torrentDate = new Date();
                        var torrentDateArray = torrent.uploadDate.split(" ").split("-");
                        torrentDate.setFullYear(torrentDateArray[2], torrentDateArray[1], torrentDateArray[0]);

                        var filterDate = Date.parse(config.thepiratebay.filters.uploadDate);

                        console.log("-- Check date parsing :");
                        console.log("---- Torent : " + torrent.uploadDate + " = " + torrentDate.getDay() + torrentDate.getMonth() + torrentDate.getFullYear());
                        console.log("---- Filter : " + filterDate);

                        // Compare millisconds
                        if (torrent.uploadDate.getTime() < filterDate) {
                            favorite_torrent = null;
                        }
                    }

                    // If favorite torrent is not null send him
                    if (favorite_torrent) {
                        res.send(favorite_torrent);
                    }
                }
            }
            res.send(null);
        })
        .catch(function () {
            console.error(err);
            res.send(err);
        });
});
