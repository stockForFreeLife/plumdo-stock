// Generated on 2017-05-11 using generator-angular 0.16.0
'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var openURL = require('open');
var lazypipe = require('lazypipe');
var rimraf = require('rimraf');
var wiredep = require('wiredep').stream;
var runSequence = require('run-sequence');

var yeoman = {
  app: require('./bower.json').appPath || 'app',
  dist: '../resources/static',
  tmp:'.tmp',
  module : 'stockApp'
};

var paths = {
  scripts: [yeoman.app + '/scripts/**/*.js'],
  styles: [yeoman.app + '/styles/**/*.scss'],
  stylesFonts: [
    yeoman.app +'/bower_components/material-design-icons/iconfont/**.ijmap',
    yeoman.app +'/bower_components/material-design-icons/iconfont/**.eot',
    yeoman.app +'/bower_components/material-design-icons/iconfont/**.svg',
    yeoman.app +'/bower_components/material-design-icons/iconfont/**.ttf',
    yeoman.app +'/bower_components/material-design-icons/iconfont/**.woff',
    yeoman.app +'/bower_components/material-design-icons/iconfont/**.woff2'
  ],
  fonts: [
    yeoman.app + '/fonts/**/*',
    yeoman.app +'/bower_components/font-awesome/fonts/*',
    yeoman.app +'/bower_components/bootstrap/fonts/*'
  ],
  test: ['test/spec/**/*.js'],
  testRequire: [
    yeoman.app + '/bower_components/angular/angular.js',
    yeoman.app + '/bower_components/angular-mocks/angular-mocks.js',
    yeoman.app + '/bower_components/angular-resource/angular-resource.js',
    yeoman.app + '/bower_components/angular-cookies/angular-cookies.js',
    yeoman.app + '/bower_components/angular-sanitize/angular-sanitize.js',
    yeoman.app + '/bower_components/angular-route/angular-route.js',
    'test/mock/**/*.js',
    'test/spec/**/*.js'
  ],
  karma: 'karma.conf.js',
  views: {
    main: yeoman.app + '/index.html',
    files: [yeoman.app + '/views/**/*.html']
  }
};

////////////////////////
// Reusable pipelines //
////////////////////////

var lintScripts = lazypipe()
  .pipe($.jshint, '.jshintrc')
  .pipe($.jshint.reporter, 'jshint-stylish');

var styles = lazypipe()
  .pipe($.sass, {
    outputStyle: 'expanded',
    precision: 10
  })
  .pipe($.autoprefixer, 'last 1 version')
  .pipe(gulp.dest, yeoman.tmp+'/styles');


var buildStyles = function () {
	var injectFiles = gulp.src([yeoman.app+'/styles/**/_*.scss',
	                            '!' + yeoman.app+ '/styles/404.scss',
	                            '!' + yeoman.app+ '/styles/auth.scss'
	                          ], {read: false});
	
	
	 var injectOptions = {
		transform : function(filePath) {
			filePath = filePath.replace(yeoman.app + '/styles/', '');
			return '@import "' + filePath + '";';
		},
		starttag : '// injector',
		endtag : '// endinjector',
		addRootSlash : false
	};
	 
	return gulp.src(yeoman.app+'/styles/main.scss')
  	.pipe($.inject(injectFiles, injectOptions))
    .pipe(styles());
};


///////////
// Tasks //
///////////
gulp.task('scriptInject', function () {
	var injectFiles = gulp.src([yeoman.app+'/scripts/**/*.module.js',
	                            yeoman.app+ '/scripts/**/*.js',
	                            '!' + yeoman.app+ '/scripts/**/*.spec.js',
	                            '!' + yeoman.app+ '/scripts/**/*.mock.js'
	                          ], {read: false});
	
	
	 var injectOptions = {
		starttag : '<!-- inject:scripts -->',
		ignorePath: yeoman.app,
		addRootSlash : false
	};

	return gulp.src(paths.views.main)
  	.pipe($.inject(injectFiles, injectOptions))
    .pipe(gulp.dest(yeoman.app));

});


gulp.task('stylesMainReload', function () {
	buildStyles()
  .pipe($.connect.reload());
});

gulp.task('stylesMain', function () {
	buildStyles();
});


gulp.task('styles', ['stylesMain'],function () {
  return gulp.src([yeoman.app+'/styles/404.scss',yeoman.app+'/styles/auth.scss'])
    .pipe(styles());
});

gulp.task('lint:scripts', function () {
  return gulp.src(paths.scripts)
    .pipe(lintScripts());
});

gulp.task('clean:tmp', function (cb) {
  rimraf('./'+yeoman.tmp, cb);
});

gulp.task('start:client', ['start:server', 'styles', 'scriptInject'], function () {
  openURL('http://localhost:9002');
});

gulp.task('start:server', function() {
  $.connect.server({
    root: [yeoman.app, yeoman.tmp],
    livereload: {
    	enable:true,
    	port:35727
  	},
    // Change this to '0.0.0.0' to access the server from outside.
    port: 9002,
    middleware: function (connect) {
      return [connect().use('/bower_components',connect.static('./bower_components'))];
    }
  });
});

gulp.task('start:server:test', function() {
  $.connect.server({
    root: ['test', yeoman.app, yeoman.tmp],
    livereload: true,
    port: 9001,
    middleware: function (connect) {
      return [connect().use('/bower_components',connect.static('./bower_components'))];
    }
  });
});

gulp.task('watch', function () {
	
	//scss通过注入main.scss在编译到tmp目录
  gulp.watch(paths.styles, ['stylesMainReload']);

  $.watch(paths.views.files)
    .pipe($.plumber())
    .pipe($.connect.reload());

  $.watch(paths.scripts)
    .pipe($.plumber())
    .pipe(lintScripts())
    .pipe($.connect.reload());

  $.watch(paths.test)
    .pipe($.plumber())
    .pipe(lintScripts());

  gulp.watch('bower.json', ['bower']);
});

gulp.task('serve', function (cb) {
  runSequence('clean:tmp',
   'bower',
    ['lint:scripts'],
    ['start:client'],
    'watch', cb);
});

gulp.task('serve:prod', function() {
  $.connect.server({
    root: [yeoman.dist],
    livereload: true,
    port: 9002
  });
});

gulp.task('test', ['start:server:test'], function () {
  var testToFiles = paths.testRequire.concat(paths.scripts, paths.test);
  return gulp.src(testToFiles)
    .pipe($.karma({
      configFile: paths.karma,
      action: 'watch'
    }));
});

// inject bower components
gulp.task('bower', function () {
  return gulp.src(paths.views.main)
    .pipe(wiredep({
      directory: yeoman.app + '/bower_components',
      exclude: [/\/bootstrap\.js$/, /\/bootstrap-sass\/.*\.js/, /\/require\.js/],
      ignorePath: '..'
    }))
  .pipe(gulp.dest(yeoman.app));
});


gulp.task('views', function () {
  return gulp.src(paths.views.files)
    .pipe($.minifyHtml({
      empty: true,
      spare: true,
      quotes: true
    }))
    .pipe($.angularTemplatecache('angular-template-html.js', {
      module: yeoman.module,
      root: 'views'
    }))
    .pipe(gulp.dest(yeoman.tmp+'/scripts'));
  
});

///////////
// Build //
///////////

gulp.task('clean:dist', function (cb) {
  rimraf(yeoman.dist, cb);
});

gulp.task('client:build', ['views', 'styles', 'scriptInject'], function () {
  var sourcesIndex = gulp.src([yeoman.tmp+'/scripts/angular-template-html.js'], {read: false});

  var htmlFilter = $.filter('*.html');
  var jsFilter = $.filter('**/*.js');
  var cssFilter = $.filter('**/*.css');

  return gulp.src(paths.views.main)
  	.pipe($.inject(sourcesIndex, {starttag: '<!-- inject:partials -->',ignorePath: yeoman.tmp,addRootSlash: false}))
    .pipe($.useref({searchPath: [yeoman.app, yeoman.tmp]}))
    .pipe(jsFilter)
    .pipe($.ngAnnotate())
    .pipe($.uglify())
    .pipe($.rev())
    .pipe(jsFilter.restore())
    .pipe(cssFilter)
    .pipe($.minifyCss({cache: true}))
    .pipe($.rev())
    .pipe(cssFilter.restore())
    .pipe($.revReplace())
    .pipe(htmlFilter)
    .pipe($.minifyHtml({
      empty: true,
      spare: true,
      quotes: true,
      conditionals: true
    }))
    .pipe(htmlFilter.restore())
    .pipe(gulp.dest(yeoman.dist));
});


gulp.task('images', function () {
  return gulp.src(yeoman.app + '/images/**/*')
    .pipe($.imagemin({
        optimizationLevel: 5,
        progressive: true,
        interlaced: true
    }))
    .pipe(gulp.dest(yeoman.dist + '/images'));
});

gulp.task('copy:extras', function () {
  return gulp.src(yeoman.app + '/**.*', { dot: true })
    .pipe(gulp.dest(yeoman.dist));
});

gulp.task('copy:fonts',['copy:stylesFonts'], function () {
  return gulp.src(paths.fonts)
    .pipe(gulp.dest(yeoman.dist + '/fonts'));
});
//有些特殊的css和font同一个目录，只好在做一个copy
gulp.task('copy:stylesFonts', function () {
  return gulp.src(paths.stylesFonts)
    .pipe(gulp.dest(yeoman.dist + '/styles'));
});


gulp.task('build', ['clean:dist'], function () {
  runSequence(['bower','images', 'copy:extras', 'copy:fonts', 'client:build']);
});

gulp.task('default', ['build']);
