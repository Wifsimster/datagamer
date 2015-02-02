var fs = require('fs');
var ini = require('ini');

//------------------------------------------
//----              PAGES               ----
//------------------------------------------
app.get('/partials/:partialPath', function (req, res) {
    res.render('partials/' + req.params.partialPath);
});

app.get('/', function (req, res) {
    console.log('frehertjyjty');
    res.render('layout', {
        title: 'Datagamer'
    });
});

app.get('/wanted', function (req, res) {
    res.render('layout', {
        title: 'Datagamer'
    });
})
app.get('/collection', function (req, res) {
    res.render('layout', {
        title: 'Datagamer'
    });
})
app.get('/settings', function (req, res) {
    res.render('layout', {
        title: 'Datagamer'
    });
});

//------------------------------------------
//----              CONFIG              ----
//------------------------------------------
app.get("/config", function (req, res) {
    var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));
    res.send(config);
});

app.put("/config", function (req, res) {
    var config = req.body;

    // Write in config.ini file
    fs.writeFileSync('./config.ini', ini.stringify(config));

    res.json({message: "OK"});
});