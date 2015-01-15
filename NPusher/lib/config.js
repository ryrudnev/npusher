/**
 * Module dependencies.
 */

var nconf = require('nconf');

nconf.argv()
        .env()
        .file({ file: './config.json' });
/**
 * Config.
 * @type {nconf} nconf
 */
module.exports = nconf;
