var express = require('express')
    , bodyParser = require('body-parser')
    , http = require('http')
    , api = require('./lib/api')
    , bayeux = require('./lib/bayeux')()
    , logger = require('./lib/log')()
    , config = require('./lib/config');

var app = express()
    , router = api(bayeux)
    , server = http.createServer(app);

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// connect rest api
app.use('/api', router);

app.use(function (req, res, next) {
    logger.warn('Error: status - 404, message - Not Found');

    res.sendStatus(404).end();
});

app.use(function (err, req, res, next) {
    logger.warn('Error: status - 500, message - Internal Server Error');

    res.sendStatus(500).end();
});

server.listen(config.get('port'), config.get('hostname'), function () {
    logger.info('Server started on port %s at %s', server.address().port, server.address().address);
});

bayeux.attach(server);