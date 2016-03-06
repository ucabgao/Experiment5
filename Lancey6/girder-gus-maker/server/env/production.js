module.exports = {
    "DATABASE_URI": process.env.DATABASE_URI,
    "SESSION_SECRET": process.env.SESSION_SECRET,
    "TWITTER": {
        "consumerKey": "INSERT_TWITTER_CONSUMER_KEY_HERE",
        "consumerSecret": "INSERT_TWITTER_CONSUMER_SECRET_HERE",
        "callbackUrl": "INSERT_TWITTER_CALLBACK_HERE"
    },
    "FACEBOOK": {
        "clientID": "INSERT_FACEBOOK_CLIENTID_HERE",
        "clientSecret": "INSERT_FACEBOOK_CLIENT_SECRET_HERE",
        "callbackURL": "INSERT_FACEBOOK_CALLBACK_HERE"
    },
    "GOOGLE": {
        'clientID': process.env.GOOGLE_CLIENT_ID,
        'clientSecret': process.env.GOOGLE_CLIENT_SECRET,
        'callbackURL': process.env.GOOGLE_CALLBACK_URL
    },
    "S3": {
        'ACCESS_KEY_ID': process.env.S3_ACCESS_KEY_ID,
        'SECRET_ACCESS_KEY': process.env.S3_SECRET_ACCESS_KEY
    }
};
