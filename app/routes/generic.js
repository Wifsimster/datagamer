var fs = require('fs');
var path = require('path');
var ini = require('ini');
var winston = require('winston');

var CODE = require('../../app/enums/codes');

//------------------------------------------
//----              PAGES               ----
//------------------------------------------
app.get('/partials/:partialPath', function (req, res) {
    res.render('partials/' + req.params.partialPath);
});

app.get('/', function (req, res) {
    res.render('layout', {
        title: 'Datagamer'
    });
});

app.get('/wanted', function (req, res) {
    res.render('layout', {
        title: 'Datagamer'
    });
})
app.get('/collection', function (req, res) {
    res.render('layout', {
        title: 'Datagamer'
    });
})
app.get('/settings', function (req, res) {
    res.render('layout', {
        title: 'Datagamer'
    });
});

//------------------------------------------
//----              CONFIG              ----
//------------------------------------------
app.get("/config", function (req, res) {
    var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));
    res.send(config);
});

app.put("/config", function (req, res) {
    var config = req.body;

    // Write in config.ini file
    fs.writeFileSync('./config.ini', ini.stringify(config));
    res.json({message: "OK"});
});

// Get first level of directories in the path
app.get("/directories/", function (req, res) {

    var srcpath = req.param('path');

    console.log('Search directories for : ' + srcpath);

    // Get directories
    var directories = getDirectories(srcpath);
    var json_directories = [];

    // Build JSON directories array
    if (directories) {
        for (var i = 0; i < directories.length; i++) {

            console.log('Search children for directory : ' + directories[i]);

            // If children
            var has_children = getChildren(srcpath + '/' + directories[i]);

            //console.log('-- Get directories for ' + directories[i] + ' : ' + has_children);
            //console.log(json_directories);

            if (has_children && has_children.length > 0) {
                console.log('-- ' + directories[i] + ' has children');
                json_directories.push({name: directories[i], rel_path: srcpath + '/' + directories[i], children: [{}]});
            } else {
                console.log('-- ' + directories[i] + ' don\'t have children');
                json_directories.push({name: directories[i], rel_path: srcpath + '/' + directories[i]});
            }
        }

    } else {
        console.error('No directory !');
    }

    //console.log(json_directories);
    CODE.SUCCESS.directories = json_directories;
    res.json(CODE.SUCCESS);
});

function getDirectories(srcpath) {
    try {
        return fs.readdirSync(srcpath).filter(function (file) {
            try {
                console.log("-- getDirectories for " + path.join(srcpath, file));
                return fs.statSync(path.join(srcpath, file)).isDirectory();
            } catch (err) {
                console.error(err);
            }
        });
    } catch (err) {
        console.error(err);
    }
}

function getChildren(srcpath) {
    try {
        return fs.readdirSync(srcpath).filter(function (file) {
            try {
                //console.log("-- getchildren for " + path.join(srcpath, file));
                return fs.statSync(path.join(srcpath, file)).isDirectory();
            } catch (err) {
                console.error(err);
            }
        });
    } catch (err) {
        console.error(err);
    }
}