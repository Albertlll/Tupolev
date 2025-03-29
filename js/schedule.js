// JavaScript-файл для страницы расписания

document.addEventListener('DOMContentLoaded', function() {
    // Получение параметров URL
    const urlParams = new URLSearchParams(window.location.search);
    const groupNumber = urlParams.get('group');
    
    // Элементы страницы
    const groupNumberElement = document.getElementById('group-number');
    const groupDisplayElement = document.getElementById('group-display');
    const scheduleExampleElement = document.getElementById('schedule-example');
    const loadingElement = document.getElementById('loading');
    const errorMessageElement = document.getElementById('error-message');
    const placeholderElement = document.querySelector('.placeholder-text');
    
    // Обработчик для кнопки "Вернуться на главную"
    document.getElementById('back-to-main').addEventListener('click', function() {
        window.location.href = 'index.html';
    });
    
    // Инициализация страницы
    initPage();
    
    // Функция инициализации страницы
    function initPage() {
        if (groupNumber) {
            // Установка номера группы в заголовок и текст
            groupNumberElement.textContent = groupNumber;
            groupDisplayElement.textContent = groupNumber;
            
            // Загрузка расписания
            loadSchedule(groupNumber);
        } else {
            // Если номер группы не передан, отображаем сообщение об ошибке
            groupNumberElement.textContent = 'не указан';
            groupDisplayElement.textContent = 'не указан';
            showError('Не указан номер группы');
        }
    }
    
    // Функция загрузки расписания
    function loadSchedule(groupNumber) {
        // Показываем индикатор загрузки
        showLoading();
        
        // Имитация загрузки данных с сервера
        setTimeout(function() {
            // Скрываем индикатор загрузки
            hideLoading();
            
            // В реальном приложении здесь был бы код для получения данных с сервера
            // Для демонстрации показываем пример расписания
            showScheduleExample();
            
            // Здесь можно добавить проверку на существование группы
            // Например, если group число от 100 до 999, показываем расписание,
            // в противном случае показываем ошибку
            /*
            const groupInt = parseInt(groupNumber);
            if (groupInt >= 100 && groupInt <= 999) {
                showScheduleExample();
            } else {
                showError('Группа не найдена');
            }
            */
        }, 1500); // Имитация задержки загрузки данных (1.5 секунды)
    }
    
    // Функция отображения примера расписания
    function showScheduleExample() {
        placeholderElement.style.display = 'none';
        scheduleExampleElement.style.display = 'block';
    }
    
    // Функция отображения индикатора загрузки
    function showLoading() {
        placeholderElement.style.display = 'none';
        errorMessageElement.style.display = 'none';
        scheduleExampleElement.style.display = 'none';
        loadingElement.style.display = 'block';
    }
    
    // Функция скрытия индикатора загрузки
    function hideLoading() {
        loadingElement.style.display = 'none';
    }
    
    // Функция отображения сообщения об ошибке
    function showError(message) {
        placeholderElement.style.display = 'none';
        loadingElement.style.display = 'none';
        scheduleExampleElement.style.display = 'none';
        
        errorMessageElement.textContent = message;
        errorMessageElement.style.display = 'block';
    }
}); 