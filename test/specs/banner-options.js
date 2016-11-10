'use strict';

const browserify = require('../fixtures/browserify');
const parts = require('../fixtures/parts');
const banner = require('../../');
require('chai').should();

describe('Browserify + banner (with options)', function () {
  it('should use an alternate banner file', function () {
    return browserify({
      entries: 'has-banner/index.js',
      plugin: [[banner, { file: 'test/test-apps/has-banner/alt-banner.txt' }]],
      standalone: true,
      debug: true,
      transform: ['uglifyify'],
    })
    .then(output => {
      // The bundle should start with the banner from "alt-banner.txt",
      // followed by the UMD prelude and postlude,
      // with the Browserify prelude and postlude in-between,
      // and then our minified modules in-between that,
      // and finally, the sourcemap at the end
      parts.expect(output.bundle, [
        'banner', 'umd prelude', 'prelude', 'minified modules', 'postlude', 'umd postlude', 'sourcemap'
      ]);

      // The sourcemap should reference the Browserify prelude file
      // and all of our module files
      output.sourcemap.sources.should.deep.equal([
        '../../../../node_modules/browser-pack/_prelude.js',
        '../hello-world.js',
        '../index.js',
        '../say/index.js'
      ]);

      // The sourcemap mappings should start with 3 blank lines,
      // since "alt-banner.txt" produce a 3-line banner
      output.sourcemap.mappings.should.match(/^;;;AAAA;/);
    });
  });

  it('should use an alternate package file', function () {
    return browserify({
      entries: 'has-banner/index.js',
      plugin: [[banner, { pkg: 'test/test-apps/has-banner/alt-package.json' }]],
      standalone: true,
      debug: true,
      transform: ['uglifyify'],
    })
    .then(output => {
      // The bundle should start with the banner from "banner.txt",
      // followed by the UMD prelude and postlude,
      // with the Browserify prelude and postlude in-between,
      // and then our minified modules in-between that,
      // and finally, the sourcemap at the end
      parts.expect(output.bundle, [
        'banner', 'umd prelude', 'prelude', 'minified modules', 'postlude', 'umd postlude', 'sourcemap'
      ]);

      // The banner should contain the data from alt-package.json instead of package.json
      output.bundle.should.match(/\* alternate-world v9.87.654/);

      // The sourcemap should reference the Browserify prelude file
      // and all of our module files
      output.sourcemap.sources.should.deep.equal([
        '../../../../node_modules/browser-pack/_prelude.js',
        '../hello-world.js',
        '../index.js',
        '../say/index.js'
      ]);

      // The sourcemap mappings should start with 9 blank lines,
      // since "banner.txt" produce a 9-line banner
      output.sourcemap.mappings.should.match(/^;;;;;;;;;AAAA;/);
    });
  });

  it('should use an alternate package object', function () {
    return browserify({
      entries: 'has-banner/index.js',
      plugin: [[banner, {
        pkg: {
          name: 'inline-package',
          version: '1.2.3',
          description: 'my custom description',
          author: {
            name: 'John Doe',
          }
        }
      }]],
      standalone: true,
      debug: true,
      transform: ['uglifyify'],
    })
    .then(output => {
      // The bundle should start with the banner from "banner.txt",
      // followed by the UMD prelude and postlude,
      // with the Browserify prelude and postlude in-between,
      // and then our minified modules in-between that,
      // and finally, the sourcemap at the end
      parts.expect(output.bundle, [
        'banner', 'umd prelude', 'prelude', 'minified modules', 'postlude', 'umd postlude', 'sourcemap'
      ]);

      // The banner should contain the data from alt-package.json instead of package.json
      output.bundle.should.match(/\* inline-package v1.2.3/);

      // The sourcemap should reference the Browserify prelude file
      // and all of our module files
      output.sourcemap.sources.should.deep.equal([
        '../../../../node_modules/browser-pack/_prelude.js',
        '../hello-world.js',
        '../index.js',
        '../say/index.js'
      ]);

      // The sourcemap mappings should start with 9 blank lines,
      // since "banner.txt" produce a 9-line banner
      output.sourcemap.mappings.should.match(/^;;;;;;;;;AAAA;/);
    });
  });

  it('should use an inline banner template', function () {
    return browserify({
      entries: 'has-banner/index.js',
      plugin: [[banner, {
        template: 'This package was written by <%= pkg.author.name %>',
      }]],
      standalone: true,
      debug: true,
      transform: ['uglifyify'],
    })
    .then(output => {
      // The bundle should start with our custom banner text,
      // followed by the UMD prelude and postlude,
      // with the Browserify prelude and postlude in-between,
      // and then our minified modules in-between that,
      // and finally, the sourcemap at the end
      parts.expect(output.bundle, [
        'banner', 'umd prelude', 'prelude', 'minified modules', 'postlude', 'umd postlude', 'sourcemap'
      ]);

      // The banner should contain the data from alt-package.json instead of package.json
      output.bundle.should.match(/\* This package was written by John Doe\n/);

      // The sourcemap should reference the Browserify prelude file
      // and all of our module files
      output.sourcemap.sources.should.deep.equal([
        '../../../../node_modules/browser-pack/_prelude.js',
        '../hello-world.js',
        '../index.js',
        '../say/index.js'
      ]);

      // The sourcemap mappings should start with 3 blank lines,
      // since our custom banner text will be turned into a 3-line comment block
      output.sourcemap.mappings.should.match(/^;;;AAAA;/);
    });
  });

  it('should use an not double-comment banner text', function () {
    return browserify({
      entries: 'has-banner/index.js',
      plugin: [[banner, {
        template:
          '// This banner is already a comment\n' +
          '// <%= pkg.name %> v<%= pkg.version %>\n'
      }]],
      standalone: true,
      debug: true,
      transform: ['uglifyify'],
    })
    .then(output => {
      // The bundle should start with our custom banner text,
      // followed by the UMD prelude and postlude,
      // with the Browserify prelude and postlude in-between,
      // and then our minified modules in-between that,
      // and finally, the sourcemap at the end
      parts.expect(output.bundle, [
        '// This banner is already a comment\n// hello-world v1.23.456\n',
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

      // The sourcemap mappings should start with 2 blank lines,
      // since our custom banner text is a 2-line comment
      output.sourcemap.mappings.should.match(/^;;AAAA;/);
    });
  });

  it('should inject a literal banner as-is', function () {
    return browserify({
      entries: 'has-banner/index.js',
      plugin: [[banner, {
        banner:
          '// This banner is NOT a template, so <%= this.doesnt.do.anything %>.\n' +
          '// But I can inject custom code at the top of the banner...\n' +
          'window.myCustomVariable = navigator.location;\n'
      }]],
      standalone: true,
      debug: true,
      transform: ['uglifyify'],
    })
    .then(output => {
      // The bundle should start with our custom banner text,
      // followed by the UMD prelude and postlude,
      // with the Browserify prelude and postlude in-between,
      // and then our minified modules in-between that,
      // and finally, the sourcemap at the end
      parts.expect(output.bundle, [
        '// This banner is NOT a template, so <%= this.doesnt.do.anything %>.\n' +
        '// But I can inject custom code at the top of the banner...\n' +
        'window.myCustomVariable = navigator.location;\n',
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

      // The sourcemap mappings should start with 3 blank lines,
      // since our custom banner text is a 3-line code block
      output.sourcemap.mappings.should.match(/^;;;AAAA;/);
    });
  });
});
