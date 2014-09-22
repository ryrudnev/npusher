var express    = require('express')
    , bodyParser = require('body-parser')
    , http = require('http')
    , faye = require('faye')
    , logger = require('./libs/log')(module)
    , config = require('./libs/config');

var app = express()
    , server = http.createServer(app)
    , bayeux = new faye.NodeAdapter({mount: '/faye', timeout: 45});

bayeux.on('handshake', function(clientId) {
  logger.info('New client with socket id %s connected', clientId);
});

bayeux.on('subscribe', function(clientId, channel) {
  logger.info('Client with socket id %s subscribe in app channel - %s', clientId, channel);
});

bayeux.on('unsubscribe', function(clientId, channel) {
  logger.info('Client with socket id %s unsubscribe in app channel - %s', clientId, channel);
});

bayeux.attach(server.listen(config.get('port'), function() {
    logger.info('Server listening on port %d', server.address().port);
}));

app.use(bodyParser.urlencoded({extend:true}));
app.use(bodyParser.json());

var router = express.Router();

// Sending a message to a channel
// POST /apps/:app/channels/:channel
// data (required) - data
// Response is an JSON with success (true or false).
// --------------------------
router.route('/apps/:app/channels/:channel')
    .post(function(req, res){
        logger.info('Sending a data to %s:%s', req.params.app, req.params.channel);

        var s = '/'+req.params.app+'/'+req.params.channel;
        var clients = bayeux.getClient();
        bayeux.getClient().publish('/'+req.params.app+'/'+req.params.channel, {text: req.body.data});

        res.json({success: true});
    });

// Sending a message to a user on the concrete app or all aps
// POST /apps/:app?/users/:user
// data (required) - data
// channel - name of channel
// Response is an JSON with success (true or false).
// --------------------------
router.route('/apps/:app?/users/:user')
    .post(function(req, res){
        logger.info('Sending a message to user %s on %s:%s', req.params.user, req.params.app || 'apps', req.body.channel || '');

        bayeux.getClient().publish('/'+req.params.app+'/'+(req.body.channel || 'default')+'/'+req.params.user, {text: req.body.data});

        res.json({success: true});
    });

app.use('/api', router);

app.use(function(err, req, res, next){
    console.error(err.stack);
    res.send(500);
});