var fs = require('fs');
var ini = require('ini');
var request = require('request');

// Nedb - Embedded database package
var Datastore = require('nedb');
var collection_db = new Datastore('collection.nedb');

app.get("/collection/games/scan", function (req, res) {

    collection_db.loadDatabase();
    var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));

    // TODO : Need to detect network or not

    console.log("Collection - Scan \\" + config.collection.directory);

    var files = getFiles("\\" + config.collection.directory);

    addGamesRecursive(0, config, files, function () {
        console.log('Scan ended !')
        res.send();
    });

});

// Recursive loop with callback to process correctly each filename
function addGamesRecursive(i, config, files, callback) {
    if (i < files.length) {

        var file = files[i];

        var regex = /.*\.((iso)$)/;

        // Detect a file ended by .iso
        if (file.match(regex)) {
            console.log("Collection - Potential video game file : " + file);

            // Extract filename (no path, no format, no dot)
            var filename = file.split(/(\\|\/)/g).pop();
            filename = filename.split('.').reverse().pop();

            var game = {};
            game.name = filename;

            collection_db.findOne({name: filename}, function (err, result) {

                if (!err) {
                    if (result) {
                        console.log('Collection - ' + result.name + ' already exist !');
                        addGamesRecursive(i + 1, config, files, callback);
                    } else {
                        // First of all add the game in the collection db
                        collection_db.insert(game, function (err, newDoc) {
                            if (!err) {
                                console.log("Collection - Add " + filename + " to collection database !");
                                console.log("Collection - Searching a game for : " + filename);

                                // Search current video game on Datagamer
                                request('http://localhost:' + config.general.port + '/datagamer/search/' + filename, {
                                        headers: {
                                            "apiKey": config.search.datagamer.apikey
                                        }
                                    }, function (error, response, body) {
                                        if (!error && response.statusCode == 200) {

                                            var result = JSON.parse(body);

                                            if (result.code == 200) {

                                                // First game found
                                                var game = result.games[0];

                                                console.log("Collection - Find '" + game.name + "' game !");

                                                collection_db.findOne({name: game.name}, function (err, newDoc) {
                                                    if (!err) {
                                                        if (newDoc) {
                                                            console.log("Collection - Game already in collection, updating the game info...");
                                                            collection_db.update({name: newDoc.name}, game, {}, function (err, newDoc) {
                                                                //if (!err)
                                                                //res.json({message: "OK"});
                                                            });
                                                        } else {
                                                            console.log("Collection - Game added to collection !");

                                                            // Set the game as downloaded
                                                            game.downloaded = true;

                                                            collection_db.insert(game, function (err, newDoc) {
                                                                //if (!err)
                                                                //res.json({message: "OK"});
                                                            });
                                                        }
                                                    } else {
                                                        console.error(err);
                                                        addGamesRecursive(i + 1, config, files, callback);
                                                    }
                                                });
                                            } else {
                                                console.info("Collection - " + filename + " not found in Datagamer database !");
                                                console.info("Collection - Need to propose a near game names...");

                                                addGamesRecursive(i + 1, config, files, callback);
                                            }
                                        } else {
                                            console.error("Collection - " + error);
                                            addGamesRecursive(i + 1, config, files, callback);
                                        }
                                    }
                                );
                            } else {
                                console.error(err);
                                addGamesRecursive(i + 1, config, files, callback);
                            }
                        });
                    }
                } else {
                    console.error(err);
                    addGamesRecursive(i + 1, config, files, callback);
                }
            });
        } else {
            //console.log('Collection - ' + file + ' is not an .iso, next !');
            addGamesRecursive(i + 1, config, files, callback);
        }
    } else {
        callback();
    }
}

app.get("/collection/games", function (req, res) {
    collection_db.loadDatabase();
    //console.log("Getting collection video games...");
    collection_db.find({}, function (err, games) {
        res.send(games)
    });
});

app.post("/collection/games", function (req, res) {
    collection_db.loadDatabase();
    //console.log(req.body);
    collection_db.insert(req.body, function (err, newDoc) {
        if (!err)
            res.json({message: "OK"});
    });
});

app.put("/collection/games", function (req, res) {
    collection_db.loadDatabase();
    //console.log(req.body._id);
    collection_db.update({_id: req.body._id}, req.body, function (err, newDoc) {
        if (!err)
            res.json({message: "OK"});
    });
});

app.delete("/collection/games/:id", function (req, res) {
    collection_db.loadDatabase();
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
        console.error(err);
    }
    return files_;
}