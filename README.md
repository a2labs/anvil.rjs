# anvil.rjs
## Version 0.1

A scaled down integration of `r.js` builds for [Anvil](http://anvil-js.com).

Currently, only a subset of the `r.js` features and options are supported. 

**No support planned:**

* `optimize` and `optimizeCss` (Including `uglify`) – Anvil has both `uglify` and css minification plugins, so there is no need to provide support for these r.js features within anvil
* `cssIn`, `cssImportIgnore` – Again, anvil will handle the CSS

**No support currently:**

* `appDir` - Use baseUrl
* `out` - As a work around, just define a single module in the modules array.
* `dir` - Anvil auto supplies this value. It is set to place files in anvil's output directory in the same hierarchy as the input files. 

**Supported settings:**

* `run`: Set to `true` to opt in. Setting to `false` disables the `anvil.rjs` build,
* `baseUrl`: A path, relative to build.json file, that serves as the base for most of the other paths in this file
* `mainConfigFile`: A path, relative to the build.json file of your main.js config file. The first config block found will be used. This allows you to leverage existing setup. You can override settings in main.js by specifying the new values in this config block.
* `modules`: Currently, `out` for a single file is not supported, so you need to define at least one module. See r.js documentation for what this looks like.
* `paths`: Define or redefine paths
* `shim`: Define or redefine your shims for non-AMD modules
* `removeCombined`: If set to `true`, it removes files that were included in a compiled file. If set to `false` (default) the compiled and original files live side by side in your output directory (except where there were naming conflicts)

## Installation

```sh
$ anvil install anvil.rjs
```

If that fails, it may mean this repository has not yet been published to npm. In that case, follow the steps below.

**Installation from Github:**

```sh
$ git clone git://github.com/a2labs/anvil.rjs.git
$ cd anvil.rjs
$ npm link
```

Then, in the directory you want to use this plugin with, run:

```sh
$ npm link anvil.rjs
```

And add the following to your `build.json`:

```javascript
	"extensions": {
		"local": [ "anvil.rjs" ]
	}
```

## Configuration

You need to opt-in in your `build.json` file:

```javascript
{
	"anvil.rjs": {
		"run": true
	}
}
```

However, actual usage will include additional values.

If your directory is setup the way anvil is configured by default ( `src` compiles to `lib` ) then your build file might look like this:

```javascript
{
	"anvil.rjs": {
		"run": true,
		"baseUrl": "src/js",
		"mainConfigFile": "src/js/main.js",
		"modules": [
			{
				"name": "main"
			}
		],
		"removeCombined": true
	}
}
```

Instead of passing in your `main.js` you can provide the `paths` and `shim` config right in the build.json:

```javascript
{
	"anvil.rjs": {
		"run": true,
		"baseUrl": "src/js",
		"removeCombined": true,
		"paths": {
			"jquery": "require-jquery",
			"underscore": "libs/underscore", 
			"backbone": "libs/backbone"
		},

		"modules": [
			{
				"name": "require-jquery"
			},
			{
				"name": "main",
				"exclude": ["jquery"]
			}
		],

		"shim": {
			"backbone": {
				"deps": ["jquery", "underscore"],
				"exports": "Backbone"
			},
			"underscore": {
				"exports": "_"
			}
		}
	}
}
```

### Usage

Once your `build.json` is properly configured, just run:

```sh
$ anvil
```

If you want to have anvil automatically process your files anytime one changes, just run:

```sh
$ anvil --ci
```

## Development

This repository uses the [Anvil build system](http://github.com/anviljs/anvil.js). It is not included as dependency as `anvil` is normally installed globally.  To install `anvil`:

```sh
npm install -g anvil
```

To run the build (Takes the files from `src` and builds them into `lib`):

```sh
anvil
```

To run the build continually after each change:

```sh
anvil --ci
```

## License

This project is available under a dual license of MIT or GPL v2.0

---

Copyright (c) 2012 appendTo (MIT License)

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

See the MIT License for more details: http://opensource.org/licenses/MIT

---

Copyright (C) 2012 appendTo (GPL v2.0 License)

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or (at
your option) any later version.

This program is distributed in the hope that it will be useful, but
WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
or FITNESS FOR A PARTICULAR PURPOSE.

See the GNU General Public License for more details:
http://opensource.org/licenses/GPL-2.0