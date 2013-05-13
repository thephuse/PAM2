var express = require("express");
var app = express();
var request = require('request');
var fs = require("fs");
app.use(express.logger());

app.configure(function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.use(express.methodOverride());
  app.use(app.router);
});

var appConfig = JSON.parse(fs.readFileSync("config.json"));

var headers = {
  'Authorization': 'Basic ' + new Buffer(process.env.HARVEST_USERNAME + ':' + process.env.HARVEST_PASSWORD).toString('base64'),
  'Content-Type': 'application/xml',
  'Accept': 'application/xml'
};

app.get('/', function(req,res){
  res.sendfile('index.html');
});


app.get('/users', function(req, res) {
  request.get('https://thephuse.harvestapp.com/people/', {
    headers: headers
  },function(error, response, body){
    res.send(body);
  });
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

app.get('/users/:id/:start/:end', function(req, res) {
  request.get('https://thephuse.harvestapp.com/people/' + req.params.id + '/entries?from=' + req.params.start + '&to=' + req.params.end, {
    headers: headers
  }, function(error, response, body){
    res.send(body);
  })
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});