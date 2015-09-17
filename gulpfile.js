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
  jade: './src/**/*.jade',
  scss: './src/stylesheets/**/*.scss',
  scripts: './src/scripts/**/*.js',
  images: './src/images/**/*',
  fonts: './src/fonts/**/*',
};

var dist = {
  base: './dist',
  jade: './dist/**/*.jade',
  scss: './dist/stylesheets/',
  scripts: './dist/scripts/',
  images: './dist/images/',
  fonts: './dist/fonts/',
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
  del(dist.base, cb)
});

/*******************************************************************************
* Jade related tasks
*******************************************************************************/
gulp.task('jade', function() {
  gulp.src([src.jade, 
            '!src/header.jade', 
            '!src/footer.jade',
            '!src/home_help.jade',
            '!src/home_features.jade',
            '!src/header_interna.jade'])
  .pipe(plugins.plumber())
  .pipe(plugins.changed(dist.base))
  .pipe(plugins.include())
  .on('error', console.log)
  .pipe(plugins.jade())
  .pipe(gulp.dest(dist.base))
  .pipe(browserSync.stream())
});

/*******************************************************************************
* SASS related tasks
*******************************************************************************/
gulp.task('sass', function() {
  gulp.src([src.scss, '!src/stylesheets/login/*'])
  .pipe(plugins.plumber())
  .pipe(plugins.include())
  // .pipe(plugins.sourcemaps.init())
  .pipe(plugins.sass({style: 'compressed'}))
  .pipe(plugins.autoprefixer([
    'last 2 version',  
    'android >= 4',
    'ie >= 9',
    'opera >= 12', 
    'ios >= 6']))
  .pipe(plugins.csscomb())
  // .pipe(plugins.sourcemaps.write('./'))
  .pipe(gulp.dest(dist.scss))
  // .pipe(plugins.rename({suffix: '.min'}))
  // .pipe(plugins.minifyCss())
  // .pipe(gulp.dest(dist.scss))
  .pipe(browserSync.stream())
});

/*******************************************************************************
* Typographic related tasks
*******************************************************************************/
gulp.task('fonts', function() {
  gulp.src(src.fonts)
  .pipe(plugins.plumber())
  .pipe(gulp.dest(dist.fonts))
  .pipe(browserSync.stream())
});

/*******************************************************************************
* Image related tasks
*******************************************************************************/
gulp.task('images', function() {
  gulp.src(src.images)
  .pipe(plugins.plumber())
  .pipe(plugins.changed(dist.images))
  .pipe(plugins.imagemin(
    {optimizationLevel: 3, 
      progressive: true, 
      interlaced: true }))
  .pipe(gulp.dest(dist.images))
  .pipe(browserSync.stream())
});

/*******************************************************************************
* Scripts related tasks
*******************************************************************************/
gulp.task('scripts', function() {
  gulp.src(src.scripts)
  .pipe(plugins.plumber())
  // .pipe(plugins.jshint())
  // .pipe(plugins.jshint.reporter('jshint-stylish'))
  // .pipe(plugins.concat('main.js'))
  .pipe(gulp.dest(dist.scripts))
  // .pipe(plugins.rename({suffix: '.min'}))
  // .pipe(plugins.uglify())
  // .pipe(gulp.dest(dist.scripts))
  .pipe(browserSync.stream())
});

/*******************************************************************************
* Main tasks
*******************************************************************************/
gulp.task('build', function(done) {
  runSequence(
    // 'clean',
    'images',
    'jade',
    'sass',
    'scripts',
    'fonts',
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

  // Watch for Jade files
  gulp.watch(src.jade, ['jade']);
});

gulp.task('default', ['clean', 'images', 'jade', 'sass', 'scripts', 'fonts']);
