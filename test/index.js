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
	// Paths for test files to create
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

	// Reset asset library and clear testFiles array
	hasher.resetAssets();
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

		// Write file to file system add to testFiles array
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
    } else if(fs.lstatSync(filePath).isFile()) {
    	fs.rmdirSync(filePath);
    }
}


/**
 * Hash provided file and return stream.
 *
 * @param {object} file File object to pass to stream
 * @param {object} options Options to pass in to hasher
 * @param {function} done Function to call
 * @return {stream}
 */
function hashFile(file, options, done) {
	if (_.isFunction(options)) {
		done = options;
		options = {};
	}

	// Get hash stream
	var stream = hasher.hash(options);

	stream.on('data', function(file) {

		// Write hashed file to file system
		fs.writeFileSync(file.path, file.content);

		if (_.isFunction(done)) {
			done(file);
		}
	});

	stream.write(file);

	return stream;
}


/**
 * Save manifest
 *
 * @param {object} 		file File object to pass to stream
 * @param {function} 	options Options to pass in to hasher
 * @param {function}  	done Function to call
 * @return {stream}
 */
function saveManifest(file, options, done) {
	if (_.isFunction(options)) {
		done = options;
		options = {};
	}

	// Get saveManifest stream
	var stream = hasher.saveManifest(options);

	stream.on('data', function(file) {
		done(file);
	});

	stream.write(file);

	return stream;
}


/**
 * Run tests to check if manifest file is valid
 */
function testValidManifest() {
	var assets = hasher.getAssets();
	var manifest = path.join(hasher.get('path'), hasher.get('manifest'));
	var manifestAssets = JSON.parse(fs.readFileSync(manifest));

	expect(fs.lstatSync(manifest).isFile()).to.exist;
	expect(_.size(manifestAssets)).to.equal(_.size(assets));
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
		expect(hasher.get('length')).to.be.a('number').and.be.at.least(8);
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

		hashFile(testFiles[0], function(file) {
			var hash = path.basename(file.path, path.extname(file.path)).replace(path.basename(file.originalPath, path.extname(file.originalPath)) + '_', '');

			expect(file.originalPath).to.equal(file.path.replace('_' + hash, ''));

			done();
		});
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
		hashFile(testFiles[0], function(file) {
			expect(file.hashed).to.be.true;
			expect(fs.lstatSync(file.path).isFile()).to.be.true;

			done();
		});
	})

	it('Should hash multiple files', function(done) {
		var count = 0;
		var total = testFiles.length;

		testFiles.forEach(function(testFile) {
			hashFile(testFile, function(file) {
				count++;

				expect(file.hashed).to.be.true;
				expect(fs.lstatSync(file.path).isFile()).to.be.true;

				if (count === total) {
					done();
				}
			});
		});
	})

	it('Should hash a file twice and remove the previous hashed file', function(done) {
		var originalPath = '';
		var originalFile = testFiles[1].clone();

		hashFile(testFiles[1], function(file) {
			expect(file.path).to.not.equal(file.original);

			originalPath = file.path;
			fs.writeFileSync(originalFile.path, 'new content so hash will change');

			hashFile(originalFile, function(file) {
				expect(file.path).to.not.equal(originalPath);
				expect(fs.lstatSync.bind(fs.lstatSync, originalPath)).to.throw(Error, 'ENOENT, no such file or directory');

				done();
			});
		});
	})

	it('Should hash a file and remove the original', function(done) {
		hashFile(testFiles[0], {replace: true}, function(file) {
			expect(fs.lstatSync.bind(fs.lstatSync, file.originalPath)).to.throw(Error, 'ENOENT, no such file or directory');

			done();
		});
	})

})


describe('Test manifest file', function() {

	beforeEach(function() {
		initTestFiles();

		// Set path where to save manifest
		hasher.set({path: tmpDir});
	})

	afterEach(function() {
		cleanupTestFiles();
	})

	it('Should return an object for asset library', function(done) {
		hashFile(testFiles[0], function(file) {
			var assets = hasher.getAssets();

			expect(assets).to.be.an('object');
			expect(_.size(assets)).to.equal(1);

			done();
		});
	})

	it('Should reset asset library', function(done) {
		hashFile(testFiles[0], function(file) {
			expect(_.size(hasher.getAssets())).to.equal(1);

			// Reset asset library then check size
			hasher.resetAssets();

			expect(_.size(hasher.getAssets())).to.equal(0);

			done();
		});
	})

	it('Should create a manifest file', function(done) {
		hashFile(testFiles[1], function(file) {
			saveManifest(file, function(file) {
				testValidManifest();

				done();
			});
		});
	})

	it('Should have all hashed files in manifest file', function(done) {
		var count = 0;
		var total = testFiles.length;

		testFiles.forEach(function(testFile) {
			hashFile(testFile, function(file) {
				saveManifest(file, function(file) {
					count++;

					testValidManifest();

					if (count === total) {
						done();
					}
				});
			});
		});
	})

})