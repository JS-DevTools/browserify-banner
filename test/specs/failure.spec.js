'use strict';

const browserify = require('../fixtures/browserify');
const parts = require('../fixtures/parts');
const banner = require('../../');
require('chai').should();

describe('failure tests', function () {
  it('should do nothing if run as a Browserify transform', function () {
    return browserify({
      entries: 'has-banner/index.js',
      transform: [banner],
    })
    .then(output => {
      // The bundle should just contain the Browserify prelude and postlude,
      // with our modules in-between.  There shouldn't be any banner or sourcemap.
      parts.expect(output.bundle, ['prelude', 'modules', 'postlude']);
    });
  });

  it('should throw an error if the banner file doesn\'t exist', function () {
    return browserify({
      entries: 'no-banner/index.js',
      plugin: [banner],
    })
    .then(
      () => { throw new Error('An error should have been thrown'); },
      err => {
        err.message.should.match(/^Unable to find a file named "banner.txt" in "/);
        err.should.have.property('code', 'ENOENT');
      }
    );
  });

  it('should throw an error if the package.json file doesn\'t exist', function () {
    return browserify({
      entries: 'no-banner/index.js',
      plugin: [[banner, { pkg: 'this/file/does/not/exist.json' }]],
    })
    .then(
      () => { throw new Error('An error should have been thrown'); },
      err => {
        err.message.should.equal("ENOENT: no such file or directory, open 'this/file/does/not/exist.json'");
        err.should.have.property('code', 'ENOENT');
      }
    );
  });

  it('should throw an error if the banner template contain syntax errors', function () {
    return browserify({
      entries: 'no-banner/index.js',
      plugin: [[banner, {
        template: '<%= pkg.name %> v<%= pkg.foo.bar %>',
      }]],
    })
    .then(
      () => { throw new Error('An error should have been thrown'); },
      err => {
        err.should.be.an.instanceOf(TypeError);
        err.message.should.equal("Cannot read property 'bar' of undefined");
      }
    );
  });
});
