/* eslint quotes:off */
'use strict';

require('chai').should();

module.exports = inspectBundle;

/**
 * Asserts that the given bundle consists of the expected parts
 *
 * @param {string} bundle
 *
 * @param {string[]} options.parts
 * An array of the named parts that are expected
 */
function inspectBundle (bundle, options) {
  let actualParts = splitBundleIntoParts(bundle);
  actualParts.should.deep.equal(options.parts);
}

/**
 * Returns an array containing the parts that make-up the given bundle
 *
 * @param {string} bundle
 * @returns {string[]}
 */
function splitBundleIntoParts (bundle) {
  let parts = [];

  // Normalize line endings on Windows
  if (process.platform === "win32") {
    bundle = bundle.replace(/\r\n/g, "\n");
  }

  // Find all the parts that exist in the bundle
  for (let part of ALL_PARTS) {
    let startsAt, endsAt;

    if (part.contents) {
      startsAt = bundle.indexOf(part.contents);
      if (startsAt !== -1) {
        endsAt = startsAt + part.contents.length;
      }
    }
    else {
      let match = part.pattern.exec(bundle);
      if (match) {
        startsAt = match.index;
        endsAt = startsAt + match[0].length;
      }
    }

    if (startsAt >= 0) {
      parts.push({ name: part.name, startsAt, endsAt });
    }
  }

  if (parts.length === 0) {
    throw new Error('The bundle does not contain any recognized parts');
  }

  // Sort the parts to match their order in the bundle
  parts.sort((a, b) => a.startsAt - b.startsAt);

  // Build an array of the part names, in order
  let partNames = [], position = 0;
  for (let part of parts) {
    if (part.startsAt !== position) {
      // The bundle contains some unrecognized part
      partNames.push(bundle.substring(position, part.startsAt));
    }

    partNames.push(part.name);
    position = part.endsAt;
  }

  if (position !== bundle.length) {
    // The bundle contains some unrecognized part at the end
    partNames.push(bundle.substr(position));
  }

  return partNames;
}

const ALL_PARTS = [
  {
    name: 'banner',
    pattern: /^\/\*\!\n( \* .*\n)+ \*\/\n/
  },

  {
    name: 'prelude',
    contents:
`(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
`
  },

  {
    name: 'postlude',
    pattern: /\},\{\}\]\},\{\},\[2\]\);?\n?/
  },

  {
    name: 'umd prelude',
    contents:
`(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}(g.Fizz || (g.Fizz = {})).Buzz = f()}})(function(){var define,module,exports;return `
  },

  {
    name: 'umd postlude',
    pattern: /\(2\)\n\}\);\n?/
  },

  {
    name: 'sourcemap',
    contents:
`//# sourceMappingURL=bundle.js.map
`
  },

  {
    name: 'minified modules',
    contents:
`"use strict";var say=require("./say");module.exports=function(e){say("hello",e||"world")};

},{"./say":3}],2:[function(require,module,exports){
"use strict";module.exports={say:require("./say"),hello:require("./hello-world")};

},{"./hello-world":1,"./say":3}],3:[function(require,module,exports){
"use strict";module.exports=function(o,s){console.log("%s, %s!",o,s)};

`
  },

  {
    name: 'modules',
    contents:
`'use strict';

var say = require('./say');

/**
 * Says hello.
 *
 * @param {string} [name] - Who to say hello to
 */
module.exports = function hello(name) {
  // This is NOT an important comment
  say('hello', name || 'world');
};

},{"./say":3}],2:[function(require,module,exports){
'use strict';

/**
 * @preserve This is an important comment
 */
module.exports = {
  say: require('./say'),
  hello: require('./hello-world')
};

},{"./hello-world":1,"./say":3}],3:[function(require,module,exports){
'use strict';

/**
 * Says something to somebody.
 *
 * @param {string} what - What to say
 * @param {string} [who] - Who to say goodbye to
 */
module.exports = function say(what, who) {
  //! This is an important comment
  // This is NOT an important comment
  console.log('%s, %s!', what, who);
};


`
  },
];
