// Nedb - Embedded database package
var Datastore = require('nedb');
var wanted_db = new Datastore({filename: 'wanted.nedb', autoload: true});

var CODE = require('../../app/enums/codes');

app.get("/wanted/games", function (req, res) {
    //console.log("Getting wanted video games...");
    wanted_db.find({}, function (err, games) {
        res.send(games)
    });
});

app.post("/wanted/games", function (req, res) {

    wanted_db.find({name: req.body.name}, function (err, games) {

        console.log(req.body.name);
        console.log(games.length);

        if (games.length == 0) {
            wanted_db.insert(req.body, function (err, newDoc) {
                if (!err)
                    res.json(CODE.SUCCESS);
            });
        } else {
            res.json(CODE.ALREADY_EXIST)
        }
    });
});

app.put("/wanted/games", function (req, res) {
    //console.log(req.body._id);
    wanted_db.update({_id: req.body._id}, req.body, function (err, newDoc) {
        if (!err)
            res.json(CODE.SUCCESS);
    });
});

app.delete("/wanted/games/:id", function (req, res) {
    var id = req.params.id;

    wanted_db.remove({_id: id}, {}, function (err) {
        if (!err)
            res.json(CODE.SUCCESS);
    });
});