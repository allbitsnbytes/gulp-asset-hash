# Gulp Asset Hash

Gulp plugin to hash filenames for static assets.  The hash is computed from the file contents so the hash only changes when the file actually changes.  A manifest file is generated which maps the original file path to the hashed file path. 

For example:  style.css  =>  style-g7ba80c.css



## Install

[![NPM](https://nodei.co/npm/gulp-asset-hash.png?mini=true)](https://nodei.co/npm/gulp-asset-hash/)



## Usage

```
var Gulp = require('gulp');
var Assets = require('gulp-asset-hash');

Gulp.task('images', function() {
	return Gulp.src('src/images/**/*')
		.pipe(Gulp.dest('assets/images');
		.pipe(Assets.hash())
		.pipe(Gulp.dest('assets/images');
});
```


## Methods

### .hash(options)

Hash filenames for files passed in based on the file's contents.



## Options

### length

Length of the hash to generate.

Type: string  
Default: 10


### replace

Whether to replace the origin file with hashed file or keep both.

Type: boolean  
Default: false


### template

The template to use to generate the hashed filename.

Type: string  
Default: '<%= name %>-<%= hash %>.<%= ext %>'