var tpb = require('thepiratebay');

// Get TOP torrents in subcategory PC
tpb.topTorrents('401').then(function (results) {
    console.log(results);
}).catch(function (err) {
    console.log(err);
});

// Search torrents in category Game
tpb.search('Dying Light', {
    category: '400'
}).then(function (results) {
    console.log(results);
}).catch(function (err) {
    console.log(err);
});

app.get("/thepiratebay/torrents", function (req, res) {

});