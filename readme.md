Phuse Activity Monitor (PAM) v.2.0
====================================

The Phuse Activity Monitor is the beginning of our team dashboard. As a remote team, we were looking for a way to keep everyone connected. As an entirely remote agency, we use Harvest to track our hours, and PAM gives us a way to see the working status and current hour count for everyone on the team. 

![PAM at the Phuse](./pam_screenshot.png "PAM at the Phuse")

###Setup:
0. Install Node.js: http://nodejs.org/
1. Clone the GitHub repository.
2. Open a command prompt and `cd` to the repository's directory. Run `npm install` to install all the node packages needed for the PAM project.
3. Create a config.json file (see below)
4. Run `node server` from the command prompt to get the node server up an running. You should see the message `Listening on 1234`.
5. Open a new command prompt and run `grunt watch`. Grunt was installed when you ran `npm install` in step 2.
6. Go to http://127.0.0.1:1234 (or http://localhost:1234) in your browser, and voila!

###config.json
Required to connect to Harvest API to gather data. PAM is set up to connect to one admin account, and gather all user data from there. The account must have high enough permissions to see everyone's hours.

    {
      "username" : //Harvest admin username
      "password" : //Harvest admin password
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