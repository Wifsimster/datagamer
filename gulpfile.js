var gulp = require('gulp');
var stylus = require('gulp-stylus');
var nib = require('nib');

// Render css from stly file
gulp.task('css', function () {
    gulp.src('./public/stylesheets/style.stly')
        .pipe(stylus({
            use: [nib()],
            compress: true
        }))
        .pipe(gulp.dest('./public/stylesheets'));
});