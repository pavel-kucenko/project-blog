const gulp = require('gulp'); // Подключаем Gulp
const browserSync = require('browser-sync').create();
const watch = require('gulp-watch');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const gcmq = require('gulp-group-css-media-queries');
const pug = require('gulp-pug');
const del = require('del');
const sassGlob = require('gulp-sass-glob');
const fs = require('fs');


//Таск для сборки паг файлов
gulp.task('pug', function(callback) {
    return gulp.src('./src/pug/pages/**/*.pug')
        .pipe(plumber({
            errorHandler: notify.onError(function(err){
                return {
                    title: 'Pug',
                    sound: false,
                    message: err.message
                }
            })
        }))
        .pipe( 
            pug({
                pretty: true,
                // Парсим данные из Json
                locals: {
                    jsonData: JSON.parse(
                        fs.readFileSync("./src/data/data.json", "utf8")
                    )
                }
            })
        )
        .pipe(gulp.dest('./build/'))
        .pipe(browserSync.stream())
    callback();
});
// Таск для компиляции scss в css
gulp.task('scss', function(callback) {
    return gulp.src('./src/scss/main.scss')
        .pipe(plumber({
            errorHandler: notify.onError(function(err){
                return {
                    title: 'Styles',
                    sound: false,
                    message: err.message
                }
            })
        }))
        .pipe(sourcemaps.init())
        .pipe(sassGlob())
        .pipe(sass({
            indentType: "tab",
            indentWidth: "1",
            outputStyle: "expanded"
        })
        )
        // .pipe(gcmq())
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 4 versions']
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./build/css/'))
        .pipe(browserSync.stream())
    callback();
});

//Копирование изображений
gulp.task('copy:img', function(callback) {
    return gulp.src('./src/img/**/*.*')
        .pipe(gulp.dest('./build/img/'))
    callback();
});

//Копирование скриптов
gulp.task('copy:js', function(callback) {
    return gulp.src('./src/js/**/*.*')
        .pipe(gulp.dest('./build/js/'))
    callback();
});

// Таск для слежения за файлами .html .css и обновление браузера
gulp.task('watch', function() {
    //Следим за картинками и скриптами и обновляем браузер
    watch( ['./build/js/**/*.*', './build/img/**/*.*'], gulp.parallel(browserSync.reload));

    //Слежение за SCSS и компиляция в CSS с задержкой 1с
    watch('./src/scss/**/*.scss', function(){
        setTimeout(gulp.parallel('scss'), 1000)
    })

    //Слежение за PUG с задержкой 1 сек
    watch(['./src/pug/**/*.pug', './src/data/**/*.json'], function(){
        setTimeout(gulp.parallel('pug'), 1000)
    })

    //Следим за картинками и скриптами, и копируем их в build
    watch('./src/img/**/*.*', gulp.parallel('copy:img'))

    watch('./src/js/**/*.*', gulp.parallel('copy:js'))

});

// Задача для старта сервера из папки src
gulp.task('server', function() {
    browserSync.init({
        server: {
            baseDir: "./build/"
        }
    })
});

gulp.task('clean:build', function(callback) {
    return del('./build')
    callback();
});

gulp.task(
    'default',
    gulp.series(
        gulp.parallel('clean:build'),
        gulp.parallel('scss', 'pug', 'copy:img', 'copy:js'),
        gulp.parallel('server', 'watch')
    )
); 

