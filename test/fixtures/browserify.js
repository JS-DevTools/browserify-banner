"use strict";

const Browserify = require("browserify");
const exorcist = require("exorcist");
const touch = require("touch");
const path = require("path");
const fs = require("fs");

const testAppsDir = path.resolve(__dirname, "../test-apps");

module.exports = runBrowserify;

/**
 * Runs Browserify and returns the results as a Promise.
 *
 * @param {object} options
 * @returns {Promise}
 */
function runBrowserify (options) {
  let entryFilePath = path.join(testAppsDir, options.entries);
  let entryDir = path.dirname(entryFilePath);

  let outputDir = path.join(entryDir, "dist");
  let bundlePath = path.join(outputDir, "bundle.js");
  let sourcemapPath = options.debug && path.join(outputDir, "bundle.js.map");

  return new Promise((resolve, reject) => {
    // Create the output folder & file(s)
    fs.mkdirSync(outputDir, { recursive: true });
    touch.sync(bundlePath);
    sourcemapPath && touch.sync(sourcemapPath);

    let browserify = new Browserify({
      entries: entryFilePath,
      standalone: options.standalone && "Fizz.Buzz",
      debug: options.debug,
      transform: options.transform,
      plugin: options.plugin,
    });

    let stream = browserify.bundle();
    stream.on("error", reject);

    // Pipe the output to the bundle file and sourcemap file
    if (options.debug) {
      stream = stream.pipe(exorcist(sourcemapPath, null, null, outputDir));
    }
    stream.pipe(fs.createWriteStream(bundlePath));

    stream.on("end", () => setTimeout(returnResults, 200));

    function returnResults () {
      try {
        // Read the output file(s) and return their contents
        resolve({
          bundle: fs.readFileSync(bundlePath, "utf8"),
          sourcemap: sourcemapPath && JSON.parse(fs.readFileSync(sourcemapPath, "utf8")),
        });
      }
      catch (e) {
        reject(e);
      }
    }
  });
}
