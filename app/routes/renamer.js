var fs = require('fs');
var ini = require('ini');
var request = require('request');
var mkdirp = require('mkdirp');
var winston = require('winston');

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
        winston.info('Renamer - Scan ended !')
        res.send();
    });
});

// Recursive rename
function recursiveRename(i, config, files, callback) {
    if (i < files.length) {

        var file = files[i];

        // Detect .iso file
        //var regex = /.*\.((iso)$)/;

        // Detect a file ended by .iso
        //if (file.match(regex)) {


        //---------------------------------------------------------------------
        //----           CLEAN THE GAME NAME AND EXTRACT DATA              ----
        //---------------------------------------------------------------------

        // Extract filename
        var filename = file.split(/(\\|\/)/g).pop();

        // Extract "PC"
        var filename = file.split(/(PC)/g).pop();

        // Detect potential crack
        // Crackfix
        var crack = /(crack)/i.exec(filename);
        if (crack) {
            crack = crack[1];
            winston.info("Renamer - With crack");
        }

        // Detect potential repack
        // RePack
        var repack = /(repack)/i.exec(filename);
        if (repack) {
            repack = repack[1];
            winston.info("Renamer - This is a repack");
        }

        // Detect potential multilangue
        // MULTi
        var multi = /(multi)/i.exec(filename);
        if (multi) {
            multi = multi[1];
            winston.info("Renamer - Multilangue");
        }

        // Detect potential version
        // 1.20.14
        var version = /(\d+[[\.\d+]+]*)/.exec(filename);
        if (version) {
            version = version[1];
            winston.info("Renamer - Version : " + version);
        }

        // Detect potential release date
        // (yyyy)
        var releaseDate = /(\d{4})/.exec(filename);
        if (releaseDate) {
            releaseDate = releaseDate[1];
            winston.info("Renamer - Release date : " + releaseDate);
        }

        // Detect potential language
        // [ENG]
        var language = /\[([A-Z]{3})\]/.exec(filename);
        if (language) {
            language = language[1];
            winston.info("Renamer - Langague : " + language);
        }

        // Detect potential team
        // -CODEX
        var team = /-(CODEX|RELOADED|FTL|R.G.Mechanics|P2P|Razor1911|SKIDROW|STEAMGAMES|GoG|XaTaB|HI2U|PROPHET|WWW|TiNYiSO|TeRM!NaToR|AnCiENT)/.exec(filename);
        if (team) {
            team = team[1];
            winston.info("Renamer - Team : " + team);
        } else {
            team = /-(\^\^nosTEAM\^\^)/.exec(filename);
            if (team) {
                team = team[1];
                winston.info("Renamer - Team : " + team);
            }
        }


        // Delete dot
        filename = filename.split('.').reverse().pop();

        winston.info("Renamer - Potential video game file : " + filename);

        // Search current video game on Datagamer
        request('http://localhost:' + config.general.port + '/datagamer/games/similar/' + filename, {
            headers: {
                "apiKey": config.search.datagamer.apikey
            }
        }, function (error, response, body) {
            if (!error && response.statusCode == 200) {

                var result = JSON.parse(body);

                if (result.code == 200) {
                    //winston.info('Renamer - Game found on Datagamer : ');

                    var bestGame = {};
                    bestGame.percentage = 0;

                    for (var j = 0; j < result.games.length; j++) {

                        //winston.info('Renamer --- ' + result.games[j].name + ' - ' + result.games[j].percentage);

                        if (result.games[j].percentage > bestGame.percentage) {
                            bestGame = result.games[j];
                        }
                    }

                    // Take highest score and rename the file
                    winston.info('Renamer - Highest similar game found : ' + bestGame.name);

                    // WINDOWS FIX, TO DELETE FOR UNIX USERS
                    //bestGame.name.replace(/:/,' ');

                    var directory = config.renamer.to + '/' + bestGame.name + ' (' + new Date(bestGame.releaseDate).getFullYear() + ')';
                    winston.info('Renamer - Try to create : ' + directory);

                    try {
                        fs.mkdir(directory, 0777, function (err) {
                            if (err)
                                console.error(err);
                        });
                    } catch (e) {
                        if (e.code != 'EEXIST') console.error(e);
                    }
                    recursiveRename(i + 1, config, files, callback);
                } else {
                    console.error('Renamer - No game found on Datagamer for : ' + filename);
                    recursiveRename(i + 1, config, files, callback);
                }
            }
        });
        //} else {
        //    //winston.info('Collection - ' + file + ' is not an .iso, next !');
        //    recursiveRename(i + 1, config, files, callback);
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