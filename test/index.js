/**
 * Test Gulp Asset Hash
 */

var _			= require('lodash');
var expect		= require('chai').expect;
var fs			= require('fs');
var glob		= require('glob');
var hasher		= require('../');
var path		= require('path');
var util		= require('gulp-util');


// Test variables

var tmpDir		= './tmp/';
var testFiles	= [];


// Utility Functions

/**
 * Create fresh copies of all test files and initialize the testFiles array with file objects
 */
function initTestFiles() {
	var files	= [
		path.join(tmpDir, 'css/style.css'),
		path.join(tmpDir, 'css/bootstrap.min.css'),
		path.join(tmpDir, 'js/main.js'),
		path.join(tmpDir, 'js/shoestring.min.js'),
		path.join(tmpDir, 'img/logo.png'),
		path.join(tmpDir, 'img/profile.png'),
		path.join(tmpDir, 'img/favicon.ico'),
		path.join(tmpDir, 'file/brochure.pdf')
	];

	testFiles = [];

	// Loop and add files
	files.forEach(function(file, index) {
		var filePath 	= path.dirname(file).split('/');
		var content		= 'test file: ' + index;
		var curDir 		= '';

		// Create parent directories for file if necessary
		while (filePath.length > 0) {
			curDir = path.join(curDir, filePath.shift());

			try {
				fs.lstatSync(curDir);
			} 
			catch(e) {
				fs.mkdirSync(curDir);
			}
		}	

		fs.writeFileSync(file, content);
		testFiles.push(new util.File({
			path: file,
			contents: new Buffer(content)
		}))
	});
}

/**
 * Remove all test files and clean up
 * 
 * @param {string} filePath The path to directory to remove.  If none provided tmpDir will be used
 */
function cleanupTestFiles(filePath) {
	var files = [];

	filePath = filePath || path.normalize(tmpDir);

	if (fs.lstatSync(filePath).isDirectory()) {
		files = fs.readdirSync(filePath);

		files.forEach(function(file, index) {
			var curPath = path.join(filePath, file);

			if (fs.lstatSync(curPath).isDirectory()) { 
				cleanupTestFiles(curPath);
			} else {
				fs.unlinkSync(curPath);
			}
		});

		fs.rmdirSync(filePath);
    }
}


describe('Test if Gulp Asset Hash is defined', function() {

	it('Should be an object', function() {
		expect(hasher).to.exist.and.be.an('object');
	})

})


describe('Test if methods exist', function() {

	var methods = ['get', 'getAssets', 'set', 'hash', 'saveManifest'];

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
		var defaults = ['hasher', 'length', 'manifest', 'replace', 'save', 'template'];
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

	beforeEach(function() {
		initTestFiles();
	})

	afterEach(function() {
		cleanupTestFiles();
	})

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

	it('Should have a valid template format', function(done) {
		hasher.set({template: '<%= name %>_<%= hash %>.<%= ext %>'});

		var stream = hasher.hash();

		stream.on('data', function(file) {
			var hash = path.basename(file.path, path.extname(file.path)).replace(path.basename(file.oldPath, path.extname(file.oldPath)) + '_', '');
			
			expect(file.oldPath).to.equal(file.path.replace('_' + hash, ''));

			done();
		});

		stream.write(testFiles[0]);
	})

})


describe('Test hashing functionality', function() {

	beforeEach(function() {
		initTestFiles();
	})

	afterEach(function() {
		cleanupTestFiles();
	})

	it('Should hash a single file', function(done) {
		var stream = hasher.hash();

		stream.on('data', function(file) {
			expect(file.assetHashed).to.be.true;
			expect(file.path).to.not.equal(file.oldPath);

			done();
		});

		stream.write(testFiles[0]);
	})

	it('Should hash multiple files', function(done) {
		var count = 0;
		var stream = hasher.hash();

		stream.on('data', function(file) {
			count++

			expect(file.assetHashed).to.be.true;
			expect(file.path).to.not.equal(file.oldPath);

			if (count == testFiles.length)
				done();
		});

		testFiles.forEach(function(file) {
			stream.write(file);
		});
	})

	it.skip('Should hash a file twice and remove the previous hashed file', function(done) {
		var stream = hasher.hash();

		stream.on('data', function(file) {

		});
	})

	it('Should hash a file and remove the original', function(done) {
		var stream = hasher.hash({
			replace: true
		});

		stream.on('data', function(file) {
			expect(fs.lstatSync.bind(fs.lstatSync, file.oldPath)).to.throw(Error, 'ENOENT, no such file or directory');

			done();
		})

		stream.write(testFiles[0]);
	})

})


describe('Test manifest file', function() {

	beforeEach(function() {
		initTestFiles();
	})

	afterEach(function() {
		cleanupTestFiles();
	})

	it('Should return an object for assets', function() {
		expect(hasher.getAssets()).to.be.an('object');
	})

	it.skip('Should create a manifest file', function(done) {
		var stream = hasher.hash();

		stream.on('data', function(file) {
			done();
		});

		stream.write(testFiles[0]);
	})

	it.skip('Should have all hashed files in manifest file', function(done) {

	})

})