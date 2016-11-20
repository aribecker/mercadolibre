gulp.task('browserify', function() {  
  return browserify('./src/ml.js')
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest('./public/js'));
});
