'use strict';

// -----------------------------------------------------------------------------
// Configuration
// -----------------------------------------------------------------------------

var sassInput = [
  'src/_config.scss',
  'src/helpers/*.scss',
  'src/plugins/*.scss',
  'src/_media.scss'
];

var sassdocOptions = {
  config: './.sassdocrc',
  verbose: true,
  dest: './sassdoc/documentation'
};


// -----------------------------------------------------------------------------
// Dependencies
// -----------------------------------------------------------------------------

var fs = require('fs');
var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var packageInfo = require('./package.json');
var sassdoc = require('sassdoc');
var path = require('path');
var gh = require('gh-pages');


// -----------------------------------------------------------------------------
// Dist
// -----------------------------------------------------------------------------

gulp.task('build', function () {
  return gulp
    .src(sassInput)
    .pipe(plugins.concat('_include-media.scss'))
    .pipe(plugins.header(fs.readFileSync('./banner.txt', 'utf-8')))
    .pipe(plugins.replace(/@version@/, packageInfo.version))
    .pipe(gulp.dest('./dist'));
});


// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

gulp.task('test:libsass', function () {
  return gulp
    .src(['./tests/*.scss'])
    .pipe(plugins.sass());
});

gulp.task('test:rubysass', function () {
  return plugins
    .rubySass('./tests', { stopOnError: true })
    .on('error', function (err) {
      process.exit(1);
    });
});


gulp.task('test', ['test:libsass', 'test:rubysass']);


// -----------------------------------------------------------------------------
// Sass API documentation
// -----------------------------------------------------------------------------

gulp.task('sassdoc', function () {
  return gulp
    .src(sassInput)
    .pipe(sassdoc(sassdocOptions))
    .resume();
});


// -----------------------------------------------------------------------------
// GH-pages task
// -----------------------------------------------------------------------------

gulp.task('gh-pages', ['build', 'sassdoc'], function () {
  gh.publish(path.join(__dirname, 'sassdoc'), {
    add: true,
    message: 'Updated SassDoc'
  }, function(err) {
    if (err) console.log(err);
  });
});


// -----------------------------------------------------------------------------
// Default task
// -----------------------------------------------------------------------------

gulp.task('default', ['build', 'test']);


// -----------------------------------------------------------------------------
// Deploy documentation task
// -----------------------------------------------------------------------------

gulp.task('deploy', ['gh-pages']);
