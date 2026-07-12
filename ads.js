// ads-integration.js
// Логика показа рекламы Adsgram внутри интерфейса приложения: разблокировка
// премиум-аватаров за просмотры, промежуточная реклама между действиями,
// рендер нативного рекламного задания и вспомогательный fallback для копирования в буфер.


    // --- ADSGRAM INTEGRATION (CLEAN & FIXED) ---
    // 1. КОНФИГУРАЦИЯ
    const AdConfig = {
        RewardID: "20296",      // Видео за вознаграждение
        InterID: "int-20297",   // Промежуточная реклама
        NativeID: "task-20298"  // Нативная реклама (задание)
    };

    // Вспомогательная функция для сброса кнопки
    function resetBtn(btn, html) {
        if(btn) {
            btn.innerHTML = html;
            btn.disabled = false;
            btn.style.opacity = '1';
        }
    }

    // 3. ПРОВЕРКА ОТКРЫТИЯ АВАТАРОВ (ИСПРАВЛЕНО)
function checkAvatarUnlocks() {
    // Просто проверяем, не открыли ли мы какой-то премиум аватар
    // НЕ НУЖНО здесь выводить Alert о том, что "мало реклам".
    // Этот Alert уже есть в кнопке загрузки (tryUploadAvatar).

    const unlocked = premiumAvatars.find(a => a.count === adsWatchedCount);
    
    if (unlocked) {
        showModal('avatar-modal');
        showToast(`🎉 Открыт новый аватар: ${unlocked.name}!`, 'success');
        
        // Добавляем уведомление
        userNotifications.push({
            id: Date.now(),
            type: 'success',
            message: `Новый аватар "${unlocked.name}" получен!`,
            icon: 'fas fa-gift',
            date: new Date().toISOString(),
            read: false
        });
        updateHeader();
    }
    
    // Если мы достигли 100, можно отдельно поздравить с разблокировкой загрузки
    if (adsWatchedCount === ADS_TO_UNLOCK_AVATAR) {
        showToast("🔓 Загрузка своих фото разблокирована!", "success");
    }
}

    // 4. ПРОМЕЖУТОЧНАЯ РЕКЛАМА (INTERSTITIAL)
    let adActionCounter = 0;
    const AD_INTERVAL = 3;

    function checkInterstitialAd() {
        adActionCounter++;
        
        if (adActionCounter % AD_INTERVAL !== 0) return;
        if (!window.Adsgram) return;

        // Небольшая задержка перед показом
        setTimeout(() => {
            try {
                window.Adsgram.init({ blockId: AdConfig.InterID }).show()
                    .then(() => console.log('Inter closed'))
                    .catch(e => console.log('Inter skipped', e));
            } catch (e) { console.error(e); }
        }, 1500);
    }

    // 5. НАТИВНЫЙ БЛОК (Задание в списке покупок)
function renderNativeAdTask(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Вставляем веб-компонент
    container.innerHTML = `
        <adsgram-task data-block-id="${AdConfig.NativeID}" style="width:100%">
            <span slot="reward" class="ad-reward-slot" style="color:#10B981; font-weight:bold; font-size:0.8em">+10 XP</span>
            <div slot="button" class="ad-btn-go">Go</div>
            <div slot="claim" class="ad-btn-claim">Claim</div>
            <div slot="done" class="ad-btn-done">Done</div>
        </adsgram-task>
    `;

    // --- ИСПРАВЛЕНИЕ: Ждем отрисовки элемента ---
    setTimeout(() => {
        const taskElement = container.querySelector('adsgram-task'); 
        
        // Если скрипт рекламы заблокирован или не загрузился, элемента может не быть
        if (!taskElement) {
            console.log("Adsgram element not created (AdBlock or loading error)");
            return; 
        }

        taskElement.addEventListener('reward', (event) => {
            console.log('Adsgram Task Reward:', event.detail);
            
            const rewardAmount = 10; 
            addXp(rewardAmount);
            adsWatchedCount++;
            saveData(false);
            
            hideModal('ad-task-modal'); 
            showToast(`Задание выполнено! +${rewardAmount} XP`, 'success');
            triggerLevelUpEffect();
            checkAvatarUnlocks();
        });

        taskElement.addEventListener('onBannerNotFound', () => {
             console.log('Task banner not found');
        });
    }, 100);
}

    // --- ПРОЧИЕ ФУНКЦИИ (Crypto & Tutorial) ---
    function copyCrypto(address) {
    // Очищаем адрес от возможных пробелов и переносов строк
    const cleanAddress = address.trim();

    if (!cleanAddress) return showToast("Ошибка: пустой адрес", "error");

    // Попытка 1: Современный API
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(cleanAddress)
            .then(() => showToast("Адрес скопирован!", "success"))
            .catch(err => fallbackCopy(cleanAddress));
    } else {
        // Попытка 2: Старый метод (для старых браузеров/WebView)
        fallbackCopy(cleanAddress);
    }
}

function fallbackCopy(text) {
    try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        
        // Делаем элемент невидимым, но существующим
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
            showToast("Адрес скопирован!", "success");
        } else {
            prompt("Не удалось скопировать автоматически. Скопируйте вручную:", text);
        }
    } catch (err) {
        prompt("Скопируйте адрес вручную:", text);
    }
}

    // Логика обучения (Tutorial)
    let currentTutorialStep = 1;
    const totalTutorialSteps = 5;

    function startTutorial() {
        currentTutorialStep = 1;
        updateTutorialUI();
        showModal('tutorial-modal');
    }

    function updateTutorialUI() {
        document.querySelectorAll('.tutorial-step').forEach(el => el.classList.remove('active'));
        const activeStep = document.querySelector(`.tutorial-step[data-step="${currentTutorialStep}"]`);
        if(activeStep) activeStep.classList.add('active');
        
        const dots = document.getElementById('tutorial-dots').children;
        for(let i=0; i<dots.length; i++) {
            dots[i].className = i < currentTutorialStep ? 'dot active' : 'dot';
        }

        const nextBtn = document.getElementById('tutorial-next-btn');
        if(nextBtn) nextBtn.textContent = currentTutorialStep === totalTutorialSteps ? "Погнали!" : "Далее";
    }

    function nextTutorialStep() {
        if (currentTutorialStep < totalTutorialSteps) {
            currentTutorialStep++;
            updateTutorialUI();
        } else {
            completeTutorial();
        }
    }

    function skipTutorial() {
        if(confirm("Пропустить обучение?")) completeTutorial();
    }

    function completeTutorial() {
        hideModal('tutorial-modal');
        if(currentUser) {
            currentUser.tutorialCompleted = true;
            saveData(false);
        }
        localStorage.setItem('axio_tutorial_seen', 'true');
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    }
