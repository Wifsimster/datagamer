var fs = require('fs')
var fse = require('fs-extra')
var ini = require('ini');
var request = require('request');
var mkdirp = require('mkdirp');
var winston = require('winston');
var path = require('path');
var unzip = require('unzip');

var CODE = require('../../app/enums/codes');

// Nedb - Embedded database package
var Datastore = require('nedb');
var collection_db = new Datastore('collection.nedb');

// Renamer - Post-processing downloaded video games
app.get("/renamer/games/postprocessing", function (req, res) {

    collection_db.loadDatabase();
    var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));

    winston.info("Renamer - Post-processing " + config.renamer.from);

    var files = getDirectories(config.renamer.from);

    recursiveRename(0, config, files, function () {
        winston.info('Renamer - Post-processing ended !');
        res.json(CODE.SUCCESS_POST);
    });
});

// Renamer - Scan for new video games on collection directory
app.get("/renamer/games/scan", function (req, res) {

    collection_db.loadDatabase();
    var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));

    winston.info("Renamer - Scan " + config.renamer.from);

    var files = getDirectories(config.collection.directory);

    recursiveScan(0, config, files, function () {
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

    winston.info("Renamer --- Filename after cleaning : " + filename);

    // Detect potential crack
    // Crackfix
    var crack_regex = /(crack)/i;
    var crack = crack_regex.exec(filename);
    if (crack) {
        game.crack = true;
        winston.info("Renamer --- With crack");
        filename = filename.replace(crack_regex, '');
        //winston.info("Renamer --- Filename after crack : " + filename);
    }

    // Detect potential repack
    // RePack
    var repack_regex = /(repack)/i;
    var repack = repack_regex.exec(filename);
    if (repack) {
        game.repack = true;
        winston.info("Renamer --- This is a repack");
        filename = filename.replace(repack_regex, '');
        //winston.info("Renamer --- Filename after repack : " + filename);
    }

    // Detect potential team before release date 'cz Razor1911 and before language
    // -CODEX
    var team_regex = /(GOG|CODEX|RELOADED|FLT|R.G.Mechanics|RG Mechanics|P2P|Razor1911|SKIDROW|STEAMGAMES|GoG|XaTaB|HI2U|PROPHET|WWW|TiNYiSO|TeRM!NaToR|AnCiENT|\^\^nosTEAM\^\^|TeamExtremeMc\.com|TeRMiNaToR|TeRM!NaToR|RG Mechanics|blaze69)/;

    var team = team_regex.exec(filename);
    if (team) {
        team = team[1];
        game.team = team;
        winston.info("Renamer --- Team : " + team);
        filename = filename.replace(team_regex, '');
    }

    // Detect potential multilangue
    // MULTi
    var multi_regex = /(multi)/i;
    var multi = multi_regex.exec(filename);
    if (multi) {
        game.multi = true;
        winston.info("Renamer --- Multilangue");
        filename = filename.replace(multi_regex, '');
        //winston.info("Renamer --- Filename after multi : " + filename);
    } else {
        // Detect potential language only if not multilanguage
        // [ENG]
        var language = /[\[\(]([A-Z]{3})*[\]\)]/.exec(filename);
        if (language) {
            language = language[1];
            game.language = language;
            winston.info("Renamer --- Langague : " + language);
            filename = filename.replace(/[\[\(]([A-Z]{3})*[\]\)]/, '');
            //winston.info("Renamer --- Filename after language : " + filename);
        }
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
    var version_regex = /(\d+\.[\.\d+]*)/;
    var version = version_regex.exec(filename);
    if (version) {
        version = version[1];
        game.version = version;
        winston.info("Renamer --- Version : " + version);
        filename = filename.replace(version_regex, '');
        //winston.info("Renamer --- Filename after version : " + filename);
    }

    // Remplace dot by whitespace after detection
    filename = filename.replace(/\./g, ' ');

    // Delete v after version detection
    //filename = filename.replace(/\s[vV]\s/, '');

    // Delete extra info after -
    // -R.G
    filename = filename.replace(/(-[\a-zA-Z\s]{0,})/, '');

    // Delete extra info after +
    // +AutoUpdate
    filename = filename.replace(/(\+[a-zA-Z]{0,})/g, '');

    // Delete "(*)" after detection
    filename = filename.replace(/\([A-Za-z,\s]{0,}\)/g, '');

    // Delete "[*]" after detection
    filename = filename.replace(/\[[A-Za-z,\s]{0,}\]/g, '');

    // Delete "{*}" after detection
    filename = filename.replace(/\{[A-Za-z,\s]{0,}\}/g, '');

    // Delete every useless whitespace
    filename = filename.replace(/(\s{2,})/, '');

    // Delete useless spaces
    filename = filename.trim();

    winston.info("Renamer - Clean up : " + filename);

    // Set cleanup name
    game.name = filename;

    return game;
}

// Recursive rename
function recursiveRename(i, config, files, callback) {
    if (i < files.length) {

        var file = files[i];

        collection_db.loadDatabase();
        var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));

        var game = extractInfoFromName(file)

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

                        // Move and rename game directory only if the game percentage is 95% or more
                        if (game.percentage >= 95) {
                            collection_db.find({name: game.name}, function (err, doc) {
                                if (!err) {
                                    // If no game with this name exist in collection database
                                    if (doc.length == 0) {

                                        //var oldDirectory = config.renamer.from + '/' + game.name;
                                        var oldDirectory = file + "/";

                                        // Need to replace : caractere by " -" for Windows
                                        var gameName = game.name.replace(/(:)/g, ' -');

                                        var newDirectory = config.renamer.to + '/' + gameName + ' (' + new Date(game.releaseDate).getFullYear() + ')';
                                        winston.info('Renamer --- Try to move "' + oldDirectory + '" to "' + newDirectory + '"');

                                        var options = [];
                                        if (config.renamer.overwrite) {
                                            options.clobber = true;
                                        }

                                        // Move game directory
                                        fse.move(oldDirectory, newDirectory, options, function (err) {
                                            if (err) {
                                                winston.error(err);
                                                recursiveRename(i + 1, config, files, callback);
                                            } else {
                                                winston.info(game.name + "moved to " + newDirectory + ' !');

                                                // Add this new game to the collection database
                                                collection_db.insert(game, function (err) {
                                                    if (!err) {
                                                        winston.info('Renamer - ' + game.name + ' added to collection !');
                                                        recursiveRename(i + 1, config, files, callback);
                                                    } else {
                                                        winston.error(err);
                                                        callback();
                                                    }
                                                });
                                            }
                                        });
                                    } else {
                                        winston.info('Renamer - ' + game.name + ' already exist in collection database !');
                                        recursiveRename(i + 1, config, files, callback);
                                    }
                                } else {
                                    winston.error(err);
                                    callback();
                                }
                            });
                        } else {
                            winston.info('Renamer - ' + game.name + ' percentage (' + game.percentage + ') is not high enought to be moved !');
                            recursiveRename(i + 1, config, files, callback);
                        }
                    } else {
                        // No game found, parse next one...
                        recursiveRename(i + 1, config, files, callback);
                    }
                } else {
                    callback();
                }
            } else {
                callback();
            }
        });
    } else {
        callback();
    }
}

function recursiveScan(i, config, files, callback) {
    if (i < files.length) {

        var file = files[i];

        collection_db.loadDatabase();
        var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));

        var game = extractInfoFromName(file)

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

                        collection_db.find({name: game.name}, function (err, doc) {
                            if (!err) {
                                // If no game with this name exist in collection database
                                if (doc.length == 0) {
                                    // Add this new game to the collection database
                                    collection_db.insert(game, function (err) {
                                        if (!err) {
                                            winston.info('Renamer - ' + game.name + ' added to collection !');
                                            recursiveRename(i + 1, config, files, callback);
                                        } else {
                                            winston.error(err);
                                            callback();
                                        }
                                    });
                                } else {
                                    winston.info('Renamer - ' + game.name + ' already exist in collection database !');
                                    recursiveRename(i + 1, config, files, callback);
                                }
                            } else {
                                winston.error(err);
                                callback();
                            }
                        });
                    } else {
                        callback();
                    }
                } else {
                    callback();
                }
            } else {
                callback();
            }
        });
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
        winston.error(err);
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

    var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));

    files_ = files_ || [];
    if (typeof files_ === 'undefined') files_ = [];

    try {
        var files = fs.readdirSync(dir);
        for (var i in files) {
            if (!files.hasOwnProperty(i)) continue;
            var name = dir + '/' + files[i];
            if (fs.statSync(name).isDirectory()) {
                files_.push(name);
            } else {
                // If this is a zip file and user want to unzip it
                if (config.renamer.unzip && name.match(/.*\.zip$/)) {
                    // Extract zip file
                    winston.info('Unzip ' + name + ' to : ' + dir);
                    fs.createReadStream(name).pipe(unzip.Extract({path: dir + '/'}));

                    // Delete zip file
                    fs.unlink(name, function (err) {
                        if (!err) {
                            winston.info('Delete ' + name);
                        } else {
                            throw err;
                        }
                    });
                }
            }
        }
    } catch (err) {
        winston.error(err);
    }
    return files_;
}