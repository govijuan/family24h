var fs = require('fs');
var path = require('path');

var gulp = require('gulp');

// Load all gulp plugins automatically
// and attach them to the `plugins` object
var plugins = require('gulp-load-plugins')();

// Temporary solution until gulp 4
// https://github.com/gulpjs/gulp/issues/355
var runSequence = require('run-sequence').use(gulp);

var browserSync = require('browser-sync').create();
var del = require('del');

// Define Source's Paths
var src = {
  base: './src',
  jade: './src/**/*.jade',
  scss: './src/styles/**/*.scss',
  scripts: './src/scripts/**/*.js',
  images: './src/images/**/*',
  fonts: './src/fonts/**/*',
  tests: './test/**/*.js',
};

// Define Build's Paths
var dist = {
  base: './dist',
  jade: './dist/**/',
  scss: './dist/styles/',
  scripts: './dist/scripts/',
  images: './dist/images/',
  fonts: './dist/fonts/',
};


gulp.task('browser-sync', function() {
  browserSync.init({
    server: {
      baseDir: dist.base
    }
  });
})

/*******************************************************************************
* Cleaner task
*******************************************************************************/
gulp.task('clean', function() {
  del(dist.base)
});

/*******************************************************************************
* Jade related tasks
*******************************************************************************/
gulp.task('jade', function() {
  return gulp.src([src.jade, 
      '!src/**/header.jade', 
      '!src/**/footer.jade',
      '!src/**/home_help.jade',
      '!src/**/home_features.jade',
      '!src/**/header_interna.jade',
      '!src/**/scripts.jade'])
    .pipe(plugins.plumber())
    .pipe(plugins.changed(dist.base))
    .pipe(plugins.include())
    .on('error', console.log)
    .pipe(plugins.jade({pretty: true}))
    .pipe(gulp.dest(dist.base))
    .pipe(browserSync.stream())
});

/*******************************************************************************
* SASS related tasks
*******************************************************************************/
gulp.task('sass', function() {
  return gulp.src([src.scss, '!src/styles/login/*'])
    .pipe(plugins.plumber())
    .pipe(plugins.include())
    // .pipe(plugins.sourcemaps.init())
    .pipe(plugins.sass())
    // .pipe(plugins.uncss({html: ['dist/index.html']}))
    .pipe(plugins.autoprefixer([
      'last 2 version',  
      'android >= 4',
      'ie >= 9',
      'opera >= 12', 
      'ios >= 6']))
    .pipe(plugins.csscomb())
    // .pipe(plugins.sourcemaps.write('./'))
    .pipe(gulp.dest(dist.scss))
    .pipe(plugins.rename({suffix: '.min'}))
    .pipe(plugins.minifyCss())
    .pipe(gulp.dest(dist.scss))
    .pipe(browserSync.stream())
});

/*******************************************************************************
* Typographic related tasks
*******************************************************************************/
gulp.task('fonts', function() {
  return gulp.src(src.fonts)
    .pipe(plugins.plumber())
    .pipe(gulp.dest(dist.fonts))
    .pipe(browserSync.stream())
});

/*******************************************************************************
* Image related tasks
*******************************************************************************/
gulp.task('images', function() {
  return gulp.src(src.images)
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
  return gulp.src([src.scripts,,
      '!src/scripts/**/*.min.js',
      '!src/scripts/vendor/**/*.js',
      '!src/scripts/bootstrap.js',
      '!src/scripts/bootstrap/**/*.js'])
    .pipe(plugins.plumber())
    .pipe(plugins.jshint())
    .pipe(plugins.jshint.reporter('jshint-stylish'))
    // .pipe(plugins.concat('main.js'))
    .pipe(gulp.dest(dist.scripts))
    .pipe(plugins.rename({suffix: '.min'}))
    .pipe(plugins.uglify())
    .pipe(gulp.dest(dist.scripts))
    .pipe(browserSync.stream())
});

/*******************************************************************************
* Tests related tasks
*******************************************************************************/
gulp.task('unit-tests', function () {
  return gulp.src(src.tests, {read: false})
    .pipe(plugins.mocha({ reporter: 'spec' }))
    .pipe(plugins.istanbul.writeReports())
});

gulp.task('ui-tests', function () {
  return gulp.src('./test/ui/test.js')
    .pipe(plugins.plumber())
    .pipe(plugins.casperjs()) //run casperjs test
    // .on('error', console.log)
});

/*******************************************************************************
* APK related tasks
*******************************************************************************/
gulp.task('apk', function() {
  return gulp.src('./src/download/*.apk')
    .pipe(plugins.plumber())
    .pipe(gulp.dest('./dist/download'))
});

/*******************************************************************************
* Main tasks
*******************************************************************************/
gulp.task('build', function(done) {
  return runSequence(
    'clean',
    'fonts',
    'images',
    'jade',
    'sass',
    'scripts',
    'apk',
    done);
});

// Watch Related Tasks
gulp.task('jade-watch', ['jade'], browserSync.reload);
gulp.task('sass-watch', ['sass'], browserSync.reload);
gulp.task('scripts-watch', ['scripts'], browserSync.reload);
gulp.task('fonts-watch', ['fonts'], browserSync.reload);
gulp.task('images-watch', ['images'], browserSync.reload);

// Watch's Main Task
gulp.task('watch', ['build'], function() {

    // Starts the Server after building 'em all
    browserSync.init({
      server: {
        baseDir: dist.base
      }
    });

  // Watch for changes
  gulp.watch(src.scss, ['sass-watch']);
  gulp.watch(src.fonts, ['fonts-watch']);
  gulp.watch(src.scripts, ['scripts-watch']);
  gulp.watch(src.images, ['images-watch']);
  gulp.watch(src.jade, ['jade-watch']);
});

gulp.task('default', ['build']);
