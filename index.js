/**
 * Gulp plugin to hash assets and generate asset manifest
 */

var assets		= require('asset_hash');
var through		= require('through2');
var util		= require('gulp-util');


/**
 * Create an instance of Gulp Asset Hash
 */
var GulpAssetHasher = function() {

	// Plugin name
	var PLUGIN_NAME = 'gulp-asset-hash';

	// Set default configuration
	assets.set({
		base: process.cwd(),
		hasher: 'sha1',
		hashKey: 'aH4uwG',
		length: 8,
		manifest: 'assets.json',
		path: process.cwd(),
		replace: false,
		save: false,
		template: '<%= name %>-<%= hash %>.<%= ext %>'
	});

	return {

 		/**
		 * Get configuration options or value for specified key
		 *
		 * @param {*} key The key to find values for.  If key is empty or not present in config an empty string will be returned.  If no key is specified/undefined the whole config object will be returned.
		 * @return {*} Config value for specified key or whole config object
		 */
		get : function(key) {
			return typeof key === 'undefined' ? assets.get() : assets.get(key);
		},


		/**
		 * Set configuration
		 *
		 * @param {object} options Config options to add or update
		 */
		set : function(options) {
			if (typeof options === 'object') {
				options.save = false;
				assets.set(options);
			}
		},


 		/**
		 * Hash files from provided stream
		 *
		 * @param {object} options The options to customize the hash
		 * @return {object} Returns stream (through object)
		 */
		hash : function(options) {
			options = options || {};
			options.save = false;

			return through.obj(function(file, enc, cb) {

				// If file is null continue
				if (file.isNull()) {
					cb(null, file);

					return;
				}

				file.hashed = false;

				// Hash file
				try {
					var result = assets.hashFiles(file.path, options);

					if (result.hashed) {
						file.originalPath = result.original;
						file.path = result.path;
						file.hashed = true;
					}
				}
				catch(error) {
					cb(util.PluginError(PLUGIN_NAME, error));

					return;
				}

				// Pass updated file and continue
				cb(null, file);
			}, function(done) {
				if (assets.get('manifest') !== false) {
					assets.saveManifest(options);
				}

				done();
			});
		},


 		/**
		 * Save manifest file
		 *
		 * @param {object} options The options to configure manifest file
		 * @return {object} Returns stream (through object)
		 */
		saveManifest : function(options) {
			options = options || {};

			return through.obj(function(file, enc, cb) {
				assets.saveManifest(options);

				cb(null, file);
			});
		},


		/**
		 * Get asset library for hashed files
		 *
		 * @return {object} The asset library
		 */
		getAssets : function() {
			return assets.getAssets();
		},


 		/**
		 * Reset asset library
		 *
		 * @return {object} Asset library
		 */
		resetAssets : function() {
			return assets.resetAssets();
		},


		/**
		 * Get a list of supported hash algorithms
		 *
		 * @return {array} Array of hashes
		 */
		getHashers : function() {
			return assets.getHashers();
		}
	};
};


/**
 * Export
 */
module.exports = GulpAssetHasher();