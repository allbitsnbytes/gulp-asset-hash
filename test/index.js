/**
 * Test Gulp Asset Hash
 */

var _			= require('lodash');
var expect		= require('chai').expect;
var fs			= require('fs');
var glob		= require('glob');
var hasher		= require('../');
var path		= require('path');


// Test variables

var tmpDir		= './tmp/';


// Utility Functions

/**
 * Clean up  test environment
 * @param {string} path The path to directory to remove
 */
function removeTestDir(path) {
	var files = [];

	if(fs.lstatSync(path).isDirectory()) {
		files = fs.readdirSync(path);

		files.forEach(function(file, index) {
			var curPath = path + "/" + file;

			if(fs.lstatSync(curPath).isDirectory()) { 
				removeTestDir(curPath);
			} else {
				fs.unlinkSync(curPath);
			}
		});

		fs.rmdirSync(path);
    }
}

/**
 * Add test files
 * @param {array} files Test files to create
 */
function addTestFiles(files) {
	if (!_.isArray(files)) {
		files = [files];
	}

	// Loop and add files
	files.forEach(function(file, index) {
		var filePath 	= path.dirname(file).split('/');
		var curDir 		= '';

		// Create parent directories for file if necessary
		while (filePath.length > 0) {
			curDir += filePath.shift();

			try {
				fs.lstatSync(curDir);
			} 
			catch(e) {
				fs.mkdirSync(curDir);
			}
			
			curDir += '/';
		}	

		fs.writeFileSync(file, 'test file '+index);
	});
}

/**
 * Remove test files
 * @param  {array} files The files to remove
 */
function removeTestFiles(files) {
	if (!_.isArray(files)) {
		files = [files];
	}

	files.forEach(function(file, index) {
		fs.unlinkSync(file);
	});
}


describe('Test if Gulp Asset Hash is defined', function() {

	it('Should be an object', function() {
		expect(hasher).to.exist.and.be.an('object');
	})

})


describe('Test if methods exist', function() {

	var methods = ['get', 'set', 'hash', 'saveManifest'];

	methods.forEach(function(method) {
		it('Should have method: ' + method, function() {
			expect(hasher[method]).to.be.a('function');
		})
	});

})


describe('Test config functionality', function() {

	it('Should get all config', function() {
		var config = hasher.get();

		expect(config).to.be.an('object');
	})

	it('Should have default config values', function() {
		var defaults = ['hasher', 'length', 'manifest', 'replace', 'template'];
		var config = hasher.get();

		defaults.forEach(function(property) {
			expect(config).to.have.ownProperty(property);
		})
	})

	it('Should get config value for specified key', function() {
		var value = hasher.get('hasher');

		expect(value).to.not.be.empty;
	})

	it('Should return empty for invalid key', function() {
		var value = hasher.get('an-invalid-key-aubpasdyp12y3hkashdf');

		expect(value).to.be.empty;
	})

	it('Should set config value', function() {
		hasher.set({testkey1: 'testvalue1'});
		hasher.set({testkey2: 'testvalue2'});

		expect(hasher.get('testkey1')).to.equal('testvalue1');
		expect(hasher.get('testkey2')).to.equal('testvalue2');
	})

})


describe('Test default config values', function() {

	it('Should have a valid hasher', function() {
		var hashers = hasher.getHashers();
		var myHasher = hasher.get('hasher');

		expect(myHasher).to.be.a('string');
		expect(hashers).to.be.an('array').and.contains(myHasher);
	})

	it('Should have a valid length', function() {
		expect(hasher.get('length')).to.be.a('number').and.be.at.least(10);
	})

	it('Should have a manifest file', function() {
		expect(hasher.get('manifest')).to.match(/[a-zA-Z-0-9_\/-]+\.json/);
	})

	it('Should have a boolean replace value', function() {
		expect(hasher.get('replace')).to.be.a('boolean');
	})

	it('Should have a hashed filename template', function() {
		expect(hasher.get('template')).to.not.be.empty;
	})

	it.skip('Should have a valid template format', function() {
		hasher.set('{{name}}-{{hash}}.{{ext}}');

	})

})


describe('Test hashing functionality', function() {

	beforeEach(function() {
		addTestFiles(testFiles);
	})

	afterEach(function() {
		removeTestDir(tmpDir);
	})

	it.skip('Should hash a single file', function() {

	})

	it.skip('Should hash multiple files', function() {

	})

	it.skip('Should hash a file twice and remove the previous hashed file', function() {

	})

})


describe('Test manifest file', function() {

	beforeEach(function() {
		addTestFiles(testFiles);
	})

	afterEach(function() {
		removeTestDir(tmpDir);
	})

	it.skip('Should create a manifest file', function() {

	})

	it.skip('Should have all hashed files in manifest file', function() {

	})

})