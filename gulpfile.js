var gulp = require('gulp')
    connect = require('gulp-connect'),
    browserify = require('browserify'),
    babelify = require('babelify'),
    source = require('vinyl-source-stream');

gulp.task('server', function() {
    connect.server({
        port: 9999,
        // root: 'app',
        livereload: true
    });
});

gulp.task('html', function() {
    gulp.src('./app/*.html')
        .pipe(connect.reload());
});

gulp.task('js', function() {
    return browserify('./app/app.js')
        .transform(babelify, { presets: ['es2015'] })
        .bundle()
        .pipe(source('main.js'))
        .pipe(gulp.dest('./public/js/'));
});

gulp.task('watch', function() {
    gulp.watch(['./app/*.html'], ['html']);
    gulp.watch('app/**/*.js', ['js']);
});

gulp.task('default', ['server', 'watch']);
