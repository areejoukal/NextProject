/* =====================================================
   NEXT — REASSESSMENT PAGE JS
   reassessment.html
   ====================================================== */

(function initReassessment() {

    /* =====================================================
       DOM
       ===================================================== */

    const contextCard = document.getElementById('contextCard');
    const contextList = document.getElementById('contextList');
    const startButton = document.getElementById('startButton');
    const cancelButton = document.getElementById('cancelButton');


    /* =====================================================
       RENDER CONTEXT
       ===================================================== */

    function renderContext() {
        const goal = readJSON('next_goal');
        const assessment = readJSON('next_assessment');
        const steps = readJSON('next_steps');

        const items = [];

        if (isObject(goal) && goal.label) {
            items.push({
                label: 'هدفك الحالي',
                value: goal.label
            });
        }

        if (isObject(steps) && isObject(steps.primary) && steps.primary.title) {
            items.push({
                label: 'خطوتك الأساسية',
                value: steps.primary.title
            });
        }

        if (isObject(assessment) && assessment.completed_at) {
            items.push({
                label: 'آخر تقييم',
                value: formatShortDate(assessment.completed_at)
            });
        }

        if (!items.length) {
            return; // لن نُظهر البطاقة
        }

        contextList.innerHTML = '';

        items.forEach(item => {
            const row = document.createElement('div');
            row.className = 'context-item';

            const label = document.createElement('span');
            label.className = 'context-item-label';
            label.textContent = item.label + ':';

            const value = document.createElement('span');
            value.className = 'context-item-value';
            value.textContent = item.value;

            row.appendChild(label);
            row.appendChild(value);
            contextList.appendChild(row);
        });

        contextCard.style.display = 'block';
    }


    /* =====================================================
       PREPARE REASSESSMENT
       ===================================================== */

    function prepareReassessment() {
        const existing = readJSON('next_assessment');
        const now = new Date().toISOString();

        const previousAssessment = isObject(existing) ? { ...existing } : null;

        const previousKnown = previousAssessment && Array.isArray(previousAssessment.known)
            ? previousAssessment.known : [];

        const previousUnknown = previousAssessment && Array.isArray(previousAssessment.unknown)
            ? previousAssessment.unknown : [];

        const previousUncertain = previousAssessment && Array.isArray(previousAssessment.uncertain)
            ? previousAssessment.uncertain : [];

        const previousControllable = previousAssessment && Array.isArray(previousAssessment.controllable)
            ? previousAssessment.controllable : [];

        const newAssessment = {
            mode: 'reassessment',
            status: 'in_progress',
            started_at: now,
            updated_at: now,
            completed_at: null,
            budget_max: 4,
            budget_used: 0,
            current_question_id: null,
            asked_question_ids: [],
            answers: {},
            known: previousKnown,
            unknown: previousUnknown,
            uncertain: previousUncertain,
            controllable: previousControllable,
            early_completion_reason: null,
            previous: previousAssessment
        };

        saveJSON('next_assessment', newAssessment);

        // تحديث last_reassessment_at
        const progress = readJSON('next_progress') || {};
        progress.last_reassessment_at = now;
        progress.updated_at = now;
        saveJSON('next_progress', progress);

        // تحديث profile
        const profile = readJSON('next_profile');
        if (profile) {
            profile.updated_at = now;
            saveJSON('next_profile', profile);
        }
    }


    /* =====================================================
       START
       ===================================================== */

    if (startButton) {
        startButton.addEventListener('click', () => {
            startButton.disabled = true;
            startButton.innerHTML = `
                <span class="button-spinner" aria-hidden="true"></span>
                <span>جارٍ التحضير...</span>
            `;

            prepareReassessment();

            setTimeout(() => {
                window.location.href = 'adaptive-question.html';
            }, 500);
        });
    }


    /* =====================================================
       CANCEL
       ===================================================== */

    if (cancelButton) {
        cancelButton.addEventListener('click', () => {
            window.location.href = 'progress.html';
        });
    }


    /* =====================================================
       INIT
       ===================================================== */

    (function init() {
        ensureSession();
        renderContext();
    })();

})();