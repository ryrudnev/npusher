/**
 * Module dependencies.
 */

var faye = require('faye')
    , config = require('../lib/config')
    , logger = require('../lib/log')();

/**
 * Get implementation bayeux protocol.
 * @returns {module.exports.bayeux|faye.NodeAdapter}
 */
module.exports = function () {
    var bayeux = new faye.NodeAdapter({mount: '/faye', timeout: config.get('timeout')});

    bayeux.on('handshake', function (clientId) {
        logger.info('New client with socket id %s connected', clientId);
    });

    bayeux.on('subscribe', function (clientId, channel) {
        logger.info('Client with socket id %s subscribe in app channel - %s', clientId, channel);
    });

    bayeux.on('unsubscribe', function (clientId, channel) {
        logger.info('Client with socket id %s unsubscribe in app channel - %s', clientId, channel);
    });

    return bayeux;
};
