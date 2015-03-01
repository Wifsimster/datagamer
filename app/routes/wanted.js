// Nedb - Embedded database package
var Datastore = require('nedb');
var wanted_db = new Datastore('wanted.nedb');
var winston = require('winston');

var CODE = require('../../app/enums/codes');

app.get("/wanted/games", function (req, res) {

    wanted_db.loadDatabase();
    winston.info("Getting wanted video games...");

    wanted_db.find({}, function (err, games) {
        if (!err) {
            CODE.SUCCESS.games = games;
            res.json(CODE.SUCCESS);
        } else {
            winston.error(err);
            res.json(CODE.BAD_REQUEST);
        }
    });
});

app.get("/wanted/games/:id", function (req, res) {

    wanted_db.loadDatabase();
    var id = req.params.id;

    wanted_db.findOne({_id: id}, function (err, game) {
        if (!err) {
            CODE.SUCCESS.game = game;
            res.send(CODE.SUCCESS);
        } else {

            winston.error(err);
            res.json(CODE.BAD_REQUEST);
        }
    });
});

app.post("/wanted/games", function (req, res) {
    wanted_db.loadDatabase();
    wanted_db.find({name: req.body.name}, function (err, games) {
        if (!err) {
            if (games.length == 0) {
                wanted_db.insert(req.body, function (err, newDoc) {
                    if (!err) {
                        CODE.SUCCESS_POST.game = newDoc;
                        res.json(CODE.SUCCESS_POST);
                    } else {

                        winston.error(err);
                        res.json(CODE.BAD_REQUEST);
                    }
                });
            } else {
                res.json(CODE.ALREADY_EXIST);
            }
        } else {
            winston.error(err);
            res.json(CODE.BAD_REQUEST);
        }
    });
});

app.put("/wanted/games", function (req, res) {

    wanted_db.loadDatabase();
    winston.info(req.body.name);

    wanted_db.update({name: req.body.name}, req.body, function (err, newDoc) {
        if (!err) {
            CODE.SUCCESS_PUT.game = newDoc;
            res.json(CODE.SUCCESS_PUT);
        } else {
            winston.error(err);
            res.json(CODE.BAD_REQUEST);
        }
    });
});

app.delete("/wanted/games/:id", function (req, res) {
    wanted_db.loadDatabase();
    var id = req.params.id;

    wanted_db.remove({_id: id}, {}, function (err) {
        if (!err) {
            res.json(CODE.SUCCESS_DELETE);
        } else {
            winston.error(err);
            res.json(CODE.BAD_REQUEST);
        }
    });
});