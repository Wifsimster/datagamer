// Nedb - Embedded database package
var Datastore = require('nedb');
var collection_db = new Datastore({filename: 'collection.nedb', autoload: true});

app.get("/collection/games", function (req, res) {
    //console.log("Getting collection video games...");

    collection_db.find({}, function (err, games) {
        res.send(games)
    });
});

app.post("/collection/games", function (req, res) {
    //console.log(req.body);
    collection_db.insert(req.body, function (err, newDoc) {
        if (!err)
            res.json({message: "OK"});
    });
});

app.put("/collection/games", function (req, res) {
    //console.log(req.body._id);
    collection_db.update({_id: req.body._id}, req.body, function (err, newDoc) {
        if (!err)
            res.json({message: "OK"});
    });
});

app.delete("/collection/games/:id", function (req, res) {
    var id = req.params.id;

    collection_db.remove({_id: id}, {}, function (err) {
        if (!err)
            res.json({message: "OK"});
    });
});