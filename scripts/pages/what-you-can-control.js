/* =====================================================
   NEXT — WHAT YOU CAN CONTROL PAGE JS
   what-you-can-control.html
   ====================================================== */

(function initWhatYouCanControl() {

    /* =====================================================
       DOM
       ===================================================== */

    const errorCard = document.getElementById('errorCard');
    const errorTitle = document.getElementById('errorTitle');
    const errorText = document.getElementById('errorText');
    const contentArea = document.getElementById('contentArea');
    const controllableList = document.getElementById('controllableList');
    const uncontrollableList = document.getElementById('uncontrollableList');
    const continueButton = document.getElementById('continueButton');


    /* =====================================================
       ERROR
       ===================================================== */

    function showError(title, text, redirectTo) {
        contentArea.style.display = 'none';
        errorTitle.textContent = title;
        errorText.textContent = text;
        errorCard.hidden = false;

        if (redirectTo) {
            setTimeout(() => {
                window.location.replace(redirectTo);
            }, 1800);
        }
    }


    /* =====================================================
       BUILD CONTROL MAP
       ===================================================== */

    function buildControlMap(analysis) {
        // --- Controllable: من التحليل ---
        const controllable = Array.isArray(analysis.controllable)
            ? analysis.controllable.map(item => {
                if (typeof item === 'string') {
                    return { title: item, description: '' };
                }
                return {
                    title: item.title || '',
                    description: item.description || ''
                };
            }).filter(item => item.title)
            : [];

        // --- Uncontrollable: ثابتة مع منطقية ---
        const uncontrollable = [
            {
                title: 'قرار الجهة التي تتقدم إليها',
                description: 'يمكنك الاستعداد والتقديم، لكن القرار النهائي ليس بيدك.'
            },
            {
                title: 'الظروف الخارجية',
                description: 'بعض الظروف المحيطة قد تؤثر على النتيجة، لكنها ليست شيئًا يمكنك التحكم به مباشرة.'
            },
            {
                title: 'تصرفات أو قرارات الآخرين',
                description: 'لا يمكنك ضمان كيف سيتصرف شخص آخر أو كيف سيتخذ قراره.'
            },
            {
                title: 'التوقيت الذي يحدده غيرك',
                description: 'بعض الأمور تُحسم في أوقات لا تملكها أنت.'
            }
        ];

        return { controllable, uncontrollable };
    }


    /* =====================================================
       CREATE CONTROL ROW
       ===================================================== */

    function createControlRow(item, type) {
        const row = document.createElement('div');
        row.className = 'control-row';

        const icon = document.createElement('div');
        icon.className = 'control-row-icon';
        icon.setAttribute('aria-hidden', 'true');
        icon.textContent = type === 'controllable' ? '●' : '○';

        const content = document.createElement('div');
        content.className = 'control-row-content';

        const title = document.createElement('h3');
        title.className = 'control-row-title';
        title.textContent = item.title;

        content.appendChild(title);

        if (item.description) {
            const description = document.createElement('p');
            description.className = 'control-row-text';
            description.textContent = item.description;
            content.appendChild(description);
        }

        row.appendChild(icon);
        row.appendChild(content);

        return row;
    }


    /* =====================================================
       RENDER CONTROL MAP
       ===================================================== */

    function renderControlMap(analysis) {
        const controlMap = buildControlMap(analysis);

        // --- Controllable ---
        controllableList.innerHTML = '';

        if (!controlMap.controllable.length) {
            const empty = document.createElement('p');
            empty.style.color = '#9CA3AF';
            empty.style.fontSize = '13.5px';
            empty.style.padding = '16px';
            empty.style.textAlign = 'center';
            empty.textContent = 'ما في عناصر واضحة هون حاليًا.';
            controllableList.appendChild(empty);
        } else {
            controlMap.controllable.forEach(item => {
                controllableList.appendChild(createControlRow(item, 'controllable'));
            });
        }

        // --- Uncontrollable ---
        uncontrollableList.innerHTML = '';

        controlMap.uncontrollable.forEach(item => {
            uncontrollableList.appendChild(createControlRow(item, 'uncontrollable'));
        });

        // --- Save next_control_map ---
        const now = new Date().toISOString();

        saveJSON('next_control_map', {
            controllable: controlMap.controllable,
            uncontrollable: controlMap.uncontrollable,
            updated_at: now
        });

        const profile = readJSON('next_profile');
        if (profile) {
            profile.updated_at = now;
            saveJSON('next_profile', profile);
        }
    }


    /* =====================================================
       GUARD
       ===================================================== */

    (function guard() {
        const profile = readJSON('next_profile');
        const goal = readJSON('next_goal');
        const analysis = readJSON('next_analysis');

        if (!profile || profile.journey_started !== true) {
            showError('لحظة.', 'ما لقينا بداية رحلتك. جارٍ التحويل...', 'welcome.html');
            return;
        }

        if (!isObject(goal) || !goal.value) {
            showError('لحظة.', 'لم يتم اختيار الهدف بعد. جارٍ التحويل...', 'goal-selection.html');
            return;
        }

        if (!isObject(analysis)) {
            showError('لحظة.', 'لم يكتمل التحليل بعد. جارٍ التحويل...', 'analysis.html');
            return;
        }

        renderControlMap(analysis);
    })();


    /* =====================================================
       CONTINUE
       ===================================================== */

    if (continueButton) {
        continueButton.addEventListener('click', () => {
            continueButton.disabled = true;
            continueButton.innerHTML = `
                <span class="button-spinner" aria-hidden="true"></span>
                <span>جارٍ المتابعة...</span>
            `;

            setTimeout(() => {
                window.location.href = 'next-steps.html';
            }, 400);
        });
    }


    /* =====================================================
       INIT
       ===================================================== */

    (function init() {
        ensureSession();
    })();

})();