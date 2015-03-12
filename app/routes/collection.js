var fs = require('fs');
var ini = require('ini');
var request = require('request');
var winston = require('winston');

// Nedb - Embedded database package
var Datastore = require('nedb');
var collection_db = new Datastore('collection.nedb');

var CODE = require('../../app/enums/codes');

app.get("/collection/games/scan", function (req, res) {

    collection_db.loadDatabase();
    var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));

    winston.info("Collection - Scan : " + config.collection.directory);

    var files = getFiles(config.collection.directory);

});


app.get("/collection/games", function (req, res) {
    collection_db.loadDatabase();
    //winston.info("Getting collection video games...");
    collection_db.find({}, function (err, games) {
        CODE.SUCCESS.games = games;
        res.json(CODE.SUCCESS);
    });
});

app.post("/collection/games", function (req, res) {
    collection_db.loadDatabase();
    //winston.info(req.body);
    collection_db.insert(req.body, function (err, game) {
        if (!err) {
            CODE.SUCCESS_POST.game = game;
            res.json(CODE.SUCCESS_POST);
        } else {
            res.json(CODE.BAD_REQUEST);
        }
    });
});

app.put("/collection/games", function (req, res) {
    collection_db.loadDatabase();

    winston.debug('Collection - Update game : ' + req.body);

    collection_db.update({_id: req.body._id}, req.body, function (err, newDoc) {
        if (!err) {
            res.json(CODE.SUCCESS_PUT);
        } else {
            res.json(CODE.BAD_REQUEST);
        }
    });
});

app.delete("/collection/games/:id", function (req, res) {
    collection_db.loadDatabase();
    var id = req.params.id;

    collection_db.remove({_id: id}, {}, function (err) {
        if (!err) {
            res.json(CODE.SUCCESS_DELETE);
        } else {
            res.json(CODE.BAD_REQUEST);
        }
    });
});

/**
 * Return a list of files
 * @param dir
 * @param files_
 * @returns {*|Array}
 */
function getFiles(dir, files_) {
    files_ = files_ || [];
    if (typeof files_ === 'undefined') files_ = [];
    var files = fs.readdirSync(dir);

    try {
        for (var i in files) {
            if (!files.hasOwnProperty(i)) continue;
            var name = dir + '/' + files[i];
            if (fs.statSync(name).isDirectory()) {
                getFiles(name, files_);
            } else {
                files_.push(name);
            }
        }
    } catch (err) {
        winston.error(err);
    }
    return files_;
}