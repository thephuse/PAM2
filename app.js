
/**
 * Module dependencies.
 */

var express = require('express'),  
    http = require('http'),
    path = require('path'),
    fs = require("fs");
    request = require('request');

var appConfig = JSON.parse(fs.readFileSync("config.json"));
var app = express();

var headers = {
  'Authorization': 'Basic ' + new Buffer(appConfig.username + ':' + appConfig.password).toString('base64'),
  'Content-Type': 'application/xml',
  'Accept': 'application/xml'
};



// all environments
app.set('port', process.env.PORT || 1234);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', function(req,res){
  res.sendfile('index.html');
});

app.get('/users/:id/:start/:end', function(req, res) {
  request.get('https://thephuse.harvestapp.com/people/' + req.params.id + '/entries?from=' + req.params.start + '&to=' + req.params.end, {
    headers: headers
  }, function(error, response, body){
    res.send(body);
  })
});

app.get('/users/:id/billable/:start/:end', function(req, res) {
  request.get('https://thephuse.harvestapp.com/people/' + req.params.id + '/entries?from=' + req.params.start + '&to=' + req.params.end + '&billable=yes', {
    headers: headers
  }, function(error, response, body){
    res.send(body);
  })
});

app.get('/users', function(req, res){
  request.get('https://thephuse.harvestapp.com/people/', {
    headers: headers
  }, function(error, response, body) {
    res.send(body);
  })
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

