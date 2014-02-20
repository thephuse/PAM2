var express = require("express");
var app = express();
var request = require('request');
var path = require('path');
var fs = require("fs");
var passport = require('passport');

app.use(express.logger());

/* Grab all the sensitive information either from environment variables, if we're on Heroku, 
 * or from the config.json file.
 */
if (process.env.NODE_ENV === 'production') {
  var harvestUsername = process.env.HARVEST_USERNAME;
  var harvestPassword = process.env.HARVEST_PASSWORD;
  var rootUrl = process.env.ROOT_URL;
  var harvestCID = process.env.HARVEST_CLIENTID;
  var harvestSecret = process.env.HARVEST_SECRET;
  var secretSessionCookie = process.env.SECRET_SESSION;
  var harvestWebAddress = process.env.HARVEST_WEBADDRESS;
} else {
  var appConfig = JSON.parse(fs.readFileSync("config.json"));
  var harvestUsername = appConfig.harvest_username;
  var harvestPassword = appConfig.harvest_password;
  var rootUrl = appConfig.local_rooturl;
  var harvestCID = appConfig.local_harvest_clientid;
  var harvestSecret = appConfig.local_harvest_clientsecret;
  var secretSessionCookie = appConfig.secret_session;
  var harvestWebAddress = appConfig.harvest_webaddress;
}

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.session({ secret: secretSessionCookie, cookie: { maxAge: 3600 * 24 * 30 * 1000 } }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.use(function staticsPlaceholder(req, res, next) {
  return next();
});

var OAuth2Strategy = require('passport-oauth').OAuth2Strategy;

passport.use('harvest', new OAuth2Strategy({
  authorizationURL: harvest_webaddress + 'oauth2/authorize',
  tokenURL: harvest_webaddress + 'oauth2/authorize',
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
  request.get(harvest_webaddress + 'people/', {
    headers: headers
  },function(error, response, body){
    res.send(body);
  });
});

// this route sucks but haven't figured out how to do query string routes
app.get('/users/:id/billable/:start/:end', ensureAuthenticated, function(req, res) {
  request.get(harvest_webaddress + 'people/' + req.params.id + '/entries?from=' + req.params.start + '&to=' + req.params.end + '&billable=yes', {
    headers: headers
  }, function(error, response, body){
    res.send(body);
    if (error) {
      console.log(error);
    }
  })
});

app.get('/users/:id/:start/:end', ensureAuthenticated, function(req, res) {
  request.get(harvest_webaddress + 'people/' + req.params.id + '/entries?from=' + req.params.start + '&to=' + req.params.end, {
    headers: headers
  }, function(error, response, body){
    res.send(body);
  })
});

app.get('/daily/:id', ensureAuthenticated, function(req,res) {
  request.get(harvest_webaddress + '/daily?of_user=' + req.params.id, {
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