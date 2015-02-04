var fs = require('fs');
var ini = require('ini');

// Nedb - Embedded database package
var Datastore = require('nedb');
var collection_db = new Datastore({filename: 'collection.nedb', autoload: true});


app.get("/collection/games/scan", function (req, res) {

    var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));

    console.log(config.collection.directory);

    var files = getFiles(config.collection.directory);

    for(var i = 0 ; i < files.length ; i++) {

        var regex = /.*\.((iso)$)/;

        //console.log(files[i]);

        // Detect a file ended by .iso
        if(files[i].match(regex)) {
            console.log(files[i]);
        }
    }


    res.send(files);
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
function getFiles(dir,files_){
    files_ = files_ || [];
    if (typeof files_ === 'undefined') files_=[];
    var files = fs.readdirSync(dir);
    for(var i in files){
        if (!files.hasOwnProperty(i)) continue;
        var name = dir+'/'+files[i];
        if (fs.statSync(name).isDirectory()){
            getFiles(name,files_);
        } else {
            files_.push(name);
        }
    }
    return files_;
}