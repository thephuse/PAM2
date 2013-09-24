var express = require("express");
var app = express();
var request = require('request');
var path = require('path');
var fs = require("fs");
var passport = require('passport');

app.use(express.logger());

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.session({ secret: 'keyboard cat' }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

if (process.env.NODE_ENV === 'production') {
  var harvestUsername = process.env.HARVEST_USERNAME;
  var harvestPassword = process.env.HARVEST_PASSWORD;
  var rootUrl = 'http://pam.thephuse.com/';
  var harvestCID = 'IZ/QNmA6y4+9qWirCgJ01g==';
  var harvestSecret = 'rC3Rtf3ZXiTQYP47BqGVdGT0dtpAvs17sNrYup6NcnLmADRDFiYG9PFY77VKuR/7nSTtnbgcwBXneUjbkIOfow==';
} else {
  var appConfig = JSON.parse(fs.readFileSync("config.json"));
  var harvestUsername = appConfig.username;
  var harvestPassword = appConfig.password;
  var rootUrl = 'http://127.0.0.1:1234/';
  var harvestCID = '75B7rnyuX1RYshk54trLiw==';
  var harvestSecret = '8EYB1TV6goSe15JMB3mPrdxzwSu4EYastoqXnli+ydbVhSDYOtDPhhKa+rWeTiUS+7SI3Sv6SAND6fYVQoLshA==';
}

app.use(function staticsPlaceholder(req, res, next) {
  return next();
});

var OAuth2Strategy = require('passport-oauth').OAuth2Strategy;

passport.use('harvest', new OAuth2Strategy({
  authorizationURL: 'https://thephuse.harvestapp.com/oauth2/authorize',
  tokenURL: 'https://thephuse.harvestapp.com/oauth2/authorize',
  clientID: harvestCID,
  clientSecret: harvestSecret,
  callbackURL: rootUrl + 'auth/harvest/callback'
},function(accessToken, refreshToken, profile, done) {
  return done(null, profile);
}));

var headers = {
  'Authorization': 'Basic ' + new Buffer(harvestUsername + ':' + harvestPassword).toString('base64'),
  'Content-Type': 'application/xml',
  'Accept': 'application/xml'
};

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

app.get('/auth/harvest', passport.authenticate('harvest'));

app.get('/auth/harvest/callback',
  passport.authenticate('harvest', {
    successRedirect: '/',
    failureRedirect: '/login'
  })
);

app.get('/', ensureAuthenticated, function(req,res){
  if (process.env.NODE_ENV === 'production') {
    res.sendfile('dist/index.html');
  } else {
    res.sendfile('index.html')
  }
});

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.get('/users', ensureAuthenticated, function(req, res) {
  request.get('https://thephuse.harvestapp.com/people/', {
    headers: headers
  },function(error, response, body){
    res.send(body);
  });
});

// this route sucks but haven't figured out how to do query string routes
app.get('/users/:id/billable/:start/:end', ensureAuthenticated, function(req, res) {
  request.get('https://thephuse.harvestapp.com/people/' + req.params.id + '/entries?from=' + req.params.start + '&to=' + req.params.end + '&billable=yes', {
    headers: headers
  }, function(error, response, body){
    res.send(body);
    if (error) {
      console.log(error);
    }
  })
});

app.get('/users/:id/:start/:end', ensureAuthenticated, function(req, res) {
  request.get('https://thephuse.harvestapp.com/people/' + req.params.id + '/entries?from=' + req.params.start + '&to=' + req.params.end, {
    headers: headers
  }, function(error, response, body){
    res.send(body);
  })
});

app.get('/daily/:id', ensureAuthenticated, function(req,res) {
  request.get('https://thephuse.harvestapp.com/daily?of_user=' + req.params.id, {
    headers: headers
  }, function(error, response, body) {
    res.send(body);
  })
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/auth/harvest');
}

app.use(function middlewarePlaceholder(req, res, next) {
  return next();
});

var port = process.env.PORT || 1234;
app.listen(port, function() {
  console.log("Listening on " + port);
});

module.exports = app;