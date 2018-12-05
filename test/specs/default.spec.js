"use strict";

const browserify = require("../fixtures/browserify");
const inspectBundle = require("../fixtures/inspect-bundle");
const inspectSourcemap = require("../fixtures/inspect-sourcemap");
require("chai").should();

describe("Browserify API only (without banner)", function () {
  it("should output a default Browserify bundle", function () {
    return browserify({
      entries: "no-banner/index.js"
    })
      .then(output => {
      // The bundle should just contain the Browserify prelude and postlude,
      // with our modules in-between
        inspectBundle(output.bundle, {
          parts: ["prelude", "modules", "postlude"],
        });
      });
  });

  it("should output a bundle and sourcemap", function () {
    return browserify({
      entries: "no-banner/index.js",
      debug: true,
    })
      .then(output => {
      // The bundle should contain the Browserify prelude and postlude,
      // with our modules in-between, and then the sourcemap comment at the end
        inspectBundle(output.bundle, {
          parts: ["prelude", "modules", "postlude", "sourcemap"],
        });

        // The sourcemap mappings should start at the prelude
        inspectSourcemap(output.sourcemap, {
          blankLines: 0,
        });
      });
  });

  it("should output a minified bundle and sourcemap", function () {
    return browserify({
      entries: "no-banner/index.js",
      debug: true,
      transform: ["uglifyify"],
    })
      .then(output => {
      // The bundle should contain the Browserify prelude and postlude,
      // with our minified modules in-between, and then the sourcemap comment at the end
        inspectBundle(output.bundle, {
          parts: ["prelude", "minified modules", "postlude", "sourcemap"],
        });

        // The sourcemap mappings should start at the prelude
        inspectSourcemap(output.sourcemap, {
          blankLines: 0,
        });
      });
  });

  it("should output a UMD bundle", function () {
    return browserify({
      entries: "no-banner/index.js",
      standalone: true,
    })
      .then(output => {
      // The bundle should contain the UMD prelude and postlude,
      // with the Browserify prelude and postlude in-between,
      // and then our modules in-between that
        inspectBundle(output.bundle, {
          parts: ["umd prelude", "prelude", "modules", "postlude", "umd postlude"],
        });
      });
  });

  it("should output a UMD bundle and sourcemap", function () {
    return browserify({
      entries: "no-banner/index.js",
      standalone: true,
      debug: true,
    })
      .then(output => {
      // The bundle should contain the UMD prelude and postlude,
      // with the Browserify prelude and postlude in-between,
      // and then our modules in-between that,
      // and finally, the sourcemap at the end
        inspectBundle(output.bundle, {
          parts: ["umd prelude", "prelude", "modules", "postlude", "umd postlude", "sourcemap"],
        });

        // The sourcemap mappings should start at the prelude
        inspectSourcemap(output.sourcemap, {
          blankLines: 0,
        });
      });
  });

  it("should output a minified UMD bundle and sourcemap", function () {
    return browserify({
      entries: "no-banner/index.js",
      standalone: true,
      debug: true,
      transform: ["uglifyify"],
    })
      .then(output => {
      // The bundle should contain the UMD prelude and postlude,
      // with the Browserify prelude and postlude in-between,
      // and then our minified modules in-between that,
      // and finally, the sourcemap at the end
        inspectBundle(output.bundle, {
          parts: [
            "umd prelude", "prelude", "minified modules", "postlude", "umd postlude", "sourcemap"
          ],
        });

        // The sourcemap mappings should start at the prelude
        inspectSourcemap(output.sourcemap, {
          blankLines: 0,
        });
      });
  });
});
