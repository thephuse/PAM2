
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

// development only
if ('development' == app.get('env')) {
}
  app.use(express.errorHandler());

app.get('/', function(req,res){
  res.sendfile('index.html');
});

app.get('/users/:id/:start/:end', function(req, res) {
  request.get('https://thephuse.harvestapp.com/people/' + req.params.id + '/entries?from=' + req.params.start + '&to=' + req.params.end, {
    headers: headers
  }, function(error, response, body){
    res.send(body);
    if (error) {
      console.log(error);
    }
  })
});

app.get('/users/:id/billable/:start/:end', function(req, res) {
  request.get('https://thephuse.harvestapp.com/people/' + req.params.id + '/entries?from=' + req.params.start + '&to=' + req.params.end + '&billable=yes', {
    headers: headers
  }, function(error, response, body){
    res.send(body);
    if (error) {
      console.log(error);
    }
  })
});

app.get('/users', function(req, res){
  request.get('https://thephuse.harvestapp.com/people/', {
    headers: headers
  }, function(error, response, body) {
    res.send(body);
    if (error) {
      console.log(error);
    }
  })
});

app.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

