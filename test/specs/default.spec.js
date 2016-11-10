'use strict';

const browserify = require('../fixtures/browserify');
const parts = require('../fixtures/parts');
require('chai').should();

describe('Browserify only (without banner)', function () {
  it('should output a default Browserify bundle', function () {
    return browserify({
      entries: 'no-banner/index.js'
    })
    .then(output => {
      // The bundle should just contain the Browserify prelude and postlude,
      // with our modules in-between
      parts.expect(output.bundle, ['prelude', 'modules', 'postlude']);
    });
  });

  it('should output a bundle and sourcemap', function () {
    return browserify({
      entries: 'no-banner/index.js',
      debug: true,
    })
    .then(output => {
      // The bundle should contain the Browserify prelude and postlude,
      // with our modules in-between, and then the sourcemap comment at the end
      parts.expect(output.bundle, ['prelude', 'modules', 'postlude', 'sourcemap']);

      // The sourcemap should reference the Browserify prelude file
      // and all of our module files
      output.sourcemap.sources.should.deep.equal([
        '../../../../node_modules/browser-pack/_prelude.js',
        '../hello-world.js',
        '../index.js',
        '../say/index.js'
      ]);

      // The sourcemap mappings should start at the prelude
      output.sourcemap.mappings.should.match(/^AAAA;/);
    });
  });

  it('should output a minified bundle and sourcemap', function () {
    return browserify({
      entries: 'no-banner/index.js',
      debug: true,
      transform: ['uglifyify'],
    })
    .then(output => {
      // The bundle should contain the Browserify prelude and postlude,
      // with our minified modules in-between, and then the sourcemap comment at the end
      parts.expect(output.bundle, ['prelude', 'minified modules', 'postlude', 'sourcemap']);

      // The sourcemap should reference the Browserify prelude file
      // and all of our module files
      output.sourcemap.sources.should.deep.equal([
        '../../../../node_modules/browser-pack/_prelude.js',
        '../hello-world.js',
        '../index.js',
        '../say/index.js'
      ]);

      // The sourcemap mappings should start at the prelude
      output.sourcemap.mappings.should.match(/^AAAA;/);
    });
  });

  it('should output a UMD bundle', function () {
    return browserify({
      entries: 'no-banner/index.js',
      standalone: true,
    })
    .then(output => {
      // The bundle should contain the UMD prelude and postlude,
      // with the Browserify prelude and postlude in-between,
      // and then our modules in-between that
      parts.expect(output.bundle, [
        'umd prelude', 'prelude', 'modules', 'postlude', 'umd postlude'
      ]);
    });
  });

  it('should output a UMD bundle and sourcemap', function () {
    return browserify({
      entries: 'no-banner/index.js',
      standalone: true,
      debug: true,
    })
    .then(output => {
      // The bundle should contain the UMD prelude and postlude,
      // with the Browserify prelude and postlude in-between,
      // and then our modules in-between that,
      // and finally, the sourcemap at the end
      parts.expect(output.bundle, [
        'umd prelude', 'prelude', 'modules', 'postlude', 'umd postlude', 'sourcemap'
      ]);

      // The sourcemap should reference the Browserify prelude file
      // and all of our module files
      output.sourcemap.sources.should.deep.equal([
        '../../../../node_modules/browser-pack/_prelude.js',
        '../hello-world.js',
        '../index.js',
        '../say/index.js'
      ]);

      // The sourcemap mappings should start at the prelude
      output.sourcemap.mappings.should.match(/^AAAA;/);
    });
  });

  it('should output a minified UMD bundle and sourcemap', function () {
    return browserify({
      entries: 'no-banner/index.js',
      standalone: true,
      debug: true,
      transform: ['uglifyify'],
    })
    .then(output => {
      // The bundle should contain the UMD prelude and postlude,
      // with the Browserify prelude and postlude in-between,
      // and then our minified modules in-between that,
      // and finally, the sourcemap at the end
      parts.expect(output.bundle, [
        'umd prelude', 'prelude', 'minified modules', 'postlude', 'umd postlude', 'sourcemap'
      ]);

      // The sourcemap should reference the Browserify prelude file
      // and all of our module files
      output.sourcemap.sources.should.deep.equal([
        '../../../../node_modules/browser-pack/_prelude.js',
        '../hello-world.js',
        '../index.js',
        '../say/index.js'
      ]);

      // The sourcemap mappings should start at the prelude
      output.sourcemap.mappings.should.match(/^AAAA;/);
    });
  });
});
