/**
 * Module dependencies.
 */

var express = require('express')
    , logger = require('../lib/log')()
    , config = require('../lib/config')
    , error = require('../lib/error');

/**
 * Get router for REST API.
 * HTTP status:
 * - 200 Successful request. Body will contain a JSON hash of response data;
 * - 400 Error: details in response body;
 * - 401 Authentication error: response body will contain an explanation
 * - 500 Other errors
 * @returns {module.exports.router}
 */
module.exports = function (bayeux) {
    var router = express.Router();

// Sending a message to a channel
// POST /apps/:app/channels/:channel
// data (required) - data
// Response is an empty JSON if success.
// --------------------------
    router.route('/apps/:app/channels/:channel')
            .post(function (req, res, next) {
                var data = req.body.data;
                if (!data) {
                    return next(new error.HttpError(400, 'The data field is not declared'));
                }

                logger.info('Sending a data to %s:%s', req.params.app, req.params.channel);

                var event = '/' + req.params.app + '/' + req.params.channel;

                try {
                    bayeux.getClient().publish(event, {text: data});
                } catch (e) {
                    return next(500);
                }

                res.status(200).json({});
            });

// Sending a message to a user on the concrete app or all aps
// POST /apps/:app/users/:user
// data (required) - data
// channel - name of channel
// Response is an JSON with success (true or false).
// --------------------------
    router.route('/apps/:app/users/:user')
            .post(function (req, res, next) {
                var data = req.body.data;
                if (!data) {
                    return next(new error.HttpError(400, 'The data field is not declared'));
                }

                logger.info('Sending a message to user %s on %s:%s', req.params.user, req.params.app || 'apps', req.body.channel || '');

                var event = '/' + req.params.app + '/' + (req.body.channel || 'default') + '/' + req.params.user;

                try {
                    bayeux.getClient().publish(event, {text: data});
                } catch (e) {
                    return next(500);
                }

                res.status(200).json({});
            });

// Other request or incorrect request to this router will hit this middleware
    router.use(function (err, req, res, next) {
        if (typeof err === 'number') {
            err = new error.HttpError(err);
        }

        if (err instanceof error.HttpError) {
            logger.warn('Error: status - %s, message - %s', err.status, err.message);

            res.status(err.status).json({error: err.message});
        }
        else {
            logger.warn(err);

            res.status(500).json({error: 'Internal Server Error'});
        }
    });

    return router;
};