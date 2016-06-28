// Less configuration
var gulp = require('gulp');
var less = require('gulp-less');
var concat = require('gulp-concat');
var minifyCSS = require('gulp-minify-css');
var minify = require('gulp-minify');
var browserify = require('gulp-browserify');

gulp.task('less', function() {
    gulp.src('src/**/*.less')
        .pipe(less())
        .pipe(minifyCSS())
        .pipe(concat('source-min.css'))
        .pipe(gulp.dest('build'))
});

gulp.task('js', function() {
    gulp.src('src/**/*.js')
        .pipe(concat('source.js'))
        .pipe(minify({ noSource: true }))
        .pipe(gulp.dest('build'))
});

gulp.task('default', ['less', 'js'], function() {
    gulp.watch('src/**/*.less', ['less']);
    gulp.watch('src/**/*.js', ['js']);
});