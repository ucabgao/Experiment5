# Engagement Survey Results

App to display the engagement survey results for the Outbound USA team.

## Requirements

* NodeJS 5.5
* Postgres (tested on 9.5)
* Heroku toolbelt (or another runtime environment)

## How to run

The app is built against the heroku toolbelt.  It may be possible to run in
another container environment, but hasn't been tesed as such.  All further 
instructions assume you are running with the heroku toolbelt.

### Conigure the database

* Configure / install postgres
* Create a user
* Create a database (default ```engagement_survey```)
* Run the scripts in ```db/up.sql```

### Configure heroku runtime

* Install heroku toolbelt
* Create .env file
    * Set "DATABASE_URL" property 
        * For default database name running in local user schema, the property would 
be ```DATABASE_URL=postgres:///engagement_survey```
* Seed some data in the tables
* Execute the local heroku runtime via ```heroku local```