// Packages
var express = require('express');
var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

// Configure
app.use(express.static(__dirname + '/public'));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));

var port = process.env.PORT || 8080;

app.get('/partials/:partialPath', function (req, res){
    res.render('partials/' + req.params.partialPath);
})

app.get('/', function (req, res) {
    res.render('layout', {
        title: 'Datagamer'
    });
});

// START THE SERVER
app.listen(port);
console.log('Datagamer is running on port ' + port);