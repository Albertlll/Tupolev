// Service Worker для информационного киоска
const CACHE_NAME = 'infomat-cache-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/schedule.html',
  '/slides-template.html',
  '/manifest.json',
  '/css/style.css',
  '/css/slider.css',
  '/css/keyboard.css',
  '/css/schedule.css',
  '/css/stories.css',
  '/js/main.js',
  '/js/slider.js',
  '/js/keyboard.js',
  '/js/schedule.js',
  '/js/fullscreen.js',
  '/slides/slides-data.json',
  '/slides/avatars/college-avatar.svg'
];

// Установка Service Worker и кэширование основных ресурсов
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Открыт кэш');
        return cache.addAll(ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Активация и очистка старых кэшей
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Очистка старого кэша:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Перехват запросов и обслуживание из кэша, если возможно
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Если ресурс найден в кэше, возвращаем его
        if (response) {
          return response;
        }
        
        // Иначе выполняем сетевой запрос
        return fetch(event.request)
          .then(response => {
            // Проверяем, что ответ корректный
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Клонируем ответ, чтобы использовать его и для браузера, и для кэша
            const responseToCache = response.clone();
            
            // Добавляем полученный ресурс в кэш
            caches.open(CACHE_NAME)
              .then(cache => {
                // Исключаем слайды, которые могут быть большими, из автоматического кэширования
                if (!event.request.url.includes('/slides/') || event.request.url.includes('slides-data.json')) {
                  cache.put(event.request, responseToCache);
                }
              });
            
            return response;
          });
      })
      .catch(() => {
        // Для HTML-файлов и страниц возвращаем резервный HTML при отсутствии сети
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('/index.html');
        }
      })
  );
}); 