/* =====================================================
   NEXT — ACTION DETAILS PAGE JS
   action-details.html
   ====================================================== */

(function initActionDetails() {

    /* =====================================================
       DOM
       ===================================================== */

    const actionTitle = document.getElementById('actionTitle');
    const actionReason = document.getElementById('actionReason');
    const actionWhy = document.getElementById('actionWhy');
    const actionList = document.getElementById('actionList');
    const completionCriteria = document.getElementById('completionCriteria');
    const estimatedTime = document.getElementById('estimatedTime');
    const effortLevel = document.getElementById('effortLevel');
    const actionNote = document.getElementById('actionNote');
    const noteCounter = document.getElementById('noteCounter');
    const completionSection = document.getElementById('completionSection');
    const completionSvg = document.getElementById('completionSvg');
    const completionTitle = document.getElementById('completionTitle');
    const completionText = document.getElementById('completionText');
    const completeButton = document.getElementById('completeButton');
    const completeButtonLabel = document.getElementById('completeButtonLabel');
    const progressButton = document.getElementById('progressButton');
    const backButton = document.getElementById('backButton');
    const toast = document.getElementById('toast');


    /* =====================================================
       DEMO FALLBACK
       ===================================================== */

    function buildDemoSteps() {
        const now = new Date().toISOString();

        const steps = {
            primary: {
                id: 'step_clarify',
                title: 'وضّح أهم نقطة غير واضحة عندك حاليًا',
                reason: 'قبل إضافة خطوات جديدة، تحتاج أولًا تفهم النقطة التي تُعيق رؤيتك الحالية.',
                why: 'لأن الوضوح يأتي قبل التنفيذ. عندما تعرف ما الذي لا تفهمه بالضبط، يصبح من السهل أن تحدد الخطوة الصحيحة بعدها.',
                outcome: 'يكون عندك فهم أوضح لنقطة واحدة على الأقل، وقرار مبدئي حولها.',
                effort: 'medium',
                estimated_minutes: 45,
                status: 'pending',
                note: '',
                completed_at: null,
                actions: [
                    'اكتب الأشياء التي تعرف أنك تحتاجها للوصول إلى هدفك.',
                    'قارنها بما تعرفه وتملكه حاليًا.',
                    'حدد نقطة واحدة ما زالت تحتاج إلى فهم أو تطوير.'
                ],
                updated_at: now
            },
            secondary: [
                { id: 'step_02', title: 'طوّر الجانب الأكثر ارتباطًا بهدفك', description: 'بعد وضوح الأولوية.' },
                { id: 'step_03', title: 'راجع تقدمك بعد التنفيذ', description: 'بعد تنفيذ الخطوات الأولى.' }
            ],
            explanation: 'لأنها مرتبطة بالأشياء التي يمكنك التأثير فيها.',
            goal_snapshot: 'demo',
            updated_at: now
        };

        saveJSON('next_steps', steps);
        return steps;
    }


    function loadSteps() {
        const existing = readJSON('next_steps');
        if (isObject(existing) && isObject(existing.primary)) return existing;
        return buildDemoSteps();
    }


    /* =====================================================
       LABEL HELPERS
       ===================================================== */

    function effortLabel(value) {
        const labels = { low: 'منخفض', medium: 'متوسط', high: 'مرتفع' };
        return labels[value] || 'متوسط';
    }

    function timeLabel(minutes) {
        const value = Number(minutes);
        if (!value || Number.isNaN(value)) return '30–45 دقيقة';
        if (value <= 20) return `${value} دقيقة`;
        if (value <= 45) return '30–45 دقيقة';
        if (value <= 60) return 'حوالي ساعة';
        return `حوالي ${Math.round(value / 60)} ساعة`;
    }


    /* =====================================================
       DEFAULT ACTIONS
       ===================================================== */

    const DEFAULT_ACTIONS = [
        'اكتب الأشياء التي تعرف أنك تحتاجها للوصول إلى هدفك.',
        'قارنها بما تعرفه وتملكه حاليًا.',
        'حدد نقطة واحدة ما زالت تحتاج إلى فهم أو تطوير.'
    ];


    /* =====================================================
       TOAST
       ===================================================== */

    let toastTimer;

    function showToast(message) {
        if (!toast) return;
        clearTimeout(toastTimer);
        toast.textContent = message;
        toast.classList.add('show');
        toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
    }


    /* =====================================================
       RENDER ACTION
       ===================================================== */

    function renderAction(action) {
        if (actionTitle) {
            actionTitle.textContent = action.title || 'تفاصيل الخطوة';
        }

        if (actionReason) {
            actionReason.textContent = action.reason || '';
        }

        if (actionWhy) {
            actionWhy.textContent = action.why || '';
        }

        if (completionCriteria) {
            completionCriteria.textContent = action.outcome || '';
        }

        if (estimatedTime) {
            estimatedTime.textContent = timeLabel(action.estimated_minutes);
        }

        if (effortLevel) {
            effortLevel.textContent = effortLabel(action.effort);
        }

        // Action List
        if (actionList) {
            actionList.innerHTML = '';

            const actions = Array.isArray(action.actions) && action.actions.length
                ? action.actions
                : DEFAULT_ACTIONS;

            actions.forEach((item, index) => {
                const wrapper = document.createElement('div');
                wrapper.className = 'action-item';
                wrapper.style.setProperty('--i', index);

                const number = document.createElement('div');
                number.className = 'action-item-number';
                number.textContent = String(index + 1).padStart(2, '0');

                const text = document.createElement('p');
                text.className = 'action-item-text';
                text.textContent = item;

                wrapper.appendChild(number);
                wrapper.appendChild(text);
                actionList.appendChild(wrapper);
            });
        }

        // Note
        if (actionNote) {
            actionNote.value = typeof action.note === 'string' ? action.note : '';
            updateNoteCounter();
        }

        // Completion UI
        updateCompletionUI(action.status === 'completed');
    }


    /* =====================================================
       COMPLETION UI
       ===================================================== */

    function updateCompletionUI(completed) {
        if (!completionSection) return;

        if (completed) {
            completionSection.classList.add('completed');

            if (completionSvg) {
                completionSvg.innerHTML = `<path d="m5 12 4 4L19 6"></path>`;
            }

            if (completionTitle) {
                completionTitle.textContent = 'تم إنجاز الخطوة';
            }

            if (completionText) {
                completionText.textContent = 'تم حفظ تقدمك. هذه الخطوة ستبقى مُعلّمة كمكتملة في رحلتك.';
            }

            if (completeButtonLabel) {
                completeButtonLabel.textContent = 'تم الإنجاز';
            }

            if (completeButton) {
                completeButton.classList.add('success');
            }

            if (progressButton) {
                progressButton.style.display = 'inline-flex';
            }
        } else {
            completionSection.classList.remove('completed');

            if (completionSvg) {
                completionSvg.innerHTML = `<circle cx="12" cy="12" r="9"></circle>`;
            }

            if (completionTitle) {
                completionTitle.textContent = 'خلصت الخطوة؟';
            }

            if (completionText) {
                completionText.textContent = 'علّم عليها كمكتملة لما تنتهي. هذا يساعد NEXT يفهم تقدمك في الخطوات القادمة.';
            }

            if (completeButtonLabel) {
                completeButtonLabel.textContent = 'أنجزت الخطوة';
            }

            if (completeButton) {
                completeButton.classList.remove('success');
            }

            if (progressButton) {
                progressButton.style.display = 'none';
            }
        }
    }


    /* =====================================================
       PERSIST CHANGES
       ===================================================== */

    function persistChanges(partial) {
        const steps = readJSON('next_steps');
        if (!isObject(steps) || !isObject(steps.primary)) return;

        const now = new Date().toISOString();

        steps.primary = {
            ...steps.primary,
            ...partial,
            updated_at: now
        };

        steps.updated_at = now;
        saveJSON('next_steps', steps);

        // Update progress
        const isCompleted = steps.primary.status === 'completed';
        const existingProgress = readJSON('next_progress') || {};

        const existingCompleted = Array.isArray(existingProgress.completed_steps)
            ? existingProgress.completed_steps
            : [];

        const filteredCompleted = existingCompleted.filter(
            id => id !== steps.primary.id
        );

        const progress = {
            current_step_id: steps.primary.id || null,
            current_step_status: steps.primary.status || 'pending',
            completed_steps: isCompleted
                ? [...filteredCompleted, steps.primary.id]
                : filteredCompleted,
            started_at: existingProgress.started_at || now,
            updated_at: now
        };

        saveJSON('next_progress', progress);

        const profile = readJSON('next_profile');
        if (profile) {
            profile.updated_at = now;
            saveJSON('next_profile', profile);
        }
    }


    /* =====================================================
       NOTE COUNTER
       ===================================================== */

    const NOTE_MAX = 500;

    function updateNoteCounter() {
        if (!noteCounter || !actionNote) return;

        const length = actionNote.value.length;

        noteCounter.textContent = `${length} / ${NOTE_MAX}`;

        noteCounter.classList.toggle('warning', length >= 400 && length < 480);
        noteCounter.classList.toggle('limit', length >= 480);
    }


    /* =====================================================
       INIT
       ===================================================== */

    (function init() {
        ensureSession();
        const steps = loadSteps();
        renderAction(steps.primary);
    })();


    /* =====================================================
       COMPLETE BUTTON
       ===================================================== */

    if (completeButton) {
        completeButton.addEventListener('click', () => {
            const steps = readJSON('next_steps');
            if (!isObject(steps) || !isObject(steps.primary)) return;

            const currentlyCompleted = steps.primary.status === 'completed';
            const nextStatus = currentlyCompleted ? 'in_progress' : 'completed';

            const completedAt = nextStatus === 'completed'
                ? new Date().toISOString()
                : null;

            persistChanges({
                status: nextStatus,
                completed_at: completedAt
            });

            updateCompletionUI(nextStatus === 'completed');

            if (nextStatus === 'completed') {
                showToast('تم إنجاز الخطوة. تقدمك محفوظ.');
            }
        });
    }


    /* =====================================================
       NOTE INPUT
       ===================================================== */

    if (actionNote) {
        actionNote.addEventListener('input', () => {
            updateNoteCounter();
            persistChanges({ note: actionNote.value });
        });
    }


    /* =====================================================
       BACK
       ===================================================== */

    if (backButton) {
        backButton.addEventListener('click', () => {
            window.location.href = 'next-steps.html';
        });
    }

})();