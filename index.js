/**
 * Gulp plugin to hash assets and generate asset manifest
 */

var _			= require('lodash');
var file		= require('vinyl-file');
var hasher		= require('../asset_hash/');
var through		= require('through2');
var util		= require('gulp-util');


 /**
  * Create an instance of Gulp Asset Hash
  */
 var GulpAssetHasher = function() {

 	// Set default configuration
 	hasher.set({

 		// The default algorithm to use to generate hash
 		// Options are those available from node's crypto library, getHashes() method
 		hasher: 'sha1',

 		// Length of the hash string generation
 		length: 10,

 		// Whether to replace original file or keep it after hashed file is generated
 		replace: false,

 		// Name to use for the manifest file
 		manifest: 'assets.json',

 		// Template to use for the hashed file
 		// Available variables are:  
 		// - name		Name of the file
 		// - hash		The hash string generated for the file
 		// - ext		The extension of the file
 		template: '<%= name %>-<%= hash %>.<%= ext %>',

 		// Skip creation of hashed file when file hash is generated
 		save: false
 	});


 	/**
 	 * Set configuration
 	 *
 	 * @param {object} options Config options to add or update
 	 */
 	var set = function(options) {
 		hasher.set(options);
 	};


 	/**
 	 * Get configuration options or value for specified key
 	 *
 	 * @param {*} key The key to find values for.  If key is empty or not present in config an empty string will be returned.  If no key is specified/undefined the whole config object will be returned.
 	 * @return {*} Config value for specified key or whole config object
 	 */
 	var get = function(key) {
 		return typeof key === 'undefined' ? hasher.get() : hasher.get(key);
 	};


 	/**
 	 * Get a list of supported hash algorithms
 	 *
 	 * @return {array} Array of hashes
 	 */
 	var getHashers = function() {
 		return hasher.getHashers();
 	}


 	/**
 	 * Hash files from provided stream
 	 *
 	 * @param {object} options The options to customize the hash
 	 * @return {object} Returns stream (through object)
 	 */
 	var hash = function(options) {
 		options = _.isObject(options) ? options : {};

 		return through.obj(function(file, enc, cb) {

 			// If file is null continue
 			if (file.isNull()) {
 				cb(null, file);

 				return;
 			}

 			// If stream throw an error
 			if (file.isStream()) {
 				cb(new util.PluginError('gulp-asset-hash', 'Sorry, streaming is not supported.'));

 				return;
 			}

 			file.assetHashed = false;

 			// Hash file
 			try {
 				var result = hasher.hashFiles(file.path, options);

 				if (result.hashed) {
 					file.oldPath = result.original;
 					file.path = result.path;
 					file.assetHashed = true;
 				}
 			}
 			catch(error) {
 				cb(util.PluginError('gulp-asset-hash', error));

 				return;
 			}

 			// Pass updated file and continue
 			cb(null, file);
 		});
 	};


 	/**
 	 * Get asset library for hashed files
 	 *
 	 * @return {object} The asset library
 	 */
 	var getAssets = function() {
 		return hasher.getAssets();
 	};


 	/**
 	 * Reset asset library
 	 *
 	 * @return {object} Asset library
 	 */
 	var resetAssets = function() {
 		return hasher.resetAssets();
 	};


 	/**
 	 * Save manifest file
 	 *
 	 * @param {object} options The options to configure manifest file
 	 * @return {object} Returns stream (through object)
 	 */
 	var saveManifest = function(options) {
 		options = _.isObject(options) ? options : {};

 		return through.obj(function(file, enc, cb) {

 			// If file was hashed write out manifest
 			if (file.assetHashed) {
 				hasher.saveManifest(options);
 			}

 			cb(null, file);
 		});
 	};


 	return {
 		get: get,
 		set: set,
 		hash: hash,
 		getAssets: getAssets,
 		resetAssets: resetAssets,
 		saveManifest: saveManifest,
 		getHashers: getHashers
 	};
 };


 /**
  * Export
  */
 module.exports = GulpAssetHasher();