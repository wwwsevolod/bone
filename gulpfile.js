/* eslint-env node */
/* eslint-disable quotes, strict */

var gulp = require('gulp');
var typescript = require('gulp-typescript');
var jasmine = require('gulp-jasmine');
var babel = require('gulp-babel');
// var path = require('path');


gulp.task('build', function() {
    var tsConfig = require('./tsconfig.json');

    return gulp.src(tsConfig.filesGlob, {
        base: './'
    }).pipe(typescript(typescript.createProject('./tsconfig.json', {
        typescript: require('typescript')
    }))).pipe(babel()).pipe(gulp.dest('dist'));
});

var SRC_TESTS = [
    './dist/tests/**/*_test.js'
];

gulp.task('test', ['build'], function() {
    return gulp.src(SRC_TESTS)
        .pipe(jasmine({
            includeStackTrace: true
        }));
});


gulp.task('default', ['test']);


