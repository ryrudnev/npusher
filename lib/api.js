/**
 * Module dependencies.
 */

var express = require('express')
    , logger = require('../lib/log')()
    , config = require('../lib/config');

/**
 * Get router for REST API.
 * @returns {module.exports.router}
 */
module.exports = function (bayeux) {
    var router = express.Router();

// Sending a message to a channel
// POST /apps/:app/channels/:channel
// data (required) - data
// Response is an JSON with success (true or false).
// --------------------------
    router.route('/apps/:app/channels/:channel')
            .post(function (req, res) {
                logger.info('Sending a data to %s:%s', req.params.app, req.params.channel);

                bayeux.getClient().publish('/' + req.params.app + '/' + req.params.channel, {text: req.body.data});

                res.json({success: true});
            });

// Sending a message to a user on the concrete app or all aps
// POST /apps/:app?/users/:user
// data (required) - data
// channel - name of channel
// Response is an JSON with success (true or false).
// --------------------------
    router.route('/apps/:app/users/:user')
            .post(function (req, res) {
                logger.info('Sending a message to user %s on %s:%s', req.params.user, req.params.app || 'apps', req.body.channel || '');

                bayeux.getClient().publish('/' + req.params.app + '/' + (req.body.channel || 'default') + '/' + req.params.user, {text: req.body.data});

                res.json({success: true});
            });

    return router;
};
