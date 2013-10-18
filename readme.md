Phuse Activity Monitor (PAM) v.2.0
====================================

###Setup:
- `npm install`
- create a config.json file (see below)
- `node server`
- `grunt watch`
- open at http://127.0.0.1/1234

###config.json
Required to run locally (uses env vars on heroku). Get creds from password archive or ask James.

    {
      "username" : //james' username,
      "password" : //james' password
    }

###Deployment

- get yourself added as contributor
- `git@heroku.com:phusepam2.git`
- `grunt`
- `git push heroku master && heroku ps:scale web=1`
- `heroku open` or go to [phusepam2.herokuapp.com](http://phusepam2.herokuapp.com/)

###Tech:
- Node.js (with Express.js) in the back
- Backbone.js in the front
- Use express routing to map harvest api
- consume data from said routes in Backbone