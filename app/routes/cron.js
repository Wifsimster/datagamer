var search_cron = require('../../app/crons/search.js');

var forever = require('forever');

app.get("/cron/search", function (req, res) {

    console.log(forever.restartAll());
    //forever.restart();
});
