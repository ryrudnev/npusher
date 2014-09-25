/**
 * Module dependencies.
 */

var http = require('http')
    , util = require('util');

/**
 * Exception of http errors.
 * @param {int} status
 * @param {object} message
 * @returns {HttpError}
 */
function HttpError(status, message) {
    Error.apply(this, arguments);
    Error.captureStackTrace(this, HttpError);

    this.status = status;
    this.message = message || http.STATUS_CODES[status] || 'Error';
}

util.inherits(HttpError, Error);

HttpError.prototype.name = 'HttpError';

module.exports.HttpError = HttpError;