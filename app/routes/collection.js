var fs = require('fs');
var ini = require('ini');
var request = require('request');

// Nedb - Embedded database package
var Datastore = require('nedb');
var collection_db = new Datastore({filename: 'collection.nedb', autoload: true});


app.get("/collection/games/scan", function (req, res) {

    var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));

    console.log(config.collection.directory);

    var files = getFiles(config.collection.directory);

    for (var i = 0; i < files.length; i++) {

        var regex = /.*\.((iso)$)/;

        // Detect a file ended by .iso
        if (files[i].match(regex)) {
            //console.log(files[i]);
            console.log("Potential video game file : " + files[i]);

            // Extract filename (no path, no format, no dot)
            var filename = files[i].split(/(\\|\/)/g).pop();
            filename = filename.split('.').reverse().pop();

            console.log("Searching a game for : " + filename);

            request('http://www.omdbapi.com/?s=' + escape(filename), function (error, response, body) {
                if (!error && response.statusCode == 200) {

                    var obj = JSON.parse(body);

                    // First game found
                    var game = obj.Search[0];

                    console.log("Find '" + game.Title + "' game !");

                    collection_db.findOne({Title: game.Title}, function (err, newDoc) {
                        if (!err) {
                            console.log(newDoc);
                            if (newDoc) {
                                console.log("Game already in collection, updating the game info...");
                                collection_db.update({Title: newDoc.Title}, game, {}, function (err, newDoc) {
                                    if (!err)
                                        res.json({message: "OK"});
                                });

                            } else {
                                console.log("Game added to collection !");
                                collection_db.insert(game, function (err, newDoc) {
                                    if (!err)
                                        res.json({message: "OK"});
                                });
                            }
                        }
                    });
                }
            });
        }
    }
});

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
    for (var i in files) {
        if (!files.hasOwnProperty(i)) continue;
        var name = dir + '/' + files[i];
        if (fs.statSync(name).isDirectory()) {
            getFiles(name, files_);
        } else {
            files_.push(name);
        }
    }
    return files_;
}