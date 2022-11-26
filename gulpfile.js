let projectFolder = 'dist',
    sourceFolder = 'src',

    path = {
        build: {
            html: projectFolder + '/',
            css: projectFolder + '/css/',
            cssLibs: projectFolder + '/css/libs/',
            js: projectFolder + '/js/',
            jsLibs: projectFolder + '/js/libs/',
            img: projectFolder + '/img/',
            fonts: projectFolder + '/fonts/',
            video: projectFolder + '/video/',
        },
        src: {
            html: [sourceFolder + '/*.html', '!' + sourceFolder + '/_*.html'],
            css: sourceFolder + '/scss/style.scss',
            cssLibs: sourceFolder + '/css/libs/*.css',
            js: sourceFolder + '/js/script.js',
            jsLibs: sourceFolder + '/js/libs/*.js',
            img: [sourceFolder + '/img/**/*.{jpg,png,gif,ico,svg,webp}', '!' + sourceFolder + '/img/iconsprite/*.svg'],
            video: sourceFolder + '/video/*.mp4',
            sprite: sourceFolder + '/img/iconsprite/*.svg',
            fonts: sourceFolder + '/fonts/*.ttf',
        },
        watch: {
            html: sourceFolder + '/**/*.html',
            css: sourceFolder + '/scss/**/*.scss',
            js: sourceFolder + '/js/**/*.js',
            img: sourceFolder + '/img/**/*.{jpg,png,svg,gif,ico,webp}',
            video: sourceFolder + '/video/*.mp4',
            sprite: sourceFolder + '/img/iconsprite/*.svg',
        },
        clean: './' + projectFolder + '/'
    },

    {
        src,
        dest
    } = require('gulp'),
    gulp = require('gulp'),
    browsersync = require('browser-sync').create(),
    del = require('del'),
    scss = require('gulp-sass')(require('sass')),
    autoprefixer = require('gulp-autoprefixer'),
    gcmq = require('gulp-group-css-media-queries'),
    cleanCSS = require('gulp-clean-css'),
    rename = require("gulp-rename"),
    imagemin = require('gulp-imagemin'),
    cache = require('gulp-cache'),
    svgSprite = require('gulp-svg-sprite'),
    webpack = require('webpack-stream');


function browserSync() {
    browsersync.init({
        server: {
            baseDir: './' + projectFolder + '/'
        },
        port: 3000,
        notify: false
    });
}

function html() {
    return src(path.src.html)
        .pipe(dest(path.build.html))
        .pipe(browsersync.stream());
}


function css() {
    src(path.src.cssLibs)
        .pipe(dest(path.build.cssLibs));
    return src(path.src.css)
        .pipe(scss({}))
        .pipe(gcmq())
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 5 versions'],
            cascade: true,
        }))
        .pipe(dest(path.build.css))
        .pipe(cleanCSS())
        .pipe(rename({
            extname: '.min.css'
        }))
        .pipe(dest(path.build.css))
        .pipe(browsersync.stream());
}

function js() {
    src(path.src.jsLibs)
        .pipe(dest(path.build.jsLibs));
    return src(path.src.js)
        .pipe(webpack({
            output: {
                filename: 'script.js',
            },
        }))
        .pipe(rename({
            extname: '.min.js'
        }))
        .pipe(dest(path.build.js))
        .pipe(browsersync.stream());
}

function images() {
    return src(path.src.img)
        .pipe(dest(path.build.img))
        .pipe(src(path.src.img))
        .pipe(cache(imagemin({
            interlaced: true,
            progressive: true,
            optimizationLevel: 3,
            svgoPlugins: [{
                removeViewBox: false
            }]
        })))
        .pipe(dest(path.build.img))
        .pipe(browsersync.stream());
}


function sprite() {
    return src(path.src.sprite)
        .pipe(svgSprite({
            mode: {
                stack: {
                    sprite: '../sprite.svg',
                }
            }
        }))
        .pipe(dest(path.build.img));
}


function video() {
    return src(path.src.video)
        .pipe(dest(path.build.video));
}



function watchFiles() {
    gulp.watch([path.watch.html], html);
    // gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.img], images);
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.sprite], sprite);
    gulp.watch([path.watch.video], video);
}

function clean() {
    return del(path.clean);
}

let build = gulp.series(clean, gulp.parallel(html, images, css, sprite, video));
let watch = gulp.parallel(build, watchFiles, browserSync);

exports.images = images;
// exports.js = js;
exports.css = css;
exports.html = html;
exports.video = video;
exports.sprite = sprite;
exports.build = build;
exports.watch = watch;
exports.default = watch;