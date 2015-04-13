/**
 * Test Gulp Asset Hash
 */

var _			= require('lodash');
var expect		= require('chai').expect;
var fs			= require('fs');
var glob		= require('glob');
var hasher		= require('../asset_hash/');
var path		= require('path');


// Test variables

var tmpDir		= './tmp/';


// Utility Functions

// TODO:  Add utility functions as needed


description('Check if Gulp Asset Hash is defined', function() {

	it('Should be an object', function() {
		expect(hasher).to.exist.and.be.an.object('object');
	})
	
})