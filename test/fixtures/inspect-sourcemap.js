'use strict';

require('chai').should();

module.exports = inspectSourceMap;

/**
 * Performs various assertions on the given sourcemap.
 *
 * @param {object} sourcemap
 *
 * @param {number} [options.blankLines]
 * The number of blank lines that should occur at the beginning of the sourcemap
 */
function inspectSourceMap (sourcemap, options) {
  // The first source file in the sourcemap should be the Browserify prelude
  sourcemap.sources[0].should.be.oneOf([
    // Node 4
    '../../../../node_modules/browserify/node_modules/browser-pack/_prelude.js',

    // Node 5+
    '../../../../node_modules/browser-pack/_prelude.js',

    // Windows
    '..\\..\\..\\..\\node_modules\\browserify\\node_modules\\browser-pack\\_prelude.js',
    '..\\..\\..\\..\\node_modules\\browser-pack\\_prelude.js',
  ]);

  // The rest of the source files should be our module files
  sourcemap.sources[1].should.match(/^\.\.[/\\]hello-world.js$/);
  sourcemap.sources[2].should.match(/^\.\.[/\\]index.js$/);
  sourcemap.sources[3].should.match(/^\.\.[/\\]say[/\\]index.js$/);

  // There shouldn't be any other source files
  sourcemap.sources.should.have.lengthOf(4);

  // The sourcemap's mappings should start with blank lines for the banner
  let blankLines = String(';;;;;;;;;;;;;;;').substr(0, options.blankLines);
  blankLines += 'AAAA;';
  sourcemap.mappings.substr(0, blankLines.length).should.equal(blankLines);
}
