// Основной JavaScript файл, который координирует работу приложения

// Дождемся загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    // Получаем элементы
    const sliderElement = document.getElementById('slider');
    const inputScreen = document.getElementById('input-screen');
    
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
        inputScreen.classList.add('hidden');
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