'use strict';

const del = require('del');
const path = require('path');
const testAppsDir = path.resolve(__dirname, '../test-apps');

// Clear the output files before each test
beforeEach(function (done) {
  del('*/dist', { cwd: testAppsDir })
    .then(function () {
      done();
    })
    .catch(done);
});
