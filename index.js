/**
 * Gulp plugin to hash assets and generate asset manifest
 */

var file		= require('vinyl-file');
var hasher		= require('../asset_hash/');
var through		= require('through2');
var util		= require('gulp-util');


 /**
  * Create an instance of Gulp Asset Hash
  */
 var GulpAssetHasher = function() {

 	return {};
 };


 /**
  * Export
  */
 module.exports = GulpAssetHasher();