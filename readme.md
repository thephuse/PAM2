Phuse Activity Monitor (PAM) v.2.0
====================================

###Setup:
- `npm install && bower install`
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

###To do
####Features
- ~~authentication~~
- ~~add auto-refresh (every 1 min? 2 mins?)~~
- ~~add total stats for whole team~~
- Navigate through past days/weeks/months

####Other
- ~~some sort of build system to automate sass compilation etc~~.
- ~~figure out how to deal with static assets~~
- ~~get rid of CDN scripts, use package manager for front-end maybe~~
- ~~figure out how to split js into multiple files~~
- design and styling and stuff
- ~~set up secure way to store config info (env vars probably)~~
- ~~see what happens with heroku~~
- Move domain to pam.thephuse.com
- add front end tests

