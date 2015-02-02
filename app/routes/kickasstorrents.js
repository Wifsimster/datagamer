// http://kickass.filesoup.com/hourlydump.txt.gz

//var tpb = require('thepiratebay');
var fs = require('fs');
var ini = require('ini');

app.get("/kickasstorrents/test", function (req, res) {

    // Open config.ini
    var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));

    //tpb.recentTorrents()
    //    .then(function (results) {
    //        console.log("Get torrent list !");
    //        res.send(results);
    //    })
    //    .catch(function () {
    //        console.error(err);
    //        res.send(err);
    //    });

    res.send();
});
