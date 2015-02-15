var fs = require('fs');
var ini = require('ini');
var request = require('request');

// Nedb - Embedded database package
var Datastore = require('nedb');
var collection_db = new Datastore({filename: 'collection.nedb', autoload: true});


app.get("/collection/games/scan", function (req, res) {

    var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));

    // TODO : Need to detect network or not

    console.log("\\" + config.collection.directory);

    var files = getFiles("\\" + config.collection.directory);

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

            request('http://192.168.0.21:8084/api/games/by/name/' + escape(filename), {
                    headers: {
                        "apiKey": "b3dae6c0-83a0-4721-9901-bf0ee7011af8"
                    }
                }, function (error, response, body) {
                    if (!error && response.statusCode == 200) {

                        var obj = JSON.parse(body);

                        if (obj.games.length > 0) {

                            // First game found
                            var game = obj.games[0];

                            console.log(obj);
                            console.log(game);

                            console.log("Find '" + game.name + "' game !");

                            collection_db.findOne({name: game.name}, function (err, newDoc) {
                                if (!err) {
                                    console.log(newDoc);
                                    if (newDoc) {
                                        console.log("Game already in collection, updating the game info...");
                                        collection_db.update({name: newDoc.name}, game, {}, function (err, newDoc) {
                                            if (!err)
                                                res.json({message: "OK"});
                                        });

                                    } else {
                                        console.log("Game added to collection !");

                                        // Set the game as downloaded
                                        game.downloaded = true;

                                        collection_db.insert(game, function (err, newDoc) {
                                            if (!err)
                                                res.json({message: "OK"});
                                        });
                                    }
                                }
                            });
                        } else {
                            console.log("No game found with this name in Datagamer !");

                            // If no game found with a potential game, added it to Datagamer through the Metacritic API.

                        }
                    }
                }
            )
            ;
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