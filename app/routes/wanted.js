var fs = require('fs');
var ini = require('ini');

// Config
app.get("/wanted/games", function (req, res) {
    var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));

    console.log("Getting wanted video games...");

    res.send(config);
});

app.put("/config", function (req, res) {
    var config = req.body;

    // Write in config.ini file
    fs.writeFileSync('./config.ini', ini.stringify(config));

    res.json({message: "OK"});
});