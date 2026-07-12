const GEMINI_API_KEY = "AQ.Ab8RN6I-Mv1KSBFLQEnjCJwGx1crUJeHseOnnP53OEUAoICc3w";

async function generateAIRecipe() {
    const btn = document.querySelector('#ai-chef-modal .btn-primary') || document.getElementById('btn-ai-chef');
    const content = document.getElementById('ai-recipe-content');
    
    if (typeof userInventory === 'undefined' || !userInventory || userInventory.length === 0) {
        if(content) content.innerHTML = '<div style="color:var(--warning); text-align:center;">Ваш холодильник пуст! Добавьте продукты в инвентарь.</div>';
        return;
    }

    const ingredients = userInventory.map(item => item.name).join(', ');

    if (btn) {
        btn.disabled = true;
        btn.dataset.oldText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Шеф думает...';
    }
    
    if (content) {
        content.innerHTML = '<div style="text-align:center; padding:20px; color:var(--text-secondary);">Нейросеть составляет рецепт из ваших продуктов...</div>';
    }

    try {
        const promptText = `
            Ты — профессиональный шеф-повар. Придумай вкусный рецепт, используя эти ингредиенты: ${ingredients}.
            Базовые вещи (соль, перец, вода, масло) можно использовать по умолчанию.
            Если ингредиентов мало, придумай что-то простое.
            Твой ответ должен быть СТРОГО в формате JSON без разметки markdown, по этой структуре:
            {
                "title": "Название блюда",
                "time": "Время (например: 30 мин)",
                "difficulty": "Сложность (Легко, Средне или Сложно)",
                "ingredients": ["ингредиент 1", "ингредиент 2"],
                "instructions": ["шаг 1", "шаг 2"]
            }
        `;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }],
                generationConfig: {
                    temperature: 0.7,
                    responseMimeType: "application/json"
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Детали ошибки от API:", errorData);
            throw new Error(`Ошибка ${response.status}: ${errorData.error?.message || 'Неизвестная ошибка'}`);
        }

        const data = await response.json();
        let jsonString = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!jsonString) {
            throw new Error('Пустой ответ от модели (возможно, сработал фильтр безопасности)');
        }
        // На случай если модель всё же обернёт ответ в ```json ... ```
        jsonString = jsonString.trim().replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/```\s*$/, '');
        const recipe = JSON.parse(jsonString);

        if (content) {
            content.innerHTML = `
                <div class="recipe-card" style="cursor: default; border: 2px solid var(--accent); padding: 15px; border-radius: 12px; background: var(--surface-light);">
                    <h3 style="margin-top:0; color:var(--primary); font-size: 1.4em;">${recipe.title}</h3>
                    <div class="recipe-meta" style="margin-bottom: 15px; display: flex; gap: 15px; color: var(--text-secondary); font-size: 0.9em;">
                        <span><i class="far fa-clock"></i> ${recipe.time}</span>
                        <span><i class="fas fa-signal"></i> ${recipe.difficulty}</span>
                    </div>
                    <div class="recipe-ingredients" style="margin-bottom: 15px;">
                        <strong style="color: var(--text-primary);">Ингредиенты:</strong>
                        <ul style="padding-left: 20px; margin-top: 5px; color: var(--text-secondary);">
                            ${recipe.ingredients.map(i => `<li>${i}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="recipe-instructions">
                        <strong style="color: var(--text-primary);">Приготовление:</strong>
                        <ol style="padding-left: 20px; margin-top: 5px; color: var(--text-secondary);">
                            ${recipe.instructions.map(i => `<li style="margin-bottom: 8px;">${i}</li>`).join('')}
                        </ol>
                    </div>
                </div>
            `;
        }

    } catch (error) {
        console.error("AI Chef Error:", error);
        if (content) {
            content.innerHTML = `
                <div style="text-align:center; color:var(--error); padding:20px;">
                    <i class="fas fa-exclamation-triangle" style="font-size:2em; margin-bottom:10px;"></i><br>
                    Упс, Шеф уронил кастрюлю!<br>
                    <span style="font-size:0.8em; opacity:0.7">Попробуйте еще раз. (${error.message})</span>
                </div>
            `;
        }
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = btn.dataset.oldText || 'Придумать рецепт';
        }
    }
}