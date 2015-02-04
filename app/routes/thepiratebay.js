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

app.get("/thepiratebay/search/:name", function (req, res) {

    // Open config.ini
    var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));

    // Search a tracker in game category
    tpb.search(req.params.name, {category: '400'})
        .then(function (results) {
            for(var i = 0 ; i < results.length ; i++) {
                // First, only take PC game tracker
                if(results[i].subcategory.id == '401') {
                    // Filter white list

                    // Filter balck list

                    // Filter size

                    // Filter seeders

                    // Filter leechers

                    // Filter uploadDate

                }
            }

            //name: 'Far.Cry.4.[v1.5].Repack-R.G.Mechanics',
            //    size: '13.34 GiB',
            //    link: 'http://thepiratebay.se/torrent/11668819/Far.Cry.4.[v1.5].Repack-R.G.Mechanics',
            //    category: { id: '400', name: 'Games' },
            //seeders: '3610',
            //    leechers: '380',
            //    uploadDate: '12-09 2014',
            //    magnetLink: 'magnet:?xt=urn:btih:0da12a42ef5aca2b75dc',
            //    subcategory: { id: '401', name: 'PC' }

            res.send(results);
        })
        .catch(function () {
            console.error(err);
            res.send(err);
        });
});
