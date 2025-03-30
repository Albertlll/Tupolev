// JavaScript-файл для страницы расписания

document.addEventListener('DOMContentLoaded', function() {
    // Получение параметров URL
    const urlParams = new URLSearchParams(window.location.search);
    const groupNumber = urlParams.get('group');
    const teacherName = urlParams.get('teacher');
    
    // Элементы страницы
    const groupNumberElement = document.getElementById('group-number');
    const scheduleContainerElement = document.getElementById('schedule-container');
    const loadingElement = document.getElementById('loading');
    const errorMessageElement = document.getElementById('error-message');
    const placeholderElement = document.querySelector('.placeholder-text');
    const currentTimeElement = document.getElementById('current-time');
    
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
            window.location.href = 'index.html';
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
    
    // Обработчик для кнопки "Вернуться на главную"
    document.getElementById('back-to-main').addEventListener('click', function() {
        window.location.href = 'index.html';
    });
    
    // Инициализация страницы
    initPage();
    
    // Функция инициализации страницы
    function initPage() {
        // Обновляем текущее время
        updateCurrentTime();
        setInterval(updateCurrentTime, 1000);
        
        if (groupNumber) {
            // Загрузка расписания группы
            loadGroupSchedule(groupNumber);
        } else if (teacherName) {
            // Загрузка расписания преподавателя
            loadTeacherSchedule(teacherName);
        } else {
            // Если параметры не переданы, отображаем сообщение об ошибке
            groupNumberElement.textContent = 'не указан';
            showError('Не указаны параметры для отображения расписания');
        }
    }
    
    // Функция обновления времени
    function updateCurrentTime() {
        if (currentTimeElement) {
            const now = new Date();
            const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
            const day = days[now.getDay()];
            
            // Форматируем время в 24-часовом формате без AM/PM
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            const time = `${hours}:${minutes}`;
            
            // Проверяем, есть ли элемент отображения дня недели
            let weekTypeElement = document.querySelector('.week-type');
            
            // Если элемента нет, но у нас есть данные о типе недели, создаем его
            if (!weekTypeElement && window.weekType) {
                weekTypeElement = document.createElement('div');
                weekTypeElement.classList.add('week-type');
                
                const timeInfoElement = document.querySelector('.time-info');
                if (timeInfoElement) {
                    timeInfoElement.insertBefore(weekTypeElement, currentTimeElement);
                }
            }
            
            // Обновляем содержимое элемента дня недели, если он существует
            if (weekTypeElement) {
                const weekTypeText = window.weekType || '';
                weekTypeElement.innerHTML = `${day}<div class="week-type-label">${weekTypeText}</div>`;
            }
            
            // Обновляем время (без повторения дня недели внизу)
            currentTimeElement.textContent = time;
        }
    }
    
    // Функция загрузки расписания группы
    function loadGroupSchedule(groupNumber) {
        // Установка номера группы в заголовок
        groupNumberElement.textContent = groupNumber;
        
        // Устанавливаем текст "Группа:"
        const groupInfoText = document.querySelector('.group-info-text');
        if (groupInfoText) {
            groupInfoText.textContent = 'Группа:';
        }
        
        // Показываем индикатор загрузки
        showLoading();
        
        // Загружаем данные расписания из JSON-файла
        fetch('data/mock_schedule.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Не удалось загрузить данные расписания');
                }
                return response.json();
            })
            .then(data => {
                hideLoading();
                
                // Проверяем, есть ли данные для указанной группы
                if (data[groupNumber]) {
                    displaySchedule(data[groupNumber], 'group');
                } else {
                    showError('Группа не найдена');
                }
            })
            .catch(error => {
                console.error('Ошибка при загрузке расписания:', error);
                hideLoading();
                
                // В случае ошибки загрузки, используем встроенные данные
                if (groupNumber === '4337') {
                    displaySchedule(getFallbackGroupData(), 'group');
                } else {
                    showError('Не удалось загрузить расписание');
                }
            });
    }
    
    // Функция загрузки расписания преподавателя
    function loadTeacherSchedule(teacherName) {
        // Установка имени преподавателя в заголовок
        groupNumberElement.textContent = teacherName;
        
        // Устанавливаем текст "Преподаватель:"
        const groupInfoText = document.querySelector('.group-info-text');
        if (groupInfoText) {
            groupInfoText.textContent = 'Преподаватель:';
        }
        
        // Показываем индикатор загрузки
        showLoading();
        
        // Загружаем данные расписания из JSON-файла
        fetch('data/mock_schedule.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Не удалось загрузить данные расписания');
                }
                return response.json();
            })
            .then(data => {
                hideLoading();
                
                // Проверяем, есть ли данные для указанного преподавателя
                if (data.teachers && data.teachers[teacherName]) {
                    displaySchedule(data.teachers[teacherName], 'teacher');
                } else {
                    showError('Преподаватель не найден');
                }
            })
            .catch(error => {
                console.error('Ошибка при загрузке расписания:', error);
                hideLoading();
                
                // В случае ошибки загрузки, используем встроенные данные
                if (teacherName === 'Шумилкин Александр Олегович') {
                    displaySchedule(getFallbackTeacherData(), 'teacher');
                } else {
                    showError('Не удалось загрузить расписание');
                }
            });
    }
    
    // Резервные данные для группы на случай проблем с загрузкой JSON
    function getFallbackGroupData() {
        return {
            "name": "4337",
            "week_type": "четная",
            "lessons": [
                {
                    "number": "323",
                    "room": "8 здание",
                    "subject": "Поддержка и тестирование программных модулей",
                    "type": "Практика",
                    "time": "8:00",
                    "status": "past"
                },
                {
                    "number": "419",
                    "room": "7 здание",
                    "subject": "Поддержка и тестирование программных модулей",
                    "type": "Лекция",
                    "time": "9:40",
                    "status": "current"
                },
                {
                    "number": "124",
                    "room": "7 здание",
                    "subject": "Поддержка и тестирование программных модулей",
                    "type": "Практика",
                    "time": "11:20",
                    "status": "upcoming"
                },
                {
                    "number": "124",
                    "room": "7 здание",
                    "subject": "Поддержка и тестирование программных модулей",
                    "type": "Лабораторная работа",
                    "time": "13:30",
                    "status": "upcoming"
                },
                {
                    "number": "124",
                    "room": "7 здание",
                    "subject": "Поддержка и тестирование программных модулей",
                    "type": "Лабораторная работа",
                    "time": "15:10",
                    "status": "upcoming"
                }
            ]
        };
    }
    
    // Резервные данные для преподавателя на случай проблем с загрузкой JSON
    function getFallbackTeacherData() {
        return {
            "name": "Шумилкин Александр Олегович",
            "position": "Доцент",
            "department": "Кафедра информационных технологий",
            "week_type": "четная",
            "lessons": [
                {
                    "number": "419",
                    "room": "7 здание",
                    "subject": "Поддержка и тестирование программных модулей",
                    "group": "4337",
                    "type": "Лекция",
                    "time": "9:40",
                    "status": "current"
                },
                {
                    "number": "420",
                    "room": "7 здание",
                    "subject": "Разработка мобильных приложений",
                    "group": "3204",
                    "type": "Лекция",
                    "time": "11:20",
                    "status": "upcoming"
                },
                {
                    "number": "501",
                    "room": "5 здание",
                    "subject": "Программная инженерия",
                    "group": "2105",
                    "type": "Практика",
                    "time": "13:30",
                    "status": "upcoming"
                },
                {
                    "number": "502",
                    "room": "5 здание",
                    "subject": "Методы и средства проектирования ИС",
                    "group": "3202",
                    "type": "Лабораторная работа",
                    "time": "15:10",
                    "status": "upcoming"
                }
            ]
        };
    }
    
    // Функция отображения расписания
    function displaySchedule(data, scheduleType) {
        placeholderElement.style.display = 'none';
        scheduleContainerElement.style.display = 'block';
        scheduleContainerElement.innerHTML = '';
        
        // Добавляем тип недели
        if (data.week_type) {
            // Создаем элемент отображения типа недели
            const weekTypeElement = document.createElement('div');
            weekTypeElement.classList.add('week-type');
            
            // Получаем текущий день недели
            const day = getCurrentDay();
            
            // Сохраняем тип недели в глобальной переменной для использования в updateCurrentTime
            window.weekType = data.week_type;
            
            weekTypeElement.innerHTML = `${day}<div class="week-type-label">${data.week_type}</div>`;
            
            // Добавляем элемент в текущее время
            const timeInfoElement = document.querySelector('.time-info');
            if (timeInfoElement) {
                timeInfoElement.insertBefore(weekTypeElement, currentTimeElement);
            }
        }
        
        // Проверяем наличие расписания
        if (!data.lessons || data.lessons.length === 0) {
            scheduleContainerElement.innerHTML = '<div class="schedule-note">Нет доступного расписания.</div>';
            return;
        }
        
        // Формируем HTML для расписания
        data.lessons.forEach(lesson => {
            const lessonCard = document.createElement('div');
            lessonCard.classList.add('lesson-card', `lesson-${lesson.status}`);
            
            // Определяем содержимое карточки в зависимости от типа расписания
            if (scheduleType === 'group') {
                lessonCard.innerHTML = `
                    <div class="lesson-header">
                        <div class="lesson-number">${lesson.number}</div>
                        <div class="lesson-time">${lesson.time}</div>
                    </div>
                    <div class="lesson-body">
                        <div class="lesson-location">${lesson.room}</div>
                        <div class="lesson-subject">${lesson.subject}</div>
                        <div class="lesson-type">${lesson.type}</div>
                    </div>
                    ${lesson.status === 'current' ? '<canvas class="lesson-canvas"></canvas>' : ''}
                `;
            } else if (scheduleType === 'teacher') {
                lessonCard.innerHTML = `
                    <div class="lesson-header">
                        <div class="lesson-number">${lesson.number}</div>
                        <div class="lesson-time">${lesson.time}</div>
                    </div>
                    <div class="lesson-body">
                        <div class="lesson-location">${lesson.room}</div>
                        <div class="lesson-subject">${lesson.subject}</div>
                        <div class="lesson-group">Группа: ${lesson.group || 'Не указана'}</div>
                        <div class="lesson-type">${lesson.type}</div>
                    </div>
                    ${lesson.status === 'current' ? '<canvas class="lesson-canvas"></canvas>' : ''}
                `;
            }
            
            scheduleContainerElement.appendChild(lessonCard);
            
            // Если это текущий урок, инициализируем canvas
            if (lesson.status === 'current') {
                const canvas = lessonCard.querySelector('.lesson-canvas');
                initCanvas(canvas, lessonCard);
            }
        });
    }
    
    // Функция для получения текущего дня недели
    function getCurrentDay() {
        const now = new Date();
        const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
        return days[now.getDay()];
    }
    
    // Функция для инициализации canvas
    function initCanvas(canvas, container) {
        if (!canvas) return;
        
        // Устанавливаем размеры canvas равными размерам контейнера
        function resizeCanvas() {
            canvas.width = container.clientWidth - 50; // Немного отступа для красоты
            canvas.height = 300; // Фиксированная высота
        }
        
        // Первичная установка размеров
        resizeCanvas();
        
        // Получаем контекст для рисования
        const ctx = canvas.getContext('2d');
        
        // Создаем виртуальную "карту"
        const mapSize = { width: 2000, height: 1500 };
        
        // Устанавливаем фиксированную начальную точку для всех анимаций
        const initialPoint = { x: 1188, y: 867 };
        
        // Текущее положение на карте (центр просмотра)
        let currentViewCenter = { ...initialPoint };
        
        // Параметры отображения
        const viewParams = {
            scale: 1.0, // Масштаб
            maxScale: 2.0, // Максимальный масштаб
            minScale: 0.5, // Минимальный масштаб
            animationDuration: 2000, // Длительность анимации в мс
        };
        
        // Загружаем фоновое изображение карты
        const mapImage = new Image();
        let mapImageLoaded = false;
        
        mapImage.onload = function() {
            mapImageLoaded = true;
            console.log('Карта загружена успешно');
            // Обновляем отображение
            drawMap();
        };
        
        mapImage.onerror = function() {
            console.error('Ошибка загрузки изображения карты');
            // Если изображение не загрузилось, продолжаем работу с сеткой
        };
        
        // Устанавливаем путь к изображению
        mapImage.src = 'data/map.png';
        
        // Резервные данные точек на случай проблем с загрузкой
        const fallbackPoints = {
            "419": [
                {"x": 1188, "y": 867},
                {"x": 1156, "y": 1241}
            ],
            "333": [
                {"x": 500, "y": 600},
                {"x": 550, "y": 650}
            ],
            "424": [
                {"x": 800, "y": 400},
                {"x": 850, "y": 450},
                {"x": 900, "y": 500}
            ]
        };
        
        // Переменная для хранения загруженных точек
        let mapPoints = null;
        
        // Загрузка точек для текущего кабинета
        loadRoomPoints();
        
        function loadRoomPoints() {
            // Получаем номер кабинета из текущей карточки
            const roomNumber = container.querySelector('.lesson-number').textContent.trim();
            
            // Сначала пытаемся загрузить точки из JSON-файла
            fetch('data/map_points.json')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Не удалось загрузить данные точек');
                    }
                    return response.json();
                })
                .then(data => {
                    mapPoints = data;
                    
                    if (mapPoints[roomNumber]) {
                        console.log('Точки загружены из JSON:', mapPoints[roomNumber]);
                        // Если есть точки для этого кабинета, запускаем анимацию
                        animatePoints(mapPoints[roomNumber]);
                    } else {
                        console.log(`Точки для кабинета ${roomNumber} не найдены в JSON`);
                        // Если точек нет, рисуем просто центр карты
                        drawMap();
                    }
                })
                .catch(error => {
                    console.error('Ошибка при загрузке точек из JSON:', error);
                    
                    // Используем резервные данные
                    mapPoints = fallbackPoints;
                    
                    if (mapPoints[roomNumber]) {
                        console.log('Используем резервные точки:', mapPoints[roomNumber]);
                        // Если есть точки для этого кабинета, запускаем анимацию
                        animatePoints(mapPoints[roomNumber]);
                    } else {
                        console.log(`Точки для кабинета ${roomNumber} не найдены в резервных данных`);
                        // Если точек нет, рисуем просто центр карты
                        drawMap();
                    }
                });
        }
        
        // Функция анимации перемещения между точками
        function animatePoints(points) {
            if (!points || points.length === 0) return;
            
            let currentPointIndex = 0;
            let animationStartTime = null;
            let startPoint = {...initialPoint};
            let targetPoint = points[0];
            
            function animateToNextPoint(timestamp) {
                if (!animationStartTime) animationStartTime = timestamp;
                
                // Вычисляем прогресс анимации (от 0 до 1)
                const progress = Math.min((timestamp - animationStartTime) / viewParams.animationDuration, 1);
                
                // Вычисляем текущую позицию с помощью функции плавности
                const easedProgress = easeInOutCubic(progress);
                currentViewCenter = {
                    x: startPoint.x + (targetPoint.x - startPoint.x) * easedProgress,
                    y: startPoint.y + (targetPoint.y - startPoint.y) * easedProgress
                };
                
                // Рисуем карту
                drawMap();
                
                // Если анимация завершена и есть следующая точка
                if (progress >= 1) {
                    currentPointIndex++;
                    
                    // Если есть следующая точка, начинаем новую анимацию
                    if (currentPointIndex < points.length) {
                        animationStartTime = null;
                        startPoint = {...targetPoint};
                        targetPoint = points[currentPointIndex];
                        requestAnimationFrame(animateToNextPoint);
                    } else {
                        // Если точек больше нет, запускаем циклическую анимацию заново через 3 секунды
                        setTimeout(() => {
                            currentPointIndex = 0;
                            animationStartTime = null;
                            startPoint = {...initialPoint};  // Возвращаемся к начальной точке
                            targetPoint = points[0];
                            requestAnimationFrame(animateToNextPoint);
                        }, 3000);
                    }
                } else {
                    // Продолжаем анимацию
                    requestAnimationFrame(animateToNextPoint);
                }
            }
            
            // Отрисовываем начальное положение
            drawMap();
            
            // Запускаем анимацию после небольшой задержки
            setTimeout(() => {
                requestAnimationFrame(animateToNextPoint);
            }, 500);
        }
        
        // Функция плавности для анимации
        function easeInOutCubic(t) {
            return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        }
        
        // Функция для рисования карты
        function drawMap() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Вычисляем видимую область карты
            const visibleArea = {
                x: currentViewCenter.x - (canvas.width / viewParams.scale / 2),
                y: currentViewCenter.y - (canvas.height / viewParams.scale / 2),
                width: canvas.width / viewParams.scale,
                height: canvas.height / viewParams.scale
            };
            
            // Если изображение карты загружено успешно, рисуем его
            if (mapImageLoaded) {
                drawMapImage(visibleArea);
            } else {
                // Иначе рисуем сетку
                drawGrid(visibleArea);
            }
            
            // Рисуем маркер текущей позиции
            drawCurrentPositionMarker();
        }
        
        // Функция для рисования изображения карты
        function drawMapImage(visibleArea) {
            // Рассчитываем координаты и размеры для отображения части изображения
            const sourceX = visibleArea.x;
            const sourceY = visibleArea.y;
            const sourceWidth = visibleArea.width;
            const sourceHeight = visibleArea.height;
            
            // Проверяем, что источник не выходит за границы изображения
            const adjustedSourceX = Math.max(0, sourceX);
            const adjustedSourceY = Math.max(0, sourceY);
            const adjustedSourceWidth = Math.min(mapImage.width - adjustedSourceX, sourceWidth);
            const adjustedSourceHeight = Math.min(mapImage.height - adjustedSourceY, sourceHeight);
            
            // Если источник некорректен, рисуем сетку вместо изображения
            if (adjustedSourceWidth <= 0 || adjustedSourceHeight <= 0) {
                drawGrid(visibleArea);
                return;
            }
            
            // Рассчитываем координаты на холсте
            const destX = (adjustedSourceX - sourceX) * viewParams.scale;
            const destY = (adjustedSourceY - sourceY) * viewParams.scale;
            const destWidth = adjustedSourceWidth * viewParams.scale;
            const destHeight = adjustedSourceHeight * viewParams.scale;
            
            // Рисуем изображение
            try {
                ctx.drawImage(
                    mapImage,
                    adjustedSourceX, adjustedSourceY, adjustedSourceWidth, adjustedSourceHeight,
                    destX, destY, destWidth, destHeight
                );
            } catch (e) {
                console.error('Ошибка при отрисовке изображения:', e);
                drawGrid(visibleArea);
            }
        }
        
        // Функция для рисования сетки (имитация карты или как запасной вариант)
        function drawGrid(visibleArea) {
            // Размер клетки сетки
            const gridSize = 100;
            
            // Вычисляем начальные координаты сетки
            const startX = Math.floor(visibleArea.x / gridSize) * gridSize;
            const startY = Math.floor(visibleArea.y / gridSize) * gridSize;
            
            // Вычисляем конечные координаты сетки
            const endX = visibleArea.x + visibleArea.width;
            const endY = visibleArea.y + visibleArea.height;
            
            // Устанавливаем стиль линий
            ctx.strokeStyle = '#e0e0e0';
            ctx.lineWidth = 1;
            
            // Рисуем горизонтальные линии
            for (let y = startY; y <= endY; y += gridSize) {
                const screenY = (y - visibleArea.y) * viewParams.scale;
                ctx.beginPath();
                ctx.moveTo(0, screenY);
                ctx.lineTo(canvas.width, screenY);
                ctx.stroke();
            }
            
            // Рисуем вертикальные линии
            for (let x = startX; x <= endX; x += gridSize) {
                const screenX = (x - visibleArea.x) * viewParams.scale;
                ctx.beginPath();
                ctx.moveTo(screenX, 0);
                ctx.lineTo(screenX, canvas.height);
                ctx.stroke();
            }
            
            // Рисуем числа для ориентации
            ctx.fillStyle = '#006FF1';
            ctx.font = '14px Montserrat';
            for (let y = startY; y <= endY; y += gridSize) {
                for (let x = startX; x <= endX; x += gridSize) {
                    const screenX = (x - visibleArea.x) * viewParams.scale + 5;
                    const screenY = (y - visibleArea.y) * viewParams.scale + 15;
                    ctx.fillText(`${x},${y}`, screenX, screenY);
                }
            }
        }
        
        // Функция для рисования маркера текущей позиции
        function drawCurrentPositionMarker() {
            // Конвертируем координаты карты в координаты экрана
            const screenX = canvas.width / 2;
            const screenY = canvas.height / 2;
            
            // Рисуем окружность
            ctx.beginPath();
            ctx.arc(screenX, screenY, 10, 0, Math.PI * 2);
            ctx.fillStyle = '#006FF1';
            ctx.fill();
            
            // Рисуем крестик внутри окружности
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            
            ctx.beginPath();
            ctx.moveTo(screenX - 5, screenY);
            ctx.lineTo(screenX + 5, screenY);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(screenX, screenY - 5);
            ctx.lineTo(screenX, screenY + 5);
            ctx.stroke();
        }
        
        // Обновляем размеры и перерисовываем при изменении размера окна
        window.addEventListener('resize', function() {
            resizeCanvas();
            drawMap();
        });
    }
    
    // Функция отображения индикатора загрузки
    function showLoading() {
        placeholderElement.style.display = 'none';
        errorMessageElement.style.display = 'none';
        scheduleContainerElement.style.display = 'none';
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
        scheduleContainerElement.style.display = 'none';
        
        errorMessageElement.textContent = message;
        errorMessageElement.style.display = 'block';
    }
}); 