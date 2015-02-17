// Nedb - Embedded database package
var Datastore = require('nedb');
var wanted_db = new Datastore('wanted.nedb');
wanted_db.loadDatabase();

var CODE = require('../../app/enums/codes');

app.get("/wanted/games", function (req, res) {
    //console.log("Getting wanted video games...");
    wanted_db.find({}, function (err, games) {
        res.send(games)
    });
});

app.get("/wanted/games/:id", function (req, res) {

    var id = req.params.id;

    wanted_db.findOne({_id: id}, function (err, game) {
        if (!err) {
            CODE.SUCCESS.game = game;
            res.send(CODE.SUCCESS);
        }
    });
});

app.post("/wanted/games", function (req, res) {
    wanted_db.find({name: req.body.name}, function (err, games) {

        if (games.length == 0) {
            wanted_db.insert(req.body, function (err, newDoc) {
                if (!err) {
                    CODE.SUCCESS_POST.game = newDoc;
                    res.json(CODE.SUCCESS_POST);
                }
            });
        } else {
            res.json(CODE.ALREADY_EXIST);
        }
    });
});

app.put("/wanted/games", function (req, res) {

    console.log(req.body.name);

    wanted_db.update({name: req.body.name}, req.body, function (err, newDoc) {
        if (!err) {
            res.json(CODE.SUCCESS_PUT);
        } else {
            console.error(err);
        }
    });
});

app.delete("/wanted/games/:id", function (req, res) {
    var id = req.params.id;

    wanted_db.remove({_id: id}, {}, function (err) {
        if (!err)
            res.json(CODE.SUCCESS);
    });
});