'use strict';

const _ = require('lodash');
const fs = require('fs');
const ono = require('ono');
const path = require('path');
const moment = require('moment');
const through = require('through2');
const convertSourcemap = require('convert-source-map');
const offsetSourcemap = require('offset-sourcemap-lines');

module.exports = browserifyBanner;

/**
 * Browserify plugin that adds a banner comment block to the top of the bundle.
 *
 * @param {Browserify} browserify - The Browserify instance
 * @param {object} options - The plugin options
 */
function browserifyBanner (browserify, options) {
  options = options || {};

  if (typeof browserify === 'string') {
    // browserify-banner was loaded as a transform, not a plug-in.
    // So return a stream that does nothing.
    return through();
  }

  browserify.on('package', setPackageOption);
  browserify.on('file', setFileOption);
  browserify.on('bundle', wrapBundle);
  browserify.on('reset', wrapBundle);

  /**
   * If the `pkg` option isn't set, then it defaults to the first package that's read
   *
   * @param {object} pkg - The parsed package.json file
   */
  function setPackageOption (pkg) {
    if (!options.pkg) {
      options.pkg = pkg;
    }
  }

  /**
   * If the `file` option isn't set, then it defaults to "banner.txt" in the same directory
   * as the first entry file.  We'll crawl up the directory tree from there if necessary.
   *
   * @param {string} file - The full file path
   */
  function setFileOption (file) {
    if (!options.file) {
      options.file = path.join(path.dirname(file), 'banner.txt');
    }
  }

  /**
   * Adds transforms to the Browserify "wrap" pipeline
   */
  function wrapBundle () {
    let wrap = browserify.pipeline.get('wrap');
    let bannerAlreadyAdded = false;
    let banner;

    wrap.push(through(addBannerToBundle));
    if (browserify._options.debug) {
      wrap.push(through(addBannerToSourcemap));
    }

    /**
     * Injects the banner comment block into the Browserify bundle
     */
    function addBannerToBundle (chunk, enc, next) {
      if (!bannerAlreadyAdded) {
        bannerAlreadyAdded = true;
        try {
          banner = getBanner(options);
          this.push(new Buffer(banner));
        }
        catch (e) {
          next(e);
        }
      }
      this.push(chunk);
      next();
    }

    /**
     * Adjusts the sourcemap to account for the banner comment block
     */
    function addBannerToSourcemap (chunk, enc, next) {
      let pushed = false;

      if (banner) {
        // Get the sourcemap, once it exists
        let conv = convertSourcemap.fromSource(chunk.toString('utf8'));
        if (conv) {
          // Offset the sourcemap by the number of lines in the banner
          let offsetMap = offsetSourcemap(conv.toObject(), countLines(banner));
          this.push(new Buffer('\n' + convertSourcemap.fromObject(offsetMap).toComment() + '\n'));
          pushed = true;
        }
      }

      if (!pushed) {
        // This chunk doesn't contain anything for us to modify,
        // so just pass it along as-is
        this.push(chunk);
      }
      next();
    }
  }
}

/**
 * Returns the banner comment block, based on the given options
 *
 * @param {object} options
 * @param {string} [options.banner] - If set, then this banner will be used exactly as-is
 * @param {string} [options.template] - A Lodash template that will be compiled to build the banner
 * @param {string} [options.file] - A file containing the Lodash template
 * @param {string|object} [options.pkg] - The path (or parsed contents) of the package.json file
 *
 * @returns {string|undefiend}
 */
function getBanner (options) {
  if (!options.banner) {
    if (typeof options.pkg === 'string') {
      // Read the package.json file
      options.pkg = readJSON(options.pkg);
    }

    if (!options.template) {
      // Read the banner template from a file
      options.template = findFile(options.file);
    }

    if (options.template) {
      // Compile the banner template
      options.banner = _.template(options.template)({ moment, pkg: options.pkg, });

      // Convert the banner to a comment block, if it's not already
      if (!/^\s*(\/\/|\/\*)/.test(options.banner)) {
        options.banner = '/*!\n * ' + options.banner.trim().replace(/\n/g, '\n * ') + '\n */\n';
      }
    }
  }

  return options.banner;
}

/**
 * Reads and parses a JSON file
 *
 * @param {string} filePath
 * @returns {object}
 */
function readJSON (filePath) {
  let json = fs.readFileSync(filePath, 'utf8');

  try {
    return JSON.parse(json);
  }
  catch (e) {
    throw ono(e, `Error parsing ${filePath}`);
  }
}

/**
 * Searches for the given file, starting in the given directory
 * and crawling up from there, and reads its contents.
 *
 * @param {string} startingPath - The file path to start at
 * @returns {string|undefined}
 */
function findFile (startingPath) {
  try {
    return fs.readFileSync(startingPath, 'utf8');
  }
  catch (e) {
    let fileName = path.basename(startingPath);
    let startingDir = path.dirname(startingPath);
    let parentDir = path.dirname(startingDir);

    if (parentDir === startingDir) {
      // We're recursed all the way to the root directory
      throw e;
    }
    else {
      try {
        // Search for the file in the parent directories
        return findFile(path.join(parentDir, fileName));
      }
      catch (e2) {
        // The file wasn't found in any of the parent directories
        throw ono(e,
          `Unable to find a file named "${fileName}" in "${startingDir}" or any of its parent directories.`
        );
      }
    }
  }
}

/**
 * Counts the number of lines in the given string
 *
 * @param {string} str
 * @returns {number}
 */
function countLines (str) {
  if (str) {
    let lines = str.match(/\n/g);
    if (lines) {
      return lines.length;
    }
  }
  return 0;
}
