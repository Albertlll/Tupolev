// JavaScript файл для обработки ввода с виртуальной клавиатуры

document.addEventListener('DOMContentLoaded', function() {
    // Получаем элементы
    const groupInput = document.getElementById('group-input');
    const clearBtn = document.getElementById('clear-btn');
    const submitBtn = document.getElementById('submit-btn');
    const keys = document.querySelectorAll('.key');
    const currentTimeElement = document.getElementById('input-current-time');
    
    // Максимальная длина ввода
    const MAX_INPUT_LENGTH = 10;
    
    // Инициализация клавиатуры
    initKeyboard();
    
    // Обновляем время
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
    
    // Функция обновления времени
    function updateCurrentTime() {
        if (currentTimeElement) {
            const now = new Date();
            currentTimeElement.textContent = now.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit', second: '2-digit'});
        }
    }
    
    // Функция инициализации клавиатуры
    function initKeyboard() {
        // Добавляем обработчики на все кнопки клавиатуры
        keys.forEach(key => {
            key.addEventListener('click', function() {
                const keyValue = this.getAttribute('data-key');
                addToInput(keyValue);
            });
        });
        
        // Добавляем обработчик на кнопку очистки
        clearBtn.addEventListener('click', clearInput);
        
        // Добавляем обработчик на кнопку подтверждения
        submitBtn.addEventListener('click', submitInput);
        
        // Добавляем обработчик на физическую клавиатуру (для удобства тестирования)
        document.addEventListener('keydown', function(e) {
            // Проверяем, что экран ввода видим
            if (!document.getElementById('input-screen').classList.contains('hidden')) {
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
    
    // Функция отправки введенного значения
    function submitInput() {
        const groupNumber = groupInput.value.trim();
        
        if (groupNumber) {
            // Перенаправляем на страницу с расписанием, передавая номер группы в параметре URL
            window.location.href = `schedule.html?group=${encodeURIComponent(groupNumber)}`;
        } else {
            alert('Пожалуйста, введите номер группы');
        }
    }
    
    // Экспортируем функции для использования в других скриптах
    window.keyboardFunctions = {
        clearInput,
        submitInput
    };
}); 