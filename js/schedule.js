// JavaScript-файл для страницы расписания

document.addEventListener('DOMContentLoaded', function() {
    // Получение параметров URL
    const urlParams = new URLSearchParams(window.location.search);
    const groupNumber = urlParams.get('group');
    
    // Элементы страницы
    const groupNumberElement = document.getElementById('group-number');
    const scheduleContainerElement = document.getElementById('schedule-container');
    const loadingElement = document.getElementById('loading');
    const errorMessageElement = document.getElementById('error-message');
    const placeholderElement = document.querySelector('.placeholder-text');
    const currentTimeElement = document.getElementById('current-time');
    
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
            // Установка номера группы в заголовок
            groupNumberElement.textContent = groupNumber;
            
            // Загрузка расписания
            loadSchedule(groupNumber);
        } else {
            // Если номер группы не передан, отображаем сообщение об ошибке
            groupNumberElement.textContent = 'не указан';
            showError('Не указан номер группы');
        }
    }
    
    // Функция обновления времени
    function updateCurrentTime() {
        if (currentTimeElement) {
            const now = new Date();
            const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
            const day = days[now.getDay()];
            const time = now.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
            currentTimeElement.innerHTML = `${time}<div class="current-time-label">${day}</div>`;
        }
    }
    
    // Функция загрузки расписания (использует локальные данные)
    function loadSchedule(groupNumber) {
        // Показываем индикатор загрузки
        showLoading();
        
        // Имитация загрузки
        setTimeout(() => {
            hideLoading();
            
            // Данные расписания для группы 4337
            // В реальном проекте здесь был бы fetch к серверу
            if (groupNumber === '4337') {
                displaySchedule(getMockData());
            } else {
                showError('Группа не найдена');
            }
        }, 500);
    }
    
    // Функция получения тестовых данных
    function getMockData() {
        return {
            name: "4337",
            lessons: [
                {
                    number: "333",
                    room: "8 здание",
                    subject: "Поддержка и тестирование программных модулей",
                    type: "Практика",
                    time: "8:00",
                    status: "past"
                },
                {
                    number: "419",
                    room: "7 здание",
                    subject: "Поддержка и тестирование программных модулей",
                    type: "Лекция",
                    time: "9:40",
                    status: "current"
                },
                {
                    number: "124",
                    room: "7 здание",
                    subject: "Поддержка и тестирование программных модулей",
                    type: "Практика",
                    time: "11:20",
                    status: "upcoming"
                },
                {
                    number: "124",
                    room: "7 здание",
                    subject: "Поддержка и тестирование программных модулей",
                    type: "Лабораторная работа",
                    time: "13:30",
                    status: "upcoming"
                },
                {
                    number: "124",
                    room: "7 здание",
                    subject: "Поддержка и тестирование программных модулей",
                    type: "Лабораторная работа",
                    time: "15:10",
                    status: "upcoming"
                }
            ]
        };
    }
    
    // Функция отображения расписания
    function displaySchedule(groupData) {
        placeholderElement.style.display = 'none';
        scheduleContainerElement.style.display = 'block';
        scheduleContainerElement.innerHTML = '';
        
        // Проверяем наличие расписания
        if (!groupData.lessons || groupData.lessons.length === 0) {
            scheduleContainerElement.innerHTML = '<div class="schedule-note">Для этой группы нет доступного расписания.</div>';
            return;
        }
        
        // Формируем HTML для расписания
        groupData.lessons.forEach(lesson => {
            const lessonCard = document.createElement('div');
            lessonCard.classList.add('lesson-card', `lesson-${lesson.status}`);
            
            lessonCard.innerHTML = `
                <div class="lesson-header">
                    <div class="lesson-number">${lesson.number}</div>
                    <div class="lesson-time">${lesson.time}</div>
                </div>
                <div class="lesson-body">
                    <div class="lesson-subject">${lesson.subject}</div>
                    <div class="lesson-location">${lesson.room}</div>
                    <div class="lesson-type">${lesson.type}</div>
                </div>
                ${lesson.status === 'current' ? '<canvas class="lesson-canvas"></canvas>' : ''}
            `;
            
            scheduleContainerElement.appendChild(lessonCard);
            
            // Если это текущий урок, инициализируем canvas
            if (lesson.status === 'current') {
                const canvas = lessonCard.querySelector('.lesson-canvas');
                initCanvas(canvas, lessonCard);
            }
        });
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
        
        // Текущее положение на карте (центр просмотра)
        let currentViewCenter = { x: mapSize.width / 2, y: mapSize.height / 2 };
        
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
        
        // Данные точек для кабинетов (вместо загрузки из JSON-файла)
        const mapPoints = {
            "419": [
                {"x": 1188, "y": 867},
                {"x": 1156, "y": 1241},
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
        
        // Загрузка точек для текущего кабинета
        loadRoomPoints();
        
        function loadRoomPoints() {
            // Получаем номер кабинета из текущей карточки
            const roomNumber = container.querySelector('.lesson-number').textContent.trim();
            
            // Используем встроенные данные вместо fetch
            if (mapPoints[roomNumber]) {
                console.log(mapPoints[roomNumber]);
                // Если есть точки для этого кабинета, запускаем анимацию
                animatePoints(mapPoints[roomNumber]);
            } else {
                console.log(`Точки для кабинета ${roomNumber} не найдены`);
                // Если точек нет, рисуем просто центр карты
                drawMap();
            }
        }
        
        // Функция анимации перемещения между точками
        function animatePoints(points) {
            if (!points || points.length === 0) return;
            
            let currentPointIndex = 0;
            let animationStartTime = null;
            let startPoint = {...currentViewCenter};
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
                            startPoint = {...currentViewCenter};
                            targetPoint = points[0];
                            requestAnimationFrame(animateToNextPoint);
                        }, 3000);
                    }
                } else {
                    // Продолжаем анимацию
                    requestAnimationFrame(animateToNextPoint);
                }
            }
            
            // Запускаем анимацию
            requestAnimationFrame(animateToNextPoint);
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