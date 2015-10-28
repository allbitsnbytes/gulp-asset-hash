# Gulp Asset Hash

Gulp plugin to hash filenames for static assets.  The hash is computed from the file contents so the hash only changes when the file actually changes.  A manifest file is generated which maps the original file path to the hashed file path.

For example:  style.css  =>  style-g7ba80c.css



## Install

[![NPM](https://nodei.co/npm/gulp-asset-hash.png?mini=true)](https://nodei.co/npm/gulp-asset-hash/)



## Usage

With default options.

```
var Gulp = require('gulp');
var Assets = require('gulp-asset-hash');

Gulp.task('images', function() {
	return Gulp.src('src/images/**/*')
		.pipe(Gulp.dest('assets/images')
		.pipe(Assets.hash())
		.pipe(Gulp.dest('assets/images');
});
```

With custom options.

```
var Gulp = require('gulp');
var Assets = require('gulp-asset-hash');

Gulp.task('images', function() {
	return Gulp.src('src/images/**/*')
		.pipe(Gulp.dest('assets/images')
		.pipe(Assets.hash({
			manifest: 'asset-manifest.json',
			hashKey: 'g8Yz',
			hasher: 'md5'
		}))
		.pipe(Gulp.dest('assets/images');
});
```


## Methods

### .hash(options)

Hash filenames and generate asset manifest file.  Hash is based on file content so it only changes when the actual file changes.  To disable generation of manifest file, set manifest option to false.


### .get(key)

Get value for specified configuration option.

```
Assets.get('length');
```


### .set(options)

Update configuration options for asset hasher.

```
Assets.set({
	manifest: 'images.json',
	path: 'assets/img',
	replace: true
});
```


## Options

### hasher

The hash algorithm to use when generating content hash.  Supported algorithms include md5, sha1, sha256, sha512, ... (Node crypto algorithms).

Type: String
Default: ` sha1 `


### length

Length of the hash to generate.

Type: string
Default: ` 8 `


### hashKey

The hash key is prepended to the generated hash.

Type: string
Default: ` aH4uwG `


### manifest

The name ot use for the manifest file.  If this value is false the manifest file won't be saved.

Type: string
Default: ` assets.json `


### path

The path where to save the manifest file.

Type: string
Default: ` process.cwd() `


### replace

Whether to replace the origin file with hashed file or keep both.

Type: boolean
Default: ` false `


### template

The template to use to generate the hashed filename.

Type: string
Default: ` <%= name %>-<%= hash %>.<%= ext %> `



## FAQS

#### I don't want the manifest file generated?

To disable manifest file generation, pass the option manifest set as false.

```
var Assets = require('gulp-asset-hash');

Assets.set({
	manifest: false
});
```


#### I want to save the manifest file in my assets directory?

By default the manifest file will be saved in the directory where the gulpfile.js is.  If you want to save it in another directory, set the path option.

```
...
.pipe(Assets.hash({
	path: 'assets'
}))
...
```


## Change Log

### [0.2.0] - 2015-10-27
#### Feature
- Added hashKey config option.  This makes it easier to manage old hashed files.

#### Misc
- Updated dependency versions.