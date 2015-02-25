var sys = require('sys');
var exec = require('child_process').exec;
var github = require('octonode');
var winston = require('winston');
var fs = require('fs');
var ini = require('ini');

var CODE = require('../../app/enums/codes');

// Update the app with the related name release
app.get("/update/release/:name", function (req, res) {

    var releaseName = req.params.name;

    winston.info('Update - Updating Datagamer with ' + releaseName + ' release...');

    // Open conf file
    var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));

    // Change tag name with new release
    config.update.release = releaseName;

    // Write in config.ini file
    fs.writeFileSync('./config.ini', ini.stringify(config));

    res.send(CODE.SUCCESS);

    // Call update.sh script
    //function puts(error, stdout, stderr) {
    //    sys.puts(stdout)
    //}
    //
    //exec("update.sh", puts);
});

// Check if new release available
app.get("/update/available", function (req, res) {

    winston.info('Update - Checking if there is a new release available...');

    // Open conf file
    var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));

    var client = github.client();
    var ghrepo = client.repo('Wifsimster/datagamer');

    ghrepo.releases(function (err, data, headers) {
        if (!err) {
            // If release tag name is different, propose to update
            if (config.update.release != data[0].tag_name) {
                winston.info('Update - Update found !');
                CODE.SUCCESS.releases = data;
                res.json(CODE.SUCCESS);
            } else {
                winston.info('Update - No update found !');
                res.json(CODE.NOT_FOUND);
            }
        } else {
            winston.error(err);
            res.json(CODE.SERVER_ERROR);
        }
    });
});