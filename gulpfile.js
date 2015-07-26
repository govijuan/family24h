// Meu
var fs = require('fs');
var path = require('path');

var gulp = require('gulp');

// var pkg = require('./package.json');

// Load all gulp plugins automatically
// and attach them to the `plugins` object
var plugins = require('gulp-load-plugins')();

// Temporary solution until gulp 4
// https://github.com/gulpjs/gulp/issues/355
var runSequence = require('run-sequence');
var browserSync = require('browser-sync').create();
var del = require('del');


var src = {
    base: './src',
    haml: './src/**/*.haml',
    scss: './src/assets/stylesheets/**/*.scss',
    scripts: './src/assets/scripts/**/*.js',
    images: './src/assets/images/**/*',
    fonts: './src/assets/fonts/**/*',
};

var dist = {
    base: './dist',
    haml: './dist/**/*.haml',
    scss: './dist/assets/stylesheets/',
    scripts: './dist/assets/scripts/',
    images: './dist/assets/images/',
    fonts: './dist/assets/fonts/',
};

/*******************************************************************************
* Browser-sync
*******************************************************************************/
gulp.task('browser-sync', function() {
  browserSync.init({
    server: {
      baseDir: dist.base
    }
  });
});

/*******************************************************************************
* Cleaner task
*******************************************************************************/
gulp.task('clean', function(cb) {
  del([dist.haml, 
       dist.scss, 
       dist.scripts, 
       dist.images, 
       dist.fonts], cb)
});

/*******************************************************************************
* SASS related tasks
*******************************************************************************/
gulp.task('sass', function() {
  gulp.src(src.scss)
  // .pipe(plugins.sourcemaps.init())
  .pipe(plugins.sass({style: 'compressed'}))
  .pipe(plugins.autoprefixer('last 2 version', 'ie 8', 'ie 9', 'ie 10', 'ie 11', 'opera 12.1', 'ios 6', 'android 4'))
  // .pipe(plugins.sourcemaps.write('./'))
  .pipe(gulp.dest(dist.scss))
  .pipe(plugins.rename({suffix: '.min'}))
  .pipe(plugins.minifyCss())
  .pipe(gulp.dest(dist.scss))
  .pipe(plugins.notify({message: 'SASS task complete'}))
  .pipe(browserSync.stream())
});

/*******************************************************************************
* Typographic related tasks
*******************************************************************************/
gulp.task('fonts', function() {
  gulp.src(src.fonts)
  .pipe(gulp.dest(dist.fonts))
  .pipe(plugins.notify({message: 'Fonts task complete'}))
  .pipe(browserSync.stream())
});

/*******************************************************************************
* HAML related tasks
*******************************************************************************/
gulp.task('haml', function() {
  gulp.src(src.haml)
  .pipe(plugins.changed(dist.base))
  .pipe(plugins.include())
    .on('error', console.log)
  .pipe(plugins.haml())
  .pipe(gulp.dest(dist.base))
  .pipe(plugins.notify({message: 'HAML task complete'}))
  .pipe(browserSync.stream())
});

/*******************************************************************************
* Image related tasks
*******************************************************************************/
gulp.task('images', function() {
  gulp.src(src.images)
  .pipe(plugins.cache(
    plugins.imagemin(
      {optimizationLevel: 3, 
      progressive: true, 
      interlaced: true })))
  .pipe(gulp.dest(dist.images))
  .pipe(plugins.notify({message: 'Images task complete'}))
  .pipe(browserSync.stream())
});

/*******************************************************************************
* Scripts related tasks
*******************************************************************************/
gulp.task('scripts', function() {
  gulp.src(src.scripts)
  // .pipe(plugins.jshint())
  // .pipe(plugins.jshint.reporter('jshint-stylish'))
  // .pipe(plugins.concat('main.js'))
  .pipe(gulp.dest(dist.scripts))
  // .pipe(plugins.rename({suffix: '.min'}))
  // .pipe(plugins.uglify())
  // .pipe(gulp.dest(dist.scripts))
  .pipe(plugins.notify({message: 'Scripts task complete'}))
  .pipe(browserSync.stream())
});

/*******************************************************************************
* Main tasks
*******************************************************************************/
gulp.task('build', function (done) {
  runSequence(
    'clean',
    'sass',
    'scripts',
    'fonts',
    'images',
    'haml',
  done);
});

gulp.task('watch', ['build', 'browser-sync'], function() {

  // Watch for SASS files
  gulp.watch(src.scss, ['sass']);

  // Watch for Fonts
  gulp.watch(src.fonts, ['fonts']);

  // Watch for Scripts
  gulp.watch(src.scripts, ['scripts']);

  // Watch for Images files
  gulp.watch(src.images, ['images']);

  // Watch for HAML files
  gulp.watch(src.haml, ['haml']);
});

gulp.task('default', ['build']);
