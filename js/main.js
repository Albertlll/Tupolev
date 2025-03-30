// Основной JavaScript файл, который координирует работу приложения

// Дождемся загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    // Получаем элементы
    const sliderElement = document.getElementById('slider');
    const inputScreen = document.getElementById('input-screen');
    
    // Система отслеживания активности
    let inactivityTimer;
    const INACTIVITY_TIMEOUT = 10000; // 10 секунд
    
    // Функция для запуска таймера неактивности
    function startInactivityTimer() {
        // Очищаем предыдущий таймер, если он существует
        clearTimeout(inactivityTimer);
        
        // Устанавливаем новый таймер
        inactivityTimer = setTimeout(() => {
            console.log('Пользователь неактивен в течение 10 секунд, возвращаемся на начальный экран');
            // Возвращаемся к слайдеру
            hideInputScreen();
        }, INACTIVITY_TIMEOUT);
    }
    
    // Сбрасываем таймер при любой активности
    function resetInactivityTimer() {
        startInactivityTimer();
    }
    
    // Отслеживаем события активности пользователя
    document.addEventListener('mousemove', resetInactivityTimer);
    document.addEventListener('mousedown', resetInactivityTimer);
    document.addEventListener('keypress', resetInactivityTimer);
    document.addEventListener('touchstart', resetInactivityTimer);
    document.addEventListener('scroll', resetInactivityTimer);
    
    // Запускаем таймер при загрузке страницы
    startInactivityTimer();
    
    // Инициализация приложения
    initApp();
    
    // Функция инициализации приложения
    function initApp() {
        // Слушатель клика на элемент с подсказкой, чтобы перейти к экрану ввода
        document.body.addEventListener('click', function(e) {
            // Если кликнули на подсказку или по центральной части слайда
            if (e.target.closest('.story-hint') || 
                (e.target.closest('#slider .story-content') && 
                 window.sliderFunctions && 
                 window.sliderFunctions.togglePlayPause)) {
                
                showInputScreen();
                // При открытии экрана ввода также ставим слайдер на паузу
                if (window.sliderFunctions && window.sliderFunctions.togglePlayPause) {
                    window.sliderFunctions.togglePlayPause();
                }
            }
        });
    }
    
    // Функция показа экрана ввода
    function showInputScreen() {
        sliderElement.classList.add('hidden');
        inputScreen.classList.remove('hidden');
    }
    
    // Функция скрытия экрана ввода (возврат к слайдеру)
    function hideInputScreen() {
        document.getElementById('input-screen').classList.add('hidden');
        document.getElementById('teacher-input-screen').classList.add('hidden');
        sliderElement.classList.remove('hidden');
        
        // Возобновляем воспроизведение слайдера
        if (window.sliderFunctions && window.sliderFunctions.togglePlayPause) {
            window.sliderFunctions.togglePlayPause();
        }
    }
    
    // Обработчик кнопки "Назад"
    document.getElementById('back-btn').addEventListener('click', function() {
        hideInputScreen();
    });
    
    // Экспортируем функции для использования в других скриптах
    window.appFunctions = {
        showInputScreen,
        hideInputScreen
    };
}); 