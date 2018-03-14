  // Для того щоб усе працювало потрібно поставити наступні речі через консоль
  // npm i gulp -g  			 				 	   -встановити gulp якщо ще не встановлено
  // npm init       			 				 	   -виконати ініціалізацію проекта, яку створили
  // npm i gulp --save-dev 	 				 	   -встановлюємо в проект gulp
  // npm i gulp-sass --save-dev 				 	   -встановлюємо плагін для компіляції scss/sass
  // npm i browser-sync --save-dev 			 	   -інсталяція Bower Sync в проект
  // npm i -g bower 							 	   -встановлюємо Bower (потрібно створити в корньовій папці файл (.bowerrc), а також в ньому прописати ({"directory" : "app/libs/"}) )
  // bower i jquery magnific-popup 				   -зразок як підключити бібліотеки через Bower
  // npm i --save-dev gulp-concat gulp-uglifyjs 	   -Давайте создадим таск scripts, который будет собирать все JS файлы библиотек в один и минифицировать файл. Для этого установим 2 пакета: gulp-concat и gulp-uglifyjs.
  // npm i gulp-cssnano gulp-rename --save-dev  	   -Для минификации CSS установим пакеты gulp-cssnano и gulp-rename
  // npm i del --save-dev						 	   -Установим и подключим пакет del(Що робить дел (Перед тем, как собирать проект нам желательно бы очистить папку dist, чтобы не оставалось лишних потрохов от предыдущих итераций с нашим проектом.))
  // npm i gulp-imagemin imagemin-pngquant --save-dev -Для оптимизации изображений установим 2 пакета (gulp-imagemin, imagemin-pngquant)
  // npm i gulp-cache --save-dev					   -Установи м подключим gulp-cache (поэтому к обработке изображений было бы неплохо добавить кеш, чтобы картинки кешировались, экономя наше время)
  // npm i --save-dev gulp-autoprefixer			   -Установим пакет gulp-autoprefixer и подключим его в gulpfile.js

    var gulp       = require('gulp'), // Подключаем Gulp
        scss         = require('gulp-sass'), //Подключаем Sass пакет,
        browserSync  = require('browser-sync'), // Подключаем Browser Sync
        concat       = require('gulp-concat'), // Подключаем gulp-concat (для конкатенации файлов)
        uglify       = require('gulp-uglifyjs'), // Подключаем gulp-uglifyjs (для сжатия JS)
        cssnano      = require('gulp-cssnano'), // Подключаем пакет для минификации CSS
        rename       = require('gulp-rename'), // Подключаем библиотеку для переименования файлов
        del          = require('del'), // Подключаем библиотеку для удаления файлов и папок
        imagemin     = require('gulp-imagemin'), // Подключаем библиотеку для работы с изображениями
        pngquant     = require('imagemin-pngquant'), // Подключаем библиотеку для работы с png
        cache        = require('gulp-cache'), // Подключаем библиотеку кеширования
        autoprefixer = require('gulp-autoprefixer');// Подключаем библиотеку для автоматического добавления префиксов

    gulp.task('scss', function(){ // Создаем таск scss
        return gulp.src(['app/scss/main.scss', 'app/scss/libs.scss']) // Берем источник
            .pipe(scss()) // Преобразуем scss в CSS посредством gulp-scss
            .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true })) // Создаем префиксы
            .pipe(gulp.dest('app/css')) // Выгружаем результата в папку app/css
            .pipe(browserSync.reload({stream: true})) // Обновляем CSS на странице при изменении
    });

    gulp.task('browser-sync', function() { // Создаем таск browser-sync
        browserSync({ // Выполняем browserSync
            server: { // Определяем параметры сервера
                baseDir: 'app' // Директория для сервера - app
            },
            notify: false // Отключаем уведомления
        });
    });

    gulp.task('scripts', function() {
        return gulp.src([ // Берем все необходимые библиотеки
            'app/libs/jquery/dist/jquery.min.js', // Берем jQuery
            'app/libs/magnific-popup/dist/jquery.magnific-popup.min.js' // Берем Magnific Popup
            ])
            .pipe(concat('libs.min.js')) // Собираем их в кучу в новом файле libs.min.js
            .pipe(uglify()) // Сжимаем JS файл
            .pipe(gulp.dest('app/js')); // Выгружаем в папку app/js
    });

    gulp.task('css-libs', ['scss'], function() {
        return gulp.src('app/css/libs.css') // Выбираем файл для минификации
            .pipe(cssnano()) // Сжимаем
            .pipe(rename({suffix: '.min'})) // Добавляем суффикс .min
            .pipe(gulp.dest('app/css')); // Выгружаем в папку app/css
    });

    gulp.task('watch', ['browser-sync', 'css-libs', 'scripts'], function() {
        gulp.watch('app/scss/**/*.scss', ['scss']); // Наблюдение за scss файлами в папке scss
        gulp.watch('app/*.html', browserSync.reload); // Наблюдение за HTML файлами в корне проекта
        gulp.watch('app/js/**/*.js', browserSync.reload);   // Наблюдение за JS файлами в папке js
    });

    gulp.task('clean', function() {
        return del.sync('dist'); // Удаляем папку dist перед сборкой
    });

    gulp.task('img', function() {
        return gulp.src('app/img/**/*') // Берем все изображения из app
            .pipe(cache(imagemin({  // Сжимаем их с наилучшими настройками с учетом кеширования
                interlaced: true,
                progressive: true,
                svgoPlugins: [{removeViewBox: false}],
                use: [pngquant()]
            })))
            .pipe(gulp.dest('dist/img')); // Выгружаем на продакшен
    });

    gulp.task('build', ['clean', 'img', 'scss', 'scripts'], function() {

        var buildCss = gulp.src([ // Переносим библиотеки в продакшен
            'app/css/main.css',
            'app/css/libs.min.css'
            ])
        .pipe(gulp.dest('dist/css'))

        var buildFonts = gulp.src('app/fonts/**/*') // Переносим шрифты в продакшен
        .pipe(gulp.dest('dist/fonts'))

        var buildJs = gulp.src('app/js/**/*') // Переносим скрипты в продакшен
        .pipe(gulp.dest('dist/js'))

        var buildHtml = gulp.src('app/*.html') // Переносим HTML в продакшен
        .pipe(gulp.dest('dist'));

    });

    gulp.task('clear', function () {
        return cache.clearAll();
    })

    gulp.task('default', ['watch']);
