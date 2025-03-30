// JavaScript файл для управления слайдером рекламы в стиле историй

document.addEventListener('DOMContentLoaded', function() {
    // Получаем элемент слайдера
    const sliderElement = document.getElementById('slider');

    console.log('DOMContentLoaded');
    
    // Настройки слайдера
    const sliderSettings = {
        slidesDataUrl: 'slides/slides-data.json', // URL к JSON с данными о слайдах
        storyDuration: 5000, // Продолжительность одной истории в мс
        progressUpdateInterval: 30, // Интервал обновления прогресса в мс
        transitionDuration: 600, // Длительность анимации перехода между слайдами в мс (увеличена)
    };
    
    let slidesData = []; // Массив для хранения данных о слайдах
    let currentSlideIndex = 0;
    let progressInterval;
    let storyTimeout;
    let progressValue = 0;
    let isPlaying = true;
    let isTransitioning = false; // Флаг для отслеживания анимации перехода
    
    // Инициализация слайдера
    initSlider();
    
    // Функция инициализации слайдера
    async function initSlider() {
        try {
            // Загружаем данные о слайдах из JSON
            slidesData = await fetchSlidesData(sliderSettings.slidesDataUrl);
            
            if (slidesData.length === 0) {
                console.error('Нет данных о слайдах');
                return;
            }
            
            // Загружаем шаблон HTML для слайдов
            const templateHtml = await fetchTemplate('slides-template.html');
            sliderElement.innerHTML = templateHtml;
            
            // Создаем индикаторы прогресса
            createProgressBars();
            
            // Показываем первый слайд без анимации
            showSlideInitial(0);
            
            // Слушатель кликов для паузы/воспроизведения
            sliderElement.addEventListener('click', handleSliderClick);
            
            // Слушатель для клика на сам слайд (для перехода к экрану ввода)
            // Это уже должно быть реализовано в main.js
        } catch (error) {
            console.error('Ошибка при инициализации слайдера:', error);
        }
    }
    
    // Функция загрузки данных о слайдах
    async function fetchSlidesData(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Ошибка при загрузке данных о слайдах:', error);
            // Возвращаем заглушку если не удалось загрузить JSON
            return [
                {
                    authorName: "Колледж Информационных Технологий",
                    authorAvatar: "slides/avatars/college-avatar.svg",
                    slide: "slides/1.png"
                },
                {
                    authorName: "Колледж Информационных Технологий",
                    authorAvatar: "slides/avatars/college-avatar.svg",
                    slide: "slides/2.png"
                },
                {
                    authorName: "Колледж Информационных Технологий",
                    authorAvatar: "slides/avatars/college-avatar.svg",
                    slide: "slides/3.png"
                }
            ];
        }
    }
    
    // Функция загрузки HTML-шаблона
    async function fetchTemplate(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.text();
        } catch (error) {
            console.error('Ошибка при загрузке шаблона:', error);
            // Возвращаем базовый шаблон если не удалось загрузить
            return `
                <div class="stories-container">
                    <div class="stories-progress-container"></div>
                    <div class="story-author">
                        <div class="author-avatar">
                            <img src="" alt="Аватар" id="current-avatar">
                        </div>
                        <div class="author-name" id="current-author"></div>
                    </div>
                    <div class="story-content">
                        <div class="slide-container">
                            <img src="" alt="Слайд" id="current-slide">
                        </div>
                    </div>
                    <div class="story-hint">
                        Нажмите что бы узнать расписание
                    </div>
                </div>
            `;
        }
    }
    
    // Функция создания индикаторов прогресса
    function createProgressBars() {
        const progressContainer = document.querySelector('.stories-progress-container');
        progressContainer.innerHTML = '';
        
        slidesData.forEach((_, index) => {
            const progressBar = document.createElement('div');
            progressBar.className = 'progress-bar';
            progressBar.dataset.index = index;
            
            const progressBarFill = document.createElement('div');
            progressBarFill.className = 'progress-bar-fill';
            
            progressBar.appendChild(progressBarFill);
            progressContainer.appendChild(progressBar);
            
            // Добавляем клик на прогресс-бар для быстрого перехода к слайду
            progressBar.addEventListener('click', () => {
                if (!isTransitioning) {
                    showSlide(index);
                }
            });
        });
    }
    
    // Функция начального отображения слайда (без анимации)
    function showSlideInitial(index) {
        if (index < 0 || index >= slidesData.length) {
            index = 0;
        }
        
        currentSlideIndex = index;
        progressValue = 0;
        
        // Обновляем контент слайда
        const slideData = slidesData[index];
        document.getElementById('current-author').textContent = slideData.authorName;
        document.getElementById('current-avatar').src = slideData.authorAvatar;
        document.getElementById('current-slide').src = slideData.slide;
        
        // Обновляем все прогресс-бары
        updateProgressBars(index);
        
        // Запускаем таймер
        startTimer();
    }
    
    // Функция отображения слайда с анимацией
    function showSlide(index) {
        if (isTransitioning) return; // Не позволяем переключать во время анимации
        
        if (index < 0 || index >= slidesData.length) {
            index = 0; // Перезапускаем с первого слайда если вышли за границы
        }
        
        // Останавливаем таймеры
        clearInterval(progressInterval);
        clearTimeout(storyTimeout);
        
        isTransitioning = true;
        
        // Получаем текущий слайд и его данные
        const slideImg = document.getElementById('current-slide');
        const slideData = slidesData[index];
        
        // Добавляем класс для анимации ухода текущего слайда
        slideImg.classList.add('slide-transition-exit-active');
        
        // Через время перехода убираем текущее изображение и показываем новое
        setTimeout(() => {
            slideImg.classList.remove('slide-transition-exit-active');
            
            // Обновляем данные слайда
            currentSlideIndex = index;
            progressValue = 0;
            
            document.getElementById('current-author').textContent = slideData.authorName;
            document.getElementById('current-avatar').src = slideData.authorAvatar;
            
            // Добавляем класс для анимации входа нового слайда
            slideImg.classList.add('slide-transition-enter');
            slideImg.src = slideData.slide;
            
            // Обновляем прогресс-бары
            updateProgressBars(index);
            
            // Через короткое время запускаем переход к полной видимости
            setTimeout(() => {
                slideImg.classList.remove('slide-transition-enter');
                slideImg.classList.add('slide-transition-enter-active');
                
                // Сбрасываем классы анимации и переходим к следующему слайду
                setTimeout(() => {
                    slideImg.classList.remove('slide-transition-enter-active');
                    isTransitioning = false;
                    
                    // Запускаем таймер для следующего слайда
                    startTimer();
                }, 100);
            }, 50);
        }, sliderSettings.transitionDuration);
    }
    
    // Функция обновления прогресс-баров
    function updateProgressBars(currentIndex) {
        const progressBars = document.querySelectorAll('.progress-bar-fill');
        
        progressBars.forEach((bar, idx) => {
            // Все предыдущие прогресс-бары заполняем полностью
            if (idx < currentIndex) {
                bar.style.width = '100%';
            } 
            // Все следующие прогресс-бары очищаем
            else if (idx > currentIndex) {
                bar.style.width = '0%';
            } 
            // Текущий прогресс-бар начинаем с нуля
            else {
                bar.style.width = '0%';
            }
        });
    }
    
    // Функция запуска таймера для автоматической смены слайдов
    function startTimer() {
        // Очищаем предыдущие таймеры
        clearInterval(progressInterval);
        clearTimeout(storyTimeout);
        
        if (!isPlaying) return;
        
        const currentProgressBar = document.querySelector(`.progress-bar[data-index="${currentSlideIndex}"] .progress-bar-fill`);
        if (!currentProgressBar) return;
        
        // Устанавливаем начальное значение прогресса
        currentProgressBar.style.width = `${progressValue}%`;
        
        // Запускаем интервал для обновления прогресса
        progressInterval = setInterval(() => {
            if (!isPlaying) return;
            
            progressValue += (sliderSettings.progressUpdateInterval / sliderSettings.storyDuration) * 100;
            
            // Если достигли 100%, переходим к следующему слайду
            if (progressValue >= 100) {
                clearInterval(progressInterval);
                clearTimeout(storyTimeout);
                setTimeout(() => {
                    showNextSlide();
                }, 50); // Небольшая задержка для визуального завершения
                return;
            }
            
            currentProgressBar.style.width = `${progressValue}%`;
        }, sliderSettings.progressUpdateInterval);
        
        // Запускаем таймер для перехода к следующему слайду (страховка)
        storyTimeout = setTimeout(() => {
            clearInterval(progressInterval);
            showNextSlide();
        }, sliderSettings.storyDuration);
    }
    
    // Функция перехода к следующему слайду
    function showNextSlide() {
        if (isTransitioning) return;
        showSlide((currentSlideIndex + 1) % slidesData.length);
    }
    
    // Функция перехода к предыдущему слайду
    function showPrevSlide() {
        if (isTransitioning) return;
        showSlide((currentSlideIndex - 1 + slidesData.length) % slidesData.length);
    }
    
    // Обработчик кликов по слайдеру
    function handleSliderClick(e) {
        if (isTransitioning) return; // Не обрабатываем клики во время анимации
        
        const containerWidth = sliderElement.offsetWidth;
        const clickX = e.clientX - sliderElement.getBoundingClientRect().left;
        
        if (clickX < containerWidth * 0.3) {
            // Клик по левой трети экрана - предыдущий слайд
            showPrevSlide();
        } else if (clickX > containerWidth * 0.7) {
            // Клик по правой трети экрана - следующий слайд
            showNextSlide();
        } else {
            // Клик по центру - пауза/воспроизведение
            togglePlayPause();
        }
    }
    
    // Функция переключения пауза/воспроизведение
    function togglePlayPause() {
        isPlaying = !isPlaying;
        
        if (isPlaying) {
            startTimer();
        } else {
            clearInterval(progressInterval);
            clearTimeout(storyTimeout);
        }
    }
    
    // Экспортируем функции для использования в других скриптах
    window.sliderFunctions = {
        showNextSlide,
        showPrevSlide,
        togglePlayPause
    };
}); 