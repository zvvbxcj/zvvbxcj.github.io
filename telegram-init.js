// telegram-init.js
// Ранняя инициализация Telegram WebApp: определяет, запущено ли приложение
// внутри Telegram, и подгружает Adsgram SDK (только в Telegram-окружении).
// Подключается в <head> до основной логики приложения (body.js).

    // Глобальная функция проверки среды
    window.isTelegramEnv = function() {
        // 1. Проверяем, есть ли объект Telegram
        if (typeof window.Telegram === 'undefined' || typeof window.Telegram.WebApp === 'undefined') {
            return false;
        }
        
        // 2. Проверяем платформу. В обычном браузере platform часто "unknown",
        // но внутри телеграма это "android", "ios", "tdesktop", "macos" и т.д.
        // Если platform известна ИЛИ есть initData — считаем это Телеграмом.
        if (window.Telegram.WebApp.platform !== 'unknown' || window.Telegram.WebApp.initData.length > 0) {
            return true;
        }

        return false;
    };

    function loadAdsgram() {
        if (window.isTelegramEnv()) {
            console.log("Telegram detected via SDK. Loading Adsgram...");
            
            // Сообщаем телеграму, что приложение готово (убирает белый экран быстрее)
            window.Telegram.WebApp.ready();
            window.Telegram.WebApp.expand(); // Разворачиваем на весь экран

            var s1 = document.createElement('script');
            s1.src = "https://sad.adsgram.ai/js/sad.min.js";
            document.head.appendChild(s1);

            var s2 = document.createElement('script');
            s2.src = "https://js.adsgram.ai/effect/task.js";
            document.head.appendChild(s2);
        } else {
            console.log("Regular browser detected. Adsgram skipped.");
        }
    }

    // Запускаем только после загрузки DOM, чтобы точно подхватить SDK
    document.addEventListener('DOMContentLoaded', loadAdsgram);
