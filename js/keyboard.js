// JavaScript файл для обработки ввода с виртуальной клавиатуры

document.addEventListener('DOMContentLoaded', function() {
    // Получаем элементы для экрана ввода номера группы
    const groupInput = document.getElementById('group-input');
    const clearBtn = document.getElementById('clear-btn');
    const submitBtn = document.getElementById('submit-btn');
    const backBtn = document.getElementById('back-btn');
    const keys = document.querySelectorAll('.key');
    const teacherBtn = document.getElementById('teacher-btn');
    
    // Получаем элементы для экрана ввода ФИО преподавателя
    const teacherInputScreen = document.getElementById('teacher-input-screen');
    const teacherNameInput = document.getElementById('teacher-name-input');
    const teacherClearBtn = document.getElementById('teacher-clear-btn');
    const teacherSubmitBtn = document.getElementById('teacher-submit-btn');
    const teacherBackBtn = document.getElementById('teacher-back-btn');
    
    // Устанавливаем значения по умолчанию
    if (groupInput) {
        groupInput.value = '4337';
    }
    
    if (teacherNameInput) {
        teacherNameInput.value = 'Шумилкин Александр Олегович';
    }
    
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
            if (window.appFunctions && window.appFunctions.hideInputScreen) {
                window.appFunctions.hideInputScreen();
            }
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
    
    // Максимальная длина ввода
    const MAX_INPUT_LENGTH = 10;
    
    // Инициализация клавиатуры
    initKeyboard();
    
    // Инициализация экрана учителя
    initTeacherScreen();
    
    // Функция инициализации клавиатуры
    function initKeyboard() {
        // Добавляем обработчики на все кнопки клавиатуры
        keys.forEach(key => {
            key.addEventListener('click', function() {
                const keyValue = this.getAttribute('data-key');
                addToInput(keyValue);
                resetInactivityTimer(); // Сбрасываем таймер при нажатии кнопки
            });
        });
        
        // Добавляем обработчик на кнопку очистки
        clearBtn.addEventListener('click', function() {
            clearInput();
            resetInactivityTimer(); // Сбрасываем таймер при очистке
        });
        
        // Добавляем обработчик на кнопку подтверждения
        submitBtn.addEventListener('click', function() {
            submitInput();
            resetInactivityTimer(); // Сбрасываем таймер при отправке
        });
        
        // Добавляем обработчик на кнопку "Я учитель"
        teacherBtn.addEventListener('click', function() {
            showTeacherScreen();
            resetInactivityTimer();
        });
        
        // Добавляем обработчик на физическую клавиатуру (для удобства тестирования)
        document.addEventListener('keydown', function(e) {
            // Проверяем, что экран ввода видим
            if (!document.getElementById('input-screen').classList.contains('hidden')) {
                // Сбрасываем таймер при любом нажатии клавиши
                resetInactivityTimer();
                
                // Если нажата цифра
                if (/^\d$/.test(e.key)) {
                    addToInput(e.key);
                }
                // Если нажат Backspace
                else if (e.key === 'Backspace') {
                    e.preventDefault(); // Предотвращаем стандартное поведение браузера
                    removeLastChar();
                }
                // Если нажат Enter
                else if (e.key === 'Enter') {
                    e.preventDefault(); // Предотвращаем стандартное поведение браузера
                    submitInput();
                }
                // Если нажат Escape
                else if (e.key === 'Escape') {
                    e.preventDefault(); // Предотвращаем стандартное поведение браузера
                    // Возвращаемся к слайдеру
                    if (window.appFunctions && window.appFunctions.hideInputScreen) {
                        window.appFunctions.hideInputScreen();
                    }
                }
            }
        });
    }
    
    // Функция инициализации экрана учителя
    function initTeacherScreen() {
        // Обработчик для кнопки очистки ввода ФИО
        teacherClearBtn.addEventListener('click', function() {
            teacherNameInput.value = '';
            resetInactivityTimer();
        });
        
        // Обработчик для кнопки поиска
        teacherSubmitBtn.addEventListener('click', function() {
            submitTeacherSearch();
            resetInactivityTimer();
        });
        
        // Обработчик для кнопки назад
        teacherBackBtn.addEventListener('click', function() {
            hideTeacherScreen();
            resetInactivityTimer();
        });
        
        // Обработчик для ввода с клавиатуры
        teacherNameInput.addEventListener('keydown', function(e) {
            resetInactivityTimer();
            
            if (e.key === 'Enter') {
                e.preventDefault();
                submitTeacherSearch();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                hideTeacherScreen();
            }
        });
    }
    
    // Функция добавления символа в поле ввода
    function addToInput(char) {
        if (groupInput.value.length < MAX_INPUT_LENGTH) {
            groupInput.value += char;
        }
    }
    
    // Функция удаления последнего символа
    function removeLastChar() {
        groupInput.value = groupInput.value.slice(0, -1);
    }
    
    // Функция очистки поля ввода
    function clearInput() {
        groupInput.value = '';
    }
    
    // Функция отправки введенного значения группы
    function submitInput() {
        const groupNumber = groupInput.value.trim();
        
        if (groupNumber) {
            // Перенаправляем на страницу с расписанием, передавая номер группы в параметре URL
            window.location.href = `schedule.html?group=${encodeURIComponent(groupNumber)}`;
        } else {
            alert('Пожалуйста, введите номер группы');
        }
    }
    
    // Функция отображения экрана ввода ФИО преподавателя
    function showTeacherScreen() {
        document.getElementById('input-screen').classList.add('hidden');
        teacherInputScreen.classList.remove('hidden');
        teacherNameInput.focus();
    }
    
    // Функция скрытия экрана ввода ФИО преподавателя
    function hideTeacherScreen() {
        teacherInputScreen.classList.add('hidden');
        document.getElementById('input-screen').classList.remove('hidden');
    }
    
    // Функция отправки поиска преподавателя
    function submitTeacherSearch() {
        const teacherName = teacherNameInput.value.trim();
        
        if (teacherName) {
            // Перенаправляем на страницу с расписанием, передавая имя преподавателя в параметре URL
            window.location.href = `schedule.html?teacher=${encodeURIComponent(teacherName)}`;
        } else {
            alert('Пожалуйста, введите ФИО преподавателя');
        }
    }
    
    // Экспортируем функции для использования в других скриптах
    window.keyboardFunctions = {
        clearInput,
        submitInput,
        showTeacherScreen,
        hideTeacherScreen
    };
}); 