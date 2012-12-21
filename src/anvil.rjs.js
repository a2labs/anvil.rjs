module.exports = function( _, anvil ) {
	var requirejs;
	var path = require( "path" );

	anvil.plugin( {
		name: "anvil.rjs",
		description: "A r.js plugin for Anvil",
		activity: "rjs-build",
		config: {
			// Setting this to true enables r.js building
			run: false,

			// This is a custom sandbox for r.js
			working: "./.anvil/rjs",

			// These are r.js configuration options
			baseUrl: "./src",
			normalizeDirDefines: "skip"
		},

		// We need to override some r.js defaults,
		// and we don't allow these to be set by the users
		// of this plugin
		forcedConfig: {
			// Turn off minification/compilation
			optimize: "none",
			// Don't handle CSS
			optimizeCss: "none"
		},


		unsupportedOptions: [
			"appDir", "optimizeCss", "optimize", "cssImportIgnore", "cssIn", "out",
			"generateSourceMaps", "uglify"
		],

		// the config argument is the anvil.config file
		// the command object contains all command line options
		configure: function( config, command, done ) {
			this._config = config[ "anvil.rjs" ] || {};

			// Needs opt in
			if ( !this._config.run ) {
				done();
				return;
			}


			// Check if any unsupported configuration was used
			// This 
			var unsupported = _.intersection( _.keys( this._config ), this.unsupportedOptions );

			if ( unsupported.length ) {
				anvil.log.error( "You used the following unsupported configuration options for anvil.rjs:" );
				anvil.log.error( "  * " + unsupported.join( "\n  * ") );
				anvil.log.error( "anvil.rjs will not attempt a build until they are removed" );
				anvil.raise( "all:stop", -1);
				return;
			}
			
			_.deepExtend( this._config, this.forcedConfig );

			// Resolve paths
			_.each( [ "baseUrl", "working", "mainConfigFile", "dir" ], function ( key ) {
				if ( this._config[ key ] ) {
					this._config[ key ] = path.resolve( this._config[ key ]);
				}
			}, this);

			// Update input paths
			_.each( [ "baseUrl", "mainConfigFile" ], function ( key ) {
				if ( this._config[ key ] ) {
					this._config[ "_" + key ] = this._config[ key ];
					this._config[ key ] = this._config[ key ].replace( config.source, config.working );
				}
			}, this );

			this._config.dir = this._config.working;


			// Creates new activity after compile
			var index = _.indexOf( config.activityOrder, "compile" );
			config.activityOrder.splice( index + 1, 0, "rjs-build" );

			done();
		},

		run: function( done, activity ) {
			var _originalRequire = require;
			var self = this;

			requirejs = require( "requirejs" );
			
			anvil.fs.ensurePath( this._config.dir, function () {
				requirejs.optimize( self._config, function ( result ) {
					var res = result.trim().split( /\n\n/g );
					var pairs = {}, pair;

					for( var i = 0; i < res.length; i++ ) {
						pair = res[i].trim().split( /\n\-+\n/g );
						pairs[ pair[ 0 ] ] = pair[ 1 ].split( "\n" );
					}

					_.each( pairs, function ( files, output ) {
						_.each( files, function ( file ) {
							var path = anvil.fs.buildPath( [ self._config.baseUrl, file ] );

							var file = _.find( anvil.project.files, function ( f ) {
								var working = anvil.fs.buildPath([ f.workingPath, f.name ]);
								return path === working;
							});

							if ( file ) {
								file.noCopy = true;
							}
						});
					});


					anvil.fs.getFiles( self._config.working, self._config.working, function ( files, directories ) {
						_.each( files, function ( _file ) {
							var oldWorkingPath = anvil.fs.buildPath( [ self._config.baseUrl, _file.workingPath.replace( self._config.working, '' ) ] );
							var path = anvil.fs.buildPath( [ oldWorkingPath, _file.name ] );

							var file = _.find( anvil.project.files, function ( f ) {
								var working = anvil.fs.buildPath([ f.workingPath, f.name ]);
								return path === working;
							});

							if ( file ) {
								file.noCopy = false;
								file.workingPath = _file.workingPath;
							} else if ( !/min.js$/.test( _file.name )) {
								_file.relativePath = anvil.fs.buildPath( [ self._config.baseUrl.replace( anvil.config.working, "" ), _file.relativePath ]);
								anvil.project.files.push( _file );
							}
						});

						require = _originalRequire;
						done();
					}, [ "build.txt" ]);
				});
			})
		}

	} );	
};