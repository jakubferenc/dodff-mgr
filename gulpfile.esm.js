/* eslint-disable comma-dangle */
// ==========================================
// 1. DEPENDENCIES
// ==========================================
// gulp-dev-dependencies
import gulp from 'gulp';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import rollupBabel from '@rollup/plugin-babel';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// check package.json for gulp plugins
const gulpLoadPlugins = require('gulp-load-plugins');

// dev-dependencies
const browserSync = require('browser-sync').create();
const del = require('del');
const fs = require('fs');
const rollup = require('rollup').rollup;

const postcssAutoprefixer = require('autoprefixer');
const postcssCssnano = require('cssnano');

const pkg = require('./package.json');

const $ = gulpLoadPlugins();

const version = pkg.version;

const jsonNastaveni = JSON.parse(fs.readFileSync('./nastaveni.json'));

const ftpSettings = require('./ftp.json');
const ftp = require( 'vinyl-ftp' );
const changed = require('gulp-changed')

// ==========================================
// 2. FUNCTIONS
// ==========================================
function startBrowserSync() {
  if (browserSync.active) {
    return;
  }
  browserSync.init(config.browserSync);
}

// ==========================================
// CONFIG
// ==========================================
const config = {

  // COMMAND ARGUMENTS
  cmd: {
    // check if 'gulp --production'
    // http://stackoverflow.com/questions/28538918/pass-parameter-to-gulp-task#answer-32937333
    production: process.argv.indexOf('--production') > -1 || false,
    // cviceni: {
    //   index: process.argv.indexOf('--cviceni') || false,
    //   value: config.cmd.cviceni.index > -1 ? process.argv[config.cmd.cviceni.index + 1] : false,
    // },
  },
  // FOLDERS
  src: {
    folder: 'src/',
    data: {
      folder: 'src/data/',
      json: 'src/data/**/*.json',
    },
    fonts: {
      folder: 'src/fonts/',
      files: 'src/fonts/**/*.*',
    },
    img: {
      folder: 'src/img/',
      files: 'src/img/**/*.{jpg,png,svg,gif}',
    },
    js: {
      app: 'src/js/app.js',
      files: 'src/js/**/*.js',
      library: 'src/js/lib/',
      vendorFiles: 'src/js/vendor/**/*.js',
    },
    pug: {
      views: 'src/views/**/*.pug',
      index: 'src/views/index.pug',
      partials: 'src/views/_partials/**/*.pug',
    },
    scss: 'src/scss/**/*.scss',
    text: {
      folder: 'src/text/',
      html: 'src/text/**/*.html',
    },
  },
  tmp: {
    folder: 'tmp/',
    data: {
      folder: 'tmp/data/',
      cviceni: 'tmp/data/cviceni.json',
    },
    js: {
      folder: 'tmp/js/',
      src: 'tmp/js/**/*.js',
    },
    pug: {
      folder: 'tmp/pug/',
      index: 'tmp/pug/index.pug',
      src: 'tmp/pug/**/*.pug',
    },
  },
  dist: {
    folder: 'dist/',
  },
  // plugin settings
  // SERVER
  browserSync: {
    // proxy: 'localhost:' + config.port,
    // port: 3000,
    server: 'dist/',
    files: null,
    // files: 'dist/**/*.*',
    ghostMode: {
      click: true,
      // location: true,
      forms: true,
      scroll: true,
    },
    injectChanges: true,
    logFileChanges: true,
    logLevel: 'info',
    notify: false,
    reloadDelay: 380,
    ui: {
      port: 3001
    }
  },
  // IMAGES
  images: {},
  // PLUMBER
  plumber: {
    errorHandler: undefined,
  },
  // POSTCSS
  postcss: {
    plugins: [
      postcssAutoprefixer({
        cascade: true,
        precision: 10,
      }),
      postcssCssnano(),
    ],
  },
  // PUG
  pug: {
    pretty: false
  },
  // ROLLUP
  rollup: {
    bundle: {
      input: 'src/js/app.js',
      plugins: [
        nodeResolve(),
        rollupBabel({
          exclude: 'node_modules/**',
          babelHelpers: 'bundled',
        }),
      ],
    },
    output: {
      file: 'dist/assets/js/app.build.js',
      format: 'iife',
      name: 'mdh',
      sourcemap: true,
    },
  },
  // SASS
  sass: {
    errLogToConsole: true,
    outputStyle: 'expanded',
  },
};

config.pug.locals = {};


// ==========================================
// 4. TASKS
// ==========================================
// CLEAN
gulp.task('clean', (done) => del(['dist', 'temp'], done));

// SERVER
gulp.task('serve', () => startBrowserSync());

gulp.task('reload', () => browserSync.reload());

// pug:index & pug:home (pug -> html)
gulp.task('pug', () => gulp.src(['src/views/**/*.pug', '!src/views/_partials/**/*.pug'])
  .pipe(
    $.data(() => JSON.parse(fs.readFileSync('./temp/data_merged.json')))
  )
  .pipe($.pug(config.pug))
  .pipe(gulp.dest('dist/')));

// SASS
gulp.task('sass', () => gulp.src('src/scss/main.scss')
  .pipe($.sourcemaps.init())
  .pipe($.sass(config.sass).on('error', $.sass.logError))
  .pipe($.sourcemaps.write(gulp.dest('dist/assets/css')))
  .pipe($.autoprefixer())
  .pipe(gulp.dest('dist/assets/css'))
  .pipe(browserSync.stream()));

gulp.task('js', async () => {
  const bundle = await rollup(config.rollup.bundle);
  bundle.write(config.rollup.output);
});

// IMAGES
gulp.task('images', () => gulp.src('src/images/**/*.{jpg,png,svg,gif}')
  .pipe(gulp.dest('dist/assets/images')));

gulp.task('mergeJson', () => gulp.src('./nastaveni.json', './data/**/*.json')
  .pipe($.mergeJson({
    fileName: 'data_merged.json',
  }))
  .pipe(gulp.dest('./temp/')));

gulp.task('copyToDist', () => gulp.src('.htaccess')
  .pipe(gulp.dest('./dist/')));

gulp.task('deployFtp', () => {

  const conn = ftp.create( {
    host: ftpSettings.ftp.host,
    user: ftpSettings.ftp.user,
    password: ftpSettings.ftp.password,
    parallel: 10,
    timeOffset: ftpSettings.ftp.time
  });

  return gulp.src( ftpSettings.globs, {base: ftpSettings.base, buffer: false})
    .pipe(conn.newerOrDifferentSize(ftpSettings.ftp.dir))
    .pipe(conn.dest(ftpSettings.ftp.dir))
    .pipe(browserSync.stream());

});

gulp.task('watch', (cb) => {

  gulp.watch(['src/views/**/*.pug'], gulp.series('pug'));
  gulp.watch('nastaveni.json', gulp.series('pug'));
  gulp.watch('src/js/**/*.js', gulp.series('js'));
  gulp.watch('src/scss/**/*.scss', gulp.series('sass'));
  gulp.watch(['src/images/**/*.+(png|jpg|jpeg|gif|svg)'], gulp.series('images'));

  cb();

});

// GULP:build
gulp.task('build', gulp.series('clean', 'mergeJson', 'pug', 'sass', 'js', 'images', 'copyToDist'));


// GULP:default
gulp.task('default', gulp.series('build', 'watch', 'serve'));
