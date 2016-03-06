const express    = require('express');
const bodyParser = require('body-parser');
const path       = require('path');


if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
  require('../secrets');
}

require('./db');


const app = express();

const port = process.env.PORT || 1337;

require('./configure')(app);

app.use('/api', require('./routes'))

app.get('/*', function (req, res) {
    res.sendFile(app.get('indexHTMLPath'));
});

app.listen(port, () => { console.log('Server eavesdropping on ' + port) });
