/* =====================================================
   NEXT — GOAL SELECTION PAGE JS
   goal-selection.html
   ====================================================== */

(function initGoalSelection() {

    const goalOptions = document.querySelectorAll('.goal-option');
    const continueButton = document.getElementById('continueButton');
    const goalGrid = document.getElementById('goalGrid');

    let selectedGoal = null;
    let selectedLabel = null;


    /* =====================================================
       RESTORE SELECTION
       ===================================================== */

    function restoreSelection() {
        try {
            const saved = readJSON('next_goal');
            if (!saved || !saved.value) return;

            const savedOption = document.querySelector(
                `[data-goal="${saved.value}"]`
            );

            if (savedOption) applySelection(savedOption);
        } catch (error) {
            /* ignore */
        }
    }


    /* =====================================================
       SELECT
       ===================================================== */

    function applySelection(option) {
        goalOptions.forEach(item => {
            item.classList.remove('selected');
            item.setAttribute('aria-checked', 'false');
        });

        option.classList.add('selected');
        option.setAttribute('aria-checked', 'true');

        selectedGoal = option.dataset.goal;
        selectedLabel = option.dataset.label || '';

        if (continueButton) {
            continueButton.disabled = false;
        }
    }


    /* =====================================================
       EVENTS
       ===================================================== */

    goalOptions.forEach(option => {
        option.addEventListener('click', () => applySelection(option));

        option.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                applySelection(option);
            }
        });
    });


    /* =====================================================
       INVALIDATE DERIVED
       ===================================================== */

    function invalidateDerived() {
        const derivedKeys = [
            'next_goal_definition',
            'next_current_state',
            'next_assessment',
            'next_analysis',
            'next_control_map',
            'next_steps',
            'next_progress'
        ];

        derivedKeys.forEach(key => removeKey(key));
    }


    /* =====================================================
       SAVE GOAL
       ===================================================== */

    function saveGoal() {
        const previous = readJSON('next_goal');
        const now = new Date().toISOString();

        if (previous && previous.value && previous.value !== selectedGoal) {
            invalidateDerived();
        }

        saveJSON('next_goal', {
            value: selectedGoal,
            label: selectedLabel,
            updated_at: now
        });

        const profile = readJSON('next_profile');
        if (profile) {
            profile.updated_at = now;
            saveJSON('next_profile', profile);
        }
    }


    /* =====================================================
       CONTINUE
       ===================================================== */

    if (continueButton) {
        continueButton.addEventListener('click', () => {
            if (!selectedGoal) return;

            saveGoal();

            continueButton.disabled = true;
            continueButton.innerHTML = `
                <span class="button-spinner" aria-hidden="true"></span>
                <span>جارٍ المتابعة...</span>
            `;

            setTimeout(() => {
                window.location.href = 'goal-definition.html';
            }, 400);
        });
    }


    /* =====================================================
       INIT
       ===================================================== */

    (function init() {
        ensureSession();
        restoreSelection();
    })();

})();