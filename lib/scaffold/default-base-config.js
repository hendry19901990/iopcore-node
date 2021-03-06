'use strict';

var path = require('path');

/**
 * Will return the path and default iopcore-node configuration on environment variables
 * or default locations.
 * @param {Object} options
 * @param {String} options.network - "testnet" or "livenet"
 * @param {String} options.datadir - Absolute path to bitcoin database directory
 */
function getDefaultBaseConfig(options) {
  if (!options) {
    options = {};
  }

  var datadir = options.datadir || path.resolve(process.env.HOME, '.iop');

  return {
    path: process.cwd(),
    config: {
      network: options.network || 'livenet',
      port: 80,
      services: ['iopd', 'web'],
      servicesConfig: {
        iopd: {
          spawn: {
            datadir: datadir,
            exec: 'iopd'
          }
        }
      }
    }
  };
}

module.exports = getDefaultBaseConfig;
