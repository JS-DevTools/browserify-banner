"use strict";

const browserify = require("../fixtures/browserify");
const inspectBundle = require("../fixtures/inspect-bundle");
const inspectSourcemap = require("../fixtures/inspect-sourcemap");
const banner = require("../../");
require("chai").should();

describe("Browserify API + banner (no options)", function () {
  it("should output a default Browserify bundle", function () {
    return browserify({
      entries: "has-banner/index.js",
      plugin: [banner],
    })
      .then(output => {
      // The bundle should start with the banner from "banner.txt",
      // followed by the Browserify prelude and postlude,
      // with our modules in-between
        inspectBundle(output.bundle, {
          parts: ["banner", "prelude", "modules", "postlude"],
        });
      });
  });

  it("should output a bundle and sourcemap", function () {
    return browserify({
      entries: "has-banner/index.js",
      plugin: [banner],
      debug: true,
    })
      .then(output => {
      // The bundle should start with the banner from "banner.txt",
      // followed by the Browserify prelude and postlude,
      // with our modules in-between, and then the sourcemap comment at the end
        inspectBundle(output.bundle, {
          parts: ["banner", "prelude", "modules", "postlude", "sourcemap"],
        });

        // The sourcemap mappings should start with 9 blank lines,
        // since "banner.txt" produce a 9-line banner
        inspectSourcemap(output.sourcemap, {
          blankLines: 9,
        });
      });
  });

  it("should output a minified bundle and sourcemap", function () {
    return browserify({
      entries: "has-banner/index.js",
      plugin: [banner],
      debug: true,
      transform: ["uglifyify"],
    })
      .then(output => {
      // The bundle should start with the banner from "banner.txt",
      // followed by the Browserify prelude and postlude,
      // with our minified modules in-between, and then the sourcemap comment at the end
        inspectBundle(output.bundle, {
          parts: ["banner", "prelude", "minified modules", "postlude", "sourcemap"],
        });

        // The sourcemap mappings should start with 9 blank lines,
        // since "banner.txt" produce a 9-line banner
        inspectSourcemap(output.sourcemap, {
          blankLines: 9,
        });
      });
  });

  it("should output a UMD bundle", function () {
    return browserify({
      entries: "has-banner/index.js",
      plugin: [banner],
      standalone: true,
    })
      .then(output => {
      // The bundle should start with the banner from "banner.txt",
      // followed by the UMD prelude and postlude,
      // with the Browserify prelude and postlude in-between,
      // and then our modules in-between that
        inspectBundle(output.bundle, {
          parts: ["banner", "umd prelude", "prelude", "modules", "postlude", "umd postlude"],
        });
      });
  });

  it("should output a UMD bundle and sourcemap", function () {
    return browserify({
      entries: "has-banner/index.js",
      plugin: [banner],
      standalone: true,
      debug: true,
    })
      .then(output => {
      // The bundle should start with the banner from "banner.txt",
      // followed by the UMD prelude and postlude,
      // with the Browserify prelude and postlude in-between,
      // and then our modules in-between that,
      // and finally, the sourcemap at the end
        inspectBundle(output.bundle, {
          parts: [
            "banner", "umd prelude", "prelude", "modules", "postlude", "umd postlude", "sourcemap"
          ],
        });

        // The sourcemap mappings should start with 9 blank lines,
        // since "banner.txt" produce a 9-line banner
        inspectSourcemap(output.sourcemap, {
          blankLines: 9,
        });
      });
  });

  it("should output a minified UMD bundle and sourcemap", function () {
    return browserify({
      entries: "has-banner/index.js",
      plugin: [banner],
      standalone: true,
      debug: true,
      transform: ["uglifyify"],
    })
      .then(output => {
      // The bundle should start with the banner from "banner.txt",
      // followed by the UMD prelude and postlude,
      // with the Browserify prelude and postlude in-between,
      // and then our minified modules in-between that,
      // and finally, the sourcemap at the end
        inspectBundle(output.bundle, {
          parts: [
            "banner", "umd prelude", "prelude", "minified modules", "postlude",
            "umd postlude", "sourcemap"
          ],
        });

        // The sourcemap mappings should start with 9 blank lines,
        // since "banner.txt" produce a 9-line banner
        inspectSourcemap(output.sourcemap, {
          blankLines: 9,
        });
      });
  });
});
