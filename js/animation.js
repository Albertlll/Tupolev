// JavaScript для анимации фона на Canvas

document.addEventListener('DOMContentLoaded', function() {
    // Получаем canvas
    const canvas = document.getElementById('background-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Массив для хранения точек анимации
    let animationPoints = [];
    // Настройки цветов
    let colorSettings = {};
    
    // Загружаем данные анимации из JSON
    loadAnimationData();
    
    // Установка размеров canvas
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    // Загрузка данных анимации
    function loadAnimationData() {
        fetch('data/schedule.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Не удалось загрузить данные анимации');
                }
                return response.json();
            })
            .then(data => {
                if (data.animation && data.animation.points) {
                    animationPoints = data.animation.points;
                    colorSettings = data.animation.colors || {
                        past: "#AAAAAA",
                        current: "#3F51B5",
                        upcoming: "#FFC107",
                        background: "#F5F5F5",
                        text: "#333333",
                        highlight: "#E3F2FD"
                    };
                    
                    // Настройка фона
                    document.body.style.backgroundColor = colorSettings.background;
                    
                    // Инициализируем анимацию
                    initAnimation();
                }
            })
            .catch(error => {
                console.error('Ошибка загрузки данных анимации:', error);
            });
    }
    
    // Инициализация анимации
    function initAnimation() {
        // Создаем точки для анимации
        let points = createAnimationPoints();
        
        // Запускаем отрисовку
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        // Запуск анимации
        animate(points);
        
        // Обновляем время
        if (document.getElementById('current-time')) {
            updateCurrentTime();
            setInterval(updateCurrentTime, 1000);
        }
    }
    
    // Создание точек для анимации
    function createAnimationPoints() {
        const points = [];
        const basePoints = animationPoints.length > 0 ? animationPoints : [
            {x: 50, y: 50}, {x: 150, y: 100}, {x: 250, y: 200},
            {x: 350, y: 150}, {x: 450, y: 50}, {x: 400, y: 300},
            {x: 300, y: 400}, {x: 200, y: 350}, {x: 100, y: 250}
        ];
        
        // Создаем 30 движущихся точек
        for (let i = 0; i < 30; i++) {
            const basePoint = basePoints[Math.floor(Math.random() * basePoints.length)];
            const point = {
                x: basePoint.x,
                y: basePoint.y,
                radius: Math.random() * 3 + 1,
                color: getRandomColor(),
                speed: Math.random() * 0.5 + 0.1,
                angle: Math.random() * Math.PI * 2,
                // Для орбитального движения
                orbitRadius: Math.random() * 50 + 20,
                orbitSpeed: Math.random() * 0.02 + 0.005,
                orbitAngle: Math.random() * Math.PI * 2
            };
            points.push(point);
        }
        
        return points;
    }
    
    // Получение случайного цвета из палитры
    function getRandomColor() {
        const colorKeys = ['past', 'current', 'upcoming'];
        const colorKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];
        return colorSettings[colorKey] || '#3F51B5';
    }
    
    // Анимация точек
    function animate(points) {
        // Очищаем canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Рисуем и обновляем каждую точку
        points.forEach(point => {
            // Обновляем позицию на основе орбитального движения
            point.orbitAngle += point.orbitSpeed;
            
            // Вычисляем новую позицию
            const orbitX = Math.cos(point.orbitAngle) * point.orbitRadius;
            const orbitY = Math.sin(point.orbitAngle) * point.orbitRadius;
            
            const newX = point.x + orbitX;
            const newY = point.y + orbitY;
            
            // Рисуем точку
            ctx.beginPath();
            ctx.arc(newX, newY, point.radius, 0, Math.PI * 2);
            ctx.fillStyle = point.color;
            ctx.fill();
            
            // Рисуем соединительные линии
            points.forEach(otherPoint => {
                const distance = Math.sqrt(
                    Math.pow(newX - (otherPoint.x + Math.cos(otherPoint.orbitAngle) * otherPoint.orbitRadius), 2) +
                    Math.pow(newY - (otherPoint.y + Math.sin(otherPoint.orbitAngle) * otherPoint.orbitRadius), 2)
                );
                
                if (distance < 100) { // Соединяем только близкие точки
                    ctx.beginPath();
                    ctx.moveTo(newX, newY);
                    ctx.lineTo(
                        otherPoint.x + Math.cos(otherPoint.orbitAngle) * otherPoint.orbitRadius,
                        otherPoint.y + Math.sin(otherPoint.orbitAngle) * otherPoint.orbitRadius
                    );
                    ctx.strokeStyle = `rgba(150, 150, 150, ${0.8 - distance/100})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            });
        });
        
        // Продолжаем анимацию
        requestAnimationFrame(() => animate(points));
    }
    
    // Обновление времени
    function updateCurrentTime() {
        const timeElement = document.getElementById('current-time');
        if (timeElement) {
            const now = new Date();
            timeElement.textContent = now.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit', second: '2-digit'});
        }
    }
}); 