'use strict';

var should = require('chai').should();

describe('Index Exports', function() {
  it('will export iopcore-lib', function() {
    var iopcore = require('../');
    should.exist(iopcore.lib);
    should.exist(iopcore.lib.Transaction);
    should.exist(iopcore.lib.Block);
  });
});
