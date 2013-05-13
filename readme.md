Phuse Activity Monitor (PAM) v.2.0
====================================

##Setup: 
- `npm install`
- `node app.js`
- create a config.json file (see below)
- open at localhost:1234

##config.json
Get creds from password archive or ask James

    {
      "username" : //james' username,
      "password" : //james' password
    }

##Things: 
- Node.js with Express.js in the back
- Backbone.js in the front
- Use express routing to map harvest api
- consume data from said routes in Backbone 

##It's a big mess and there are problems but I KNOW

##To do
- authentication
- huge refactor (frontend first)
- make backend routing a bit more sane
- add auto-refresh (every 1 min? 2 mins?)
- add total stats for whole team
- set up secure way to store config info (env vars probably)
- see what happens with heroku
- design and styling and stuff

