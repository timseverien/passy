var gulp = require('gulp'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify');

gulp.task('default', function() {
	return gulp.src('src/**/*.js')
		.pipe(uglify({
			preserveComments: 'some'
		}))
		.pipe(concat('jquery-passy.js'))
		.pipe(gulp.dest('./dist'));
});