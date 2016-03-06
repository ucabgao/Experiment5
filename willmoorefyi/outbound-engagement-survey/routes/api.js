var express = require('express');
var router = express.Router();

var pg = require('pg');

/* GET */
router.get('/', function(req, res, next) {
    console.log('Reading Database URL: ' + process.env.DATABASE_URL);

    runSql('SELECT * FROM results;', null, function(err, results) {
        res.render('index', { title: 'API' });
    });
});

router.get('/person', function(req, res, next) {
    runSql("SELECT * FROM person", null, function(err, results) {
        res.status(200).send(results.rows);
    });
});

router.post('/person', function(req, res, next) {
    var email = req.body.email;
    var name = req.body.name;

    console.log('Connecting to DB: "' + process.env.DATABASE_URL + '" to add user: "' + 
        email + '" with name "' + name + '"');

    if(!email || !name) {
        res.status(400).send( { error: 'Did not provide "email" and "name"'});
    }

    runSql("INSERT INTO person (email, name) VALUES($1, $2);", [ email, name ], function(err, results) {
        res.status(200).send({ 'Status' : 'OK' });
    }, this);
});

router.get('/iteration', function(req, res, next) {
    runSql("SELECT * FROM iteration", null, function(err, results) {
        console.log('Got results: ' + results);
        res.status(200).send(results.rows);
    });
});

router.post('/iteration', function(req, res, next) {
    var name = req.body.name;
    var startDate = req.body.startDate;
    var endDate = req.body.endDate;

    console.log('Connecting to DB: "' + process.env.DATABASE_URL + '" to add iteration: "' + 
        name + '" with start "' + startDate + '" and end "' + endDate + '"');

    if(!name || !startDate || !endDate) {
        res.status(400).send( { error: 'Did not provide "name", "startDate", and "endDate"'});
    }

    runSql("INSERT INTO iteration (name, date_retro_start, date_retro_end) VALUES($1, $2, $3);", 
        [ name, new Date(startDate), new Date(endDate) ], function(err, results) {
        res.status(200).send({ 'Status' : 'OK' });
    });
});

router.get('/results', function(req, res, next) {
    runSql("SELECT * FROM results", null, function(err, results) {
        res.status(200).send(results.rows);
    });
});

router.post('/results', function(req, res, next) {
    var email = req.body.email;
    var date = req.body.date;
    var fit = req.body.fit;
    var proud = req.body.proud;
    var excited = req.body.excited;
    var meaningful = req.body.meaningful;
    var company = req.body.company;

    console.log('Received request: ' + JSON.stringify(req.body));

    if(!email || !date || !fit || !proud || !excited || !meaningful || !company ) {
        res.status(400).send( { error: 'Did not provide all required values!'});
    }

    runSql("SELECT id FROM person WHERE email = $1", [ email ], function(err, results) {
        console.log("Found results: " + results.rows.length);
        if (err || results.rows.length != 1) {
            res.status(500).send({ error: 'No matching user ID found for email "' + email + '"'});
        } else {
            var user_id = results.rows[0].id;
            runSql("SELECT id FROM iteration where date_retro_start < $1 AND date_retro_end >= $2", 
                [ date, date ], function(err,results) {
                if (err || results.rows.length != 1) {
                    res.status(500).send({ error: 'No single matching iteration ID found for date "' + date + '"'});
                } else {
                    var iteration_id = results.rows[0].id;
                    runSql("INSERT INTO results (user_id, iteration_id, fit, proud, excited, meaningful, company) " + 
                        "VALUES($1, $2, $3, $4, $5, $6, $7);",  
                        [user_id, iteration_id, fit, proud, excited, meaningful, company], 
                        function(err, results) {
                        res.status(200).send({ 'Status' : 'OK' });
                    });
                }
            });
        }
    });
});

// TODO add error callback
function runSql(sql, params, callback, scope) {
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        if (!client) {
            console.error('Could not connect to database');
            response.send({ error: 'could not connect to Database' });
        } else {
            client.query(sql, params, function(err, results) {
                done();
                if (err) {
                    console.error('Error: ' + err);
                    response.status(500).send({ error: err });
                } else {
                    callback.call(scope, err, results);
                }
            });
        }
    });
}

function BadRequest(msg){
  this.name = 'Bad Request';
  Error.call(this, msg);
  Error.captureStackTrace(this, arguments.callee);
} 

module.exports = router;