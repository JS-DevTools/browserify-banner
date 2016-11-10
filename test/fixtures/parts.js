/* eslint quotes:off */
'use strict';

require('chai').should();

module.exports = {
  split: splitBundleIntoParts,
  expect: expectParts,
};

/**
 * Asserts that the given bundle consists of the expected parts
 *
 * @param {string} bundle - The JavaScript bundle
 * @param {string[]} expectedParts - An array of the named parts that are expected
 */
function expectParts (bundle, expectedParts) {
  let actualParts = splitBundleIntoParts(bundle);

  // If the last part is just the terminator, then ignore it
  if (actualParts[actualParts.length - 1] === ';\n') {
    actualParts.pop();
  }

  actualParts.should.deep.equal(expectedParts);
}

/**
 * Returns an array containing the parts that make-up the given bundle
 *
 * @param {string} bundle
 * @returns {string[]}
 */
function splitBundleIntoParts (bundle) {
  let parts = [];

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
`(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
`
  },

  {
    name: 'postlude',
    contents:
`},{}]},{},[2])`
  },

  {
    name: 'umd prelude',
    contents:
`(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}(g.Fizz || (g.Fizz = {})).Buzz = f()}})(function(){var define,module,exports;return `
  },

  {
    name: 'umd postlude',
    contents:
`(2)
});`
  },

  {
    name: 'sourcemap',
    contents:
`
//# sourceMappingURL=bundle.js.map
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

