'use strict';

var createError = require('errno').create;

var IopcoreNodeError = createError('IopcoreNodeError');

var RPCError = createError('RPCError', IopcoreNodeError);

module.exports = {
  Error: IopcoreNodeError,
  RPCError: RPCError
};
