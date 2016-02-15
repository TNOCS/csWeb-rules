var gulp         = require('gulp'),
    tslint       = require('gulp-tslint'),
    exec         = require('child_process').exec,
    jasmine      = require('gulp-jasmine-node'),
    gulp         = require('gulp-help')(gulp),
    tsconfig     = require('gulp-tsconfig-files'),
    path         = require('path'),
    inject       = require('gulp-inject'),
    gulpSequence = require('gulp-sequence'),
    del          = require('del');

var typeDefsPath = (function (tsd) {
    return tsd.path || 'typings';
})(require('./tsd.json'));

var tsFilesGlob = (function (c) {
    return c.filesGlob || c.files || '**/*.ts';
})(require('./tsconfig.json'));

gulp.task('tsconfig_files', 'Update files section in tsconfig.json', function () {
    gulp.src(tsFilesGlob).pipe(tsconfig());
});

gulp.task('gen_tsrefs', 'Generates the app.d.ts references file dynamically for all application *.ts files', function () {
    var target = gulp.src(path.join('.', typeDefsPath, 'app.d.ts'));
    var sources = gulp.src([path.join('.', 'src', '**', '*.ts')], { read: false });
    return target.pipe(inject(sources, {
        starttag: '//{',
        endtag: '//}',
        transform: function (filepath) {
            return '/// <reference path="..' + filepath + '" />';
        }
    })).pipe(gulp.dest(path.join('.', typeDefsPath)));
});

gulp.task('clean', 'Cleans the generated js files from lib directory', function () {
    return del([
        'lib/**/*'
    ]);
});

gulp.task('tslint', 'Lints all TypeScript source files', function () {
    return gulp.src(tsFilesGlob)
        .pipe(tslint())
        .pipe(tslint.report('verbose'));
});

gulp.task('_build', 'INTERNAL TASK - Compiles all TypeScript source files', function (cb) {
    exec('tsc', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
});

//run tslint task, then run _tsconfig_files and _gen_tsrefs in parallel, then run _build
gulp.task('build', 'Compiles all TypeScript source files and updates module references', gulpSequence('tslint', ['tsconfig_files', 'gen_tsrefs'], '_build'));

gulp.task('test', 'Runs the test specs', function (cb) {
    gulp.src('lib/test/**/*.js')
        .pipe(jasmine({
            showColors: true,
            includeStackTrace: false,
            verbose: false
        }));
    cb();
});

gulp.task('run', 'Runs node', function(cb) {
    exec('node lib/index.js', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
});

var watchOptions = {
    interval: 750, // default 100
    debounceDelay: 1000, // default 500
    mode: 'watch'
}; 
gulp.task('watch', 'Watches the test files for changes', function () {
    gulp.watch('lib/test/**/*.js', watchOptions, ['test']);
});
 
gulp.task('default', 'Default tasks runs the tests on change', ['watch']);