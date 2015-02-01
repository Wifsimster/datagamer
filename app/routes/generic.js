//------------------------------------------
//----              GET                 ----
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

// Settings
app.get("/settings/one", function (req, res) {
    settings_db.findOne({}, function (err, doc) {
        res.send(doc)
    });
});

//------------------------------------------
//----              POST                ----
//------------------------------------------
app.post("/settings", function (req, res) {
    settings_db.insert(req.body, function (err, settings) {
        if (!err) {
            res.json({message: "OK"});
            SETTINGS = settings;
        }
    });
});

app.put("/settings", function (req, res) {
    settings_db.update({_id: req.body._id}, req.body, function (err, result) {
        if (!err) {
            res.json({message: "OK"});

            // Update settings var
            SETTINGS = req.body;
        }
    });
});