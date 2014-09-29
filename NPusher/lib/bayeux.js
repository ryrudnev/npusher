/**
 * Module dependencies.
 */

var faye = require('faye')
    , config = require('../lib/config')
    , logger = require('../lib/log')();

// for server authentication
var serverAuth = {
    incoming: function (message, callback) {
        if (/^\/meta\//.test(message.channel)) {
            return callback(message);
        }
        var password = message.ext && message.ext.password;

        if (password !== config.get('secret'))
            message.error = Faye.Error.extMismatch();

        if (password) {
            delete message.ext.password;
        }

        callback(message);
    }
};

// for client authentication
var clientAuth = {
    outgoing: function (message, callback) {
        message.ext = message.ext || {};
        message.ext.password = config.get('secret');

        callback(message);
    }
};

/**
 * Get implementation bayeux protocol.
 * @returns {module.exports.bayeux|faye.NodeAdapter}
 */
module.exports = function () {
    var bayeux = new faye.NodeAdapter({mount: '/faye', timeout: config.get('timeout')});

    // set only push-server mod
    bayeux.addExtension(serverAuth);
    bayeux.getClient().addExtension(clientAuth);

    bayeux.on('handshake', function (clientId) {
        logger.info('[HANDSHAKE] %s', clientId);
    });

    bayeux.on('disconnect', function (clientId) {
        logger.info('[DISCONNECT] %s', clientId);
    });

    bayeux.on('subscribe', function (clientId, channel) {
        logger.info('[SUBSCRIBE] %s -> %s', clientId, channel);
    });

    bayeux.on('unsubscribe', function (clientId, channel) {
        logger.info('[UNSUBSCRIBE] %s -> %s', clientId, channel);
    });

    return bayeux;
};
