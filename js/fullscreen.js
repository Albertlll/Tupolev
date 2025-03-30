// JavaScript для управления полноэкранным режимом, особенно для Safari
document.addEventListener('DOMContentLoaded', function() {
    // Проверяем, добавлено ли приложение на главный экран iOS
    const isInStandaloneMode = () => 
        ('standalone' in window.navigator) && (window.navigator.standalone);
    
    // Функция для открытия приложения на полный экран
    function openFullscreen() {
        // Для iOS Safari - прокручиваем страницу вниз для скрытия адресной строки
        if ((/iPhone|iPad|iPod/i.test(navigator.userAgent) || /Macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1) && !isInStandaloneMode()) {
            // Небольшая задержка перед скроллом
            setTimeout(function() {
                window.scrollTo(0, 1);
            }, 300);
        }
        
        // Запрос полноэкранного режима для других браузеров
        const element = document.documentElement;
        
        if (element.requestFullscreen) {
            element.requestFullscreen().catch(err => {
                // В Safari на iOS это может не сработать - нормально
                console.log('Ошибка полного экрана:', err);
            });
        } else if (element.webkitRequestFullscreen) { // Safari
            element.webkitRequestFullscreen().catch(err => {
                console.log('Ошибка полного экрана Safari:', err);
            });
        } else if (element.mozRequestFullScreen) { // Firefox
            element.mozRequestFullScreen().catch(err => {
                console.log('Ошибка полного экрана:', err);
            });
        } else if (element.msRequestFullscreen) { // IE/Edge
            element.msRequestFullscreen().catch(err => {
                console.log('Ошибка полного экрана:', err);
            });
        }
    }
    
    // Функция для блокировки ориентации экрана
    function lockOrientation() {
        if ('orientation' in screen) {
            screen.orientation.lock('portrait').catch(function(error) {
                // Нормально, если блокировка не поддерживается
                console.log('Ориентация не заблокирована:', error);
            });
        }
    }
    
    // Для iOS требуется добавление на домашний экран для полного экрана
    // Показываем подсказку для пользователей Safari на iOS
    function showInstallPrompt() {
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent) || 
                      (/Macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
        
        if (isIOS && isSafari && !isInStandaloneMode()) {
            const promptElement = document.createElement('div');
            promptElement.className = 'ios-install-prompt';
            promptElement.innerHTML = `
                <div class="prompt-content">
                    <p>Для полноэкранного режима добавьте эту страницу на домашний экран:</p>
                    <p>Нажмите <strong>«Поделиться»</strong> и выберите <strong>«На экран «Домой»»</strong></p>
                    <button id="close-prompt">Понятно</button>
                </div>
            `;
            document.body.appendChild(promptElement);
            
            // Добавление стилей для подсказки
            const style = document.createElement('style');
            style.textContent = `
                .ios-install-prompt {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background-color: rgba(0,0,0,0.8);
                    color: white;
                    padding: 15px;
                    z-index: 9999;
                    font-family: -apple-system, system-ui, BlinkMacSystemFont, sans-serif;
                }
                .prompt-content {
                    text-align: center;
                }
                .prompt-content p {
                    margin: 8px 0;
                }
                #close-prompt {
                    background: #3f51b5;
                    color: white;
                    border: none;
                    padding: 8px 20px;
                    border-radius: 5px;
                    margin-top: 10px;
                    font-weight: bold;
                }
            `;
            document.head.appendChild(style);
            
            // Добавление обработчика закрытия
            document.getElementById('close-prompt').addEventListener('click', function() {
                promptElement.style.display = 'none';
            });
        }
    }
    
    // Инициализация при загрузке страницы
    setTimeout(function() {
        openFullscreen();
        lockOrientation();
        showInstallPrompt();
    }, 1000);
    
    // Обработка клика для активации полного экрана
    document.addEventListener('click', function() {
        if (!document.fullscreenElement && !document.webkitFullscreenElement) {
            openFullscreen();
        }
    }, { once: false });
    
    // Обработка изменения размера экрана
    window.addEventListener('resize', lockOrientation);
    
    // Автоматический возврат в полноэкранный режим
    document.addEventListener('fullscreenchange', function() {
        if (!document.fullscreenElement && !document.webkitFullscreenElement) {
            setTimeout(openFullscreen, 1000);
        }
    });
    
    document.addEventListener('webkitfullscreenchange', function() {
        if (!document.fullscreenElement && !document.webkitFullscreenElement) {
            setTimeout(openFullscreen, 1000);
        }
    });
}); 