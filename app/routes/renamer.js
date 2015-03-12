var fs = require('fs');
var ini = require('ini');
var request = require('request');
var mkdirp = require('mkdirp');
var winston = require('winston');

var CODE = require('../../app/enums/codes');

// Nedb - Embedded database package
var Datastore = require('nedb');
var collection_db = new Datastore('collection.nedb');

// Renamer - Post-processing downloaded video games
app.get("/renamer/games/postprocessing", function (req, res) {

    collection_db.loadDatabase();
    var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));

    // TODO : Need to detect network or not

    winston.info("Renamer - Scan \\" + config.renamer.from);

    var files = getDirectories("\\" + config.renamer.from);

    recursiveRename(0, config, files, function () {
        winston.info('Renamer - Scan ended !');
        res.json(CODE.SUCCESS_POST);
    });
});

// Parse torrent name from provider
app.get("/renamer/parse/:name", function (req, res) {
    CODE.SUCCESS.game = parseNameToGame(req.params.name);
    res.json(CODE.SUCCESS);
});

// Extract info from filename under Game object
function extractInfoFromName(name) {
    collection_db.loadDatabase();
    var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));

    var game = {};

    //---------------------------------------------------------------------
    //----           CLEAN THE GAME NAME AND EXTRACT DATA              ----
    //---------------------------------------------------------------------

    // Extract filename from path
    var filename = name.split(/(\\|\/)/g).pop();

    winston.info('Renamer --------------------------------------------');
    winston.info('Renamer - Original filename : ' + filename);

    // Delete " PC " from filename
    filename = filename.replace(/PC/g, '');

    // Delete " by " from filename
    filename = filename.replace(/by/g, '');

    // Replace "_" by escape
    filename = filename.replace(/_/g, ' ');

    // Detect potential crack
    // Crackfix
    var crack_regex = /(crack)/i;
    var crack = crack_regex.exec(filename);
    if (crack) {
        game.crack = true;
        winston.info("Renamer --- With crack");
        filename = filename.replace(crack_regex, '').pop();
        //winston.info("Renamer --- Filename after crack : " + filename);
    }

    // Detect potential repack
    // RePack
    var repack_regex = /(repack)/i;
    var repack = repack_regex.exec(filename);
    if (repack) {
        game.repack = true;
        winston.info("Renamer --- This is a repack");
        filename = filename.replace(repack_regex, '').pop();
        //winston.info("Renamer --- Filename after repack : " + filename);
    }

    // Detect potential multilangue
    // MULTi
    var multi_regex = /(multi)/i;
    var multi = multi_regex.exec(filename);
    if (multi) {
        game.multi = true;
        winston.info("Renamer --- Multilangue");
        filename = filename.replace(multi_regex, '').pop();
        //winston.info("Renamer --- Filename after multi : " + filename);
    }

    // Detect potential release date
    // (yyyy)
    // Do it before version detection
    var release_regex = /(\d{4})/;
    var releaseDate = release_regex.exec(filename);
    if (releaseDate) {
        releaseDate = releaseDate[1];
        game.releaseDate = releaseDate;
        winston.info("Renamer --- Release date : " + releaseDate);
        filename = filename.replace(release_regex, '');
        //winston.info("Renamer --- Filename after release date : " + filename);
    }

    // Detect potential version
    // 1.20.14
    var version_regex = /(\d+[[\.\d+]+]*)/;
    var version = version_regex.exec(filename);
    if (version) {
        version = version[1];
        game.version = version;
        winston.info("Renamer --- Version : " + version);
        filename = filename.replace(version_regex, '');
        //winston.info("Renamer --- Filename after version : " + filename);
    }

    // Detect potential language
    // [ENG]
    var language = /\[([A-Z]{3})\]/.exec(filename);
    if (language) {
        language = language[1];
        game.language = language;
        winston.info("Renamer --- Langague : " + language);
        filename = filename.replace(/\[([A-Z]{3})\]/, '');
        //winston.info("Renamer --- Filename after language : " + filename);
    }

    // Detect potential team
    // -CODEX
    var team_regex_1 = /-(CODEX|RELOADED|FLT|R.G.Mechanics|P2P|Razor1911|SKIDROW|STEAMGAMES|GoG|XaTaB|HI2U|PROPHET|WWW|TiNYiSO|TeRM!NaToR|AnCiENT)/;
    var team_regex_2 = /(\^\^nosTEAM\^\^|TeamExtremeMc\.com|TeRMiNaToR|TeRM!NaToR)/;

    var team = team_regex_1.exec(filename);
    if (team) {
        team = team[1];
        winston.info("Renamer --- Team : " + team);
        filename = filename.replace(team_regex_1, '');
    } else {
        team = team_regex_2.exec(filename);
        if (team) {
            team = team[1];
            game.team = team;
            winston.info("Renamer --- Team : " + team);
            filename = filename.replace(team_regex_2, '');
        }
    }

    // Delete dots after version detection
    filename = filename.replace(/\./, ' ');

    // Delete "()" after release date detection
    filename = filename.replace(/\(\)/, '');

    // Delete useless spaces
    filename = filename.trim();

    // Set cleanup name
    game.name = filename;

    return game;
}

// Compile info from torrent file and Datagamer database
function parseNameToGame(filename) {
    collection_db.loadDatabase();
    var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));

    var game = extractInfoFromName(filename)

    winston.info("Renamer --- Searching for " + game.name + " on Datagamer...");

    // Search current video game on Datagamer
    request('http://localhost:' + config.general.port + '/datagamer/games/similar/' + game.name, {
        headers: {
            "apiKey": config.search.datagamer.apikey
        }
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {

            var result = JSON.parse(body);

            if (result.code == 200) {
                winston.info('Renamer --- Game found on Datagamer : ' + result.games.length);

                if (result.games.length > 0) {
                    var bestGame = {};
                    bestGame.percentage = 0;

                    for (var j = 0; j < result.games.length; j++) {

                        //winston.info('Renamer ----- ' + result.games[j].defaultTitle + ' - ' + result.games[j].percentage);

                        if (result.games[j].percentage > bestGame.percentage) {
                            bestGame = result.games[j];
                        }
                    }

                    // Take highest score and rename the file
                    winston.info('Renamer --- Highest similar game found : ' + bestGame.defaultTitle + ' - ' + bestGame.percentage);

                    // Info from Datagamer
                    game.datagamer_id = bestGame._id;
                    game.name = bestGame.defaultTitle;
                    game.overview = bestGame.overview;
                    game.percentage = bestGame.percentage;
                    game.media = {};
                    if (bestGame.media) {
                        game.media.thumbnails = bestGame.media.thumbnails;
                    }
                    game.platforms = bestGame.platforms;
                    game.genres = bestGame.genres;
                    game.developers = bestGame.developers;
                    game.editors = bestGame.editors;
                    game.score = bestGame.score;
                    if (bestGame.releaseDates) {
                        game.releaseDate = bestGame.releaseDates[0].date;
                    }

                    return game;
                }

                return null;
            }

            return null;
        }

        return null;
    });
}

// Recursive rename
function recursiveRename(i, config, files, callback) {
    if (i < files.length) {

        var file = files[i];

        var collectionGame = parseNameToGame(file);

        collection_db.find({name: collectionGame.name}, function (err, doc) {
            if (!err) {
                // If no game with this name exist in collection database
                if (doc.length == 0) {
                    // Add this new game to the collection database
                    collection_db.insert(collectionGame, function (err) {
                        if (err) {
                            winston.error(err);
                            callback();
                        } else {
                            winston.info('Collection game added !');
                            recursiveRename(i + 1, config, files, callback);
                        }
                    });
                } else {
                    winston.info(collectionGame.name + ' already exist in collection database !');
                    recursiveRename(i + 1, config, files, callback);
                }
            } else {
                winston.error(err);
                callback();
            }
        });

        // WINDOWS FIX, TO DELETE FOR UNIX USERS
        //bestGame.name.replace(/:/,' ');

        //var directory = config.renamer.to + '/' + collectionGame.name + ' (' + new Date(collectionGame.releaseDate).getFullYear() + ')';
        //winston.info('Renamer --- Try to create : ' + directory);

        //try {
        //    fs.mkdir(directory, 0777, function (err) {
        //        if (err)
        //            console.error(err);
        //    });
        //} catch (e) {
        //    if (e.code != 'EEXIST') console.error(e);
        //}
    } else {
        callback();
    }
}


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

/**
 * Return a list of directory
 * @param dir
 * @param files_
 * @returns {*|Array}
 */
function getDirectories(dir, files_) {
    files_ = files_ || [];
    if (typeof files_ === 'undefined') files_ = [];
    var files = fs.readdirSync(dir);

    try {
        for (var i in files) {
            if (!files.hasOwnProperty(i)) continue;
            var name = dir + '/' + files[i];
            if (fs.statSync(name).isDirectory()) {
                files_.push(name);
            } else {
                getFiles(name, files_);
            }
        }
    } catch (err) {
        console.error(err);
    }
    return files_;
}