Browserify Banner
============================
#### Add a comment (and/or code) to the top of your Browserify bundle

[![Build Status](https://api.travis-ci.org/BigstickCarpet/browserify-banner.svg?branch=master)](https://travis-ci.org/BigstickCarpet/browserify-banner)
[![Windows Build Status](https://ci.appveyor.com/api/projects/status/github/BigstickCarpet/browserify-banner?svg=true&branch=master&failingText=Windows%20build%20failing&passingText=Windows%20build%20passing)](https://ci.appveyor.com/project/BigstickCarpet/browserify-banner)

[![Coverage Status](https://coveralls.io/repos/github/BigstickCarpet/browserify-banner/badge.svg?branch=master)](https://coveralls.io/github/BigstickCarpet/browserify-banner?branch=master)
[![Codacy Score](https://www.codacy.com/project/badge/d20aa8b830124acb87b5e6f2114f0d84)](https://www.codacy.com/public/jamesmessinger/browserify-banner)
[![Inline docs](http://inch-ci.org/github/BigstickCarpet/browserify-banner.svg?branch=master&style=shields)](http://inch-ci.org/github/BigstickCarpet/browserify-banner)
[![Dependencies](https://david-dm.org/BigstickCarpet/browserify-banner.svg)](https://david-dm.org/BigstickCarpet/browserify-banner)

[![npm](http://img.shields.io/npm/v/browserify-banner.svg)](https://www.npmjs.com/package/browserify-banner)
[![License](https://img.shields.io/npm/l/browserify-banner.svg)](LICENSE)

Features
--------------------------
* Customize your banner text using [Lodash templates](https://lodash.com/docs/4.16.6#template) and [Moment.js](http://momentjs.com/)
* Inject any value from your package.json file into the banner
* Include JavaScript code to be run before your bundle is loaded
* Works with source maps (Browserify's `--debug` option)



Example
--------------------------
Here's an example banner template (can be in a file, passed via command-line, or set programmatically):

```
<%= _.startCase(pkg.name) %> v<%= pkg.version %> (<%= moment().format('MMMM Do YYYY') %>)
<%= pkg.description %>

<%= pkg.homepage %>

@author  <%= pkg.author.name %> (<%= pkg.author.url %>)
@license <%= pkg.license %>
```

And here's what the banner would look like at the top of the Browserify bundle:

```javascript
/*!
 * My Library v1.23.456 (November 24th 2016)
 * Lorem ipsum dolor sit amet, consectetur adipiscing malesuada ac elit.
 *
 * http://mycompany.com/my-library
 *
 * @author  John Doe (http://linkedin.com/john-doe)
 * @license MIT
 */
```



Related Projects
--------------------------
* [globify](https://www.npmjs.com/package/globify) - Run browserify and watchify with globs - even on Windows
* [sourcemapify](https://www.npmjs.com/package/sourcemapify) - Sourcemap plugin for Browserify
* [simplifyify](https://www.npmjs.com/package/simplifyify) - A simplified Browserify and Watchify CLI


Installation
--------------------------
Install using [npm](https://docs.npmjs.com/getting-started/what-is-npm):

```bash
npm install browserify-banner
```


Usage
--------------------------
### Command Line
If used without any options, then it will automatically search for a file named "banner.txt".

```bash
browserify -p browserify-banner
```

Or you can use Browserify's sub-argument command-line syntax to specify a different file:

```bash
browserify -p [ browserify-banner --file src/license.txt ]
```

Or you can specify the banner template directly:

```bash
browserify -p [ browserify-banner --template "<%= pkg.name %> v<%= pkg.version %>" ]
```

### Browserify API
Use the plugin programmatically like this:

```javascript
var browserify = require('browserify');
var banner = require('browserify-banner');

browserify({debug: true})
  .plugin(banner, {
    // Custom object to use instead of the package.json file
    pkg: {
      name: 'My Library',
      version: '1.23.456',
      author: {
        name: 'John Doe'
      }
    },

    // Path to template file (defaults to "banner.txt")
    file: 'path/to/my/banner/file.txt',

    // Or just set the template directly (will be wrapped in a comment block)
    template: '<%= pkg.name %> v<%= pkg.version %>\n' +
              '<%= moment().format('MMMM Do YYYY') %>',

    // Or set the banner directly (will NOT be wrapped in a comment block)
    banner: '// This banner is NOT a template, so <%= this.doesnt.do.anything %>.\n' +
            '// But I can inject custom code at the top of the bundle...\n' +
            'window.myCustomVariable = Date.now();\n'
  })
  .bundle()
  .pipe(fs.createWriteStream('bundle.js', 'utf8'));
```


Options
--------------------------
#### `file` (string)
The path of a file to load the banner template from.  The contents of this file are read and assigned to the `template` option. By default, `browserify-banner` will search for a file named "banner.txt", starting in the directory of your bundle's entry file, and crawling up the directory tree from there.

#### `package` (string or object)
The path of the package.json file to apply to the banner template.  Or you can set it to an object that will be applied as-is to the template.  By default, `browserify-banner` will use the first package.json file that is loaded by Browserify, which is usually the one associated with your bundle's entry file.

#### `template` (string)
A [Lodash template](https://lodash.com/docs/4.16.6#template) that will be used to create your bundle's banner. By default, this property is automatically set to the contents of the `file` option, but if you set `template` option, then it overrides the `file` option.

This template can use `<%= code.blocks %>` to inject variables into the banner. The template has access to the package.json file (e.g. `pkg.name`, `pkg.version`, etc). It also has access to all [Lodash methods](https://lodash.com/docs/4.16.6) (e.g. `_.filter()`, `_.map()`, etc.) and the [Moment.js](http://momentjs.com/) library (e.g. `moment.format()`, `moment().startOf()`, etc).

__Note:__ The template will automatically be wrapped in a comment block, unless it already starts with a comment.  If your template contains JavaScript code that you want to be executed at the top of your bundle, then make sure that you start your code with a comment.

#### `banner` (string)
If this option is set, then all other options are ignored and this banner is injected as-is at the top of your bundle. No modification is made to this text, so it's up to you to make sure that it contains valid comments and/or code.


Contributing
--------------------------
I welcome any contributions, enhancements, and bug-fixes.  [File an issue](https://github.com/BigstickCarpet/browserify-banner/issues) on GitHub and [submit a pull request](https://github.com/BigstickCarpet/browserify-banner/pulls).

#### Building
To build the project locally on your computer:

1. __Clone this repo__<br>
`git clone https://github.com/bigstickcarpet/browserify-banner.git`

2. __Install dependencies__<br>
`npm install`

3. __Link the module to itself__ (so Browserify can find the plugin)<br>
`npm link`<br>
`npm link browserify-banner`

4. __Run the tests__<br>
`npm test`



License
--------------------------
browserify-banner is 100% free and open-source, under the [MIT license](LICENSE). Use it however you want.

