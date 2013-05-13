Phuse Activity Monitor (PAM) v.2.0
====================================

##Setup: 
- 'npm install'
- 'node app.js'
- create a config.json file (see below)
- open at localhost/1234

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
This is my first backbone thing and all the code is in one place cause node and it's not very DRY. 

##To do
- fix day filter
- sort out the whole billable/nonbillable nightmare (must make one API call for each `>_<`)
- huge refactor (frontend first, backend isn't *that* bad)
- add total stats for whole team

