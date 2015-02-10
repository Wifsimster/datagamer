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
//  name: 'Far.Cry.4.[v1.5].Repack-R.G.Mechanics',
//    size: '13.34 GiB',
//    link: 'http://thepiratebay.se/torrent/11668819/Far.Cry.4.[v1.5].Repack-R.G.Mechanics',
//    category: { id: '400', name: 'Games' },
//  seeders: '3610',
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
        .then(function (results) {

            var result;

            for(var i = 0 ; i < results.length ; i++) {
                // First, only take PC game tracker
                if(results[i].subcategory.id == '401') {
                    // Filter white list

                    // Filter black list

                    // Filter size

                    // Filter seeders

                    // Filter leechers

                    // Filter uploadDate
                    result = results[i];
                }
            }

            res.send(result);
        })
        .catch(function () {
            console.error(err);
            res.send(err);
        });
});
