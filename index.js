/**
 * Gulp plugin to hash assets and generate asset manifest
 */

var _			= require('lodash');
var Hasher		= require('asset_hash');
var Through		= require('through2');
var Util		= require('gulp-util');


 /**
  * Create an instance of Gulp Asset Hash
  */
 var GulpAssetHasher = function() {

 	// Set default configuration
 	Hasher.set({

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
 		Hasher.set(options);
 	};


 	/**
 	 * Get configuration options or value for specified key
 	 *
 	 * @param {*} key The key to find values for.  If key is empty or not present in config an empty string will be returned.  If no key is specified/undefined the whole config object will be returned.
 	 * @return {*} Config value for specified key or whole config object
 	 */
 	var get = function(key) {
 		return typeof key === 'undefined' ? Hasher.get() : Hasher.get(key);
 	};


 	/**
 	 * Get a list of supported hash algorithms
 	 *
 	 * @return {array} Array of hashes
 	 */
 	var getHashers = function() {
 		return Hasher.getHashers();
 	};


 	/**
 	 * Hash files from provided stream
 	 *
 	 * @param {object} options The options to customize the hash
 	 * @return {object} Returns stream (through object)
 	 */
 	var hash = function(options) {
 		options = options || {};

 		return Through.obj(function(file, enc, cb) {

 			// If file is null continue
 			if (file.isNull()) {
 				cb(null, file);

 				return;
 			}

 			// If stream throw an error
 			if (file.isStream()) {
 				cb(new Util.PluginError('gulp-asset-hash', 'Sorry, streaming is not supported.'));

 				return;
 			}

 			file.assetHashed = false;

 			// Hash file
 			try {
 				var result = Hasher.hashFiles(file.path, options);

 				if (result.hashed) {
 					file.oldPath = result.original;
 					file.path = result.path;
 					file.assetHashed = true;
 				}
 			}
 			catch(error) {
 				cb(Util.PluginError('gulp-asset-hash', error));

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
 		return Hasher.getAssets();
 	};


 	/**
 	 * Reset asset library
 	 *
 	 * @return {object} Asset library
 	 */
 	var resetAssets = function() {
 		return Hasher.resetAssets();
 	};


 	/**
 	 * Save manifest file
 	 *
 	 * @param {object} options The options to configure manifest file
 	 * @return {object} Returns stream (through object)
 	 */
 	var saveManifest = function(options) {
 		options = _.isObject(options) ? options : {};

 		return Through.obj(function(file, enc, cb) {

 			// If file was hashed write out manifest
 			if (file.assetHashed) {
 				Hasher.saveManifest(options);
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