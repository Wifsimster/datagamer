var sys = require('sys');
var exec = require('child_process').exec;
var github = require('octonode');
var winston = require('winston');

var CODE = require('../../app/enums/codes');

app.get("/update/app", function (req, res) {

    winston.info('Updating datagamer...');

    function puts(error, stdout, stderr) {
        sys.puts(stdout)
    }

    exec("update.sh", puts);
});

app.get("/update/last/commit", function (req, res) {

    console.log('Accessing GIT...');

    var client = github.client();
    var ghrepo = client.repo('Wifsimster/datagamer');

    ghrepo.info(function (err, data, headers) {
        if (!err) {
            winston.info('Last update : ' + data.updated_at);

            CODE.SUCCESS.lastCommit = new Date(data.updated_at);
            res.json(CODE.SUCCESS);
        } else {
            winston.error(err);
            res.json(CODE.SERVER_ERROR);
        }
    });
});