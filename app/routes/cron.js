var search_cron = require('../../app/crons/search.js');
var PythonShell = require('python-shell');
var winston = require('winston');

var options = {
    mode: 'text',
    //pythonPath: './app/python',
    pythonOptions: ['-u'],
    scriptPath: './app/python',
    args: ['value1', 'value2', 'value3']
};

app.get("/cron/search", function (req, res) {

    PythonShell.run('restart.py', options, function (err, results) {
        if (err)
            console.error(err);

        // Results is an array consisting of messages collected during execution
        winston.info('results: %j', results);
    });
});
