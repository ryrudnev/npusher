/**
 * Module dependencies.
 */

var winston = require('winston')
    , config = require('../lib/config');

/**
 * Get custom logger.
 * @returns {winston.Logger} logger
 */
module.exports = function () {
    var logger = new (winston.Logger)(
            {
                transports: [
                    (function () {
                        if (config.get('logger:console')) {
                            return new (winston.transports.Console)({
                                level: 'debug',
                                colorize: true,
                                timestamp: true
                            });
                        }
                    }()),
                    new (winston.transports.File)({
                        level: 'info',
                        colorize: false,
                        timestamp: true,
                        filename: config.get('logger:filename'),
                        handleExceptions: true,
                        json: false
                    })
                ],
                exitOnError: false
            });
    return logger;
};
