/* =====================================================
   NEXT — CURRENT STATE PAGE JS
   current-state.html
   ====================================================== */

(function initCurrentState() {

    /* =====================================================
       ELEMENTS
       ===================================================== */

    const options = document.querySelectorAll('.state-option');
    const nextButton = document.getElementById('continueButton');
    const stateOptions = document.getElementById('stateOptions');

    let selectedState = null;


    /* =====================================================
       RESTORE SELECTION
       ===================================================== */

    function restoreSelection() {
        const saved = readJSON('next_current_state');
        if (saved && saved.value) {
            selectedState = saved.value;
        }
    }


    /* =====================================================
       UPDATE UI
       ===================================================== */

    function updateSelection() {
        options.forEach(option => {
            const isSelected = option.dataset.value === selectedState;

            option.classList.toggle('selected', isSelected);
            option.setAttribute('aria-checked', String(isSelected));
        });

        if (nextButton) {
            nextButton.disabled = !selectedState;
        }
    }


    /* =====================================================
       SELECT
       ===================================================== */

    function applySelection(option) {
        selectedState = option.dataset.value;
        updateSelection();
    }

    options.forEach(option => {
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
            'next_assessment',
            'next_analysis',
            'next_control_map',
            'next_steps',
            'next_progress'
        ];

        derivedKeys.forEach(key => removeKey(key));
    }


    /* =====================================================
       SAVE STATE
       ===================================================== */

    function saveCurrentState() {
        const previous = readJSON('next_current_state');
        const now = new Date().toISOString();

        const hasChanged = !previous || previous.value !== selectedState;

        saveJSON('next_current_state', {
            value: selectedState,
            updated_at: now
        });

        if (hasChanged) invalidateDerived();

        const profile = readJSON('next_profile');
        if (profile) {
            profile.updated_at = now;
            saveJSON('next_profile', profile);
        }
    }


    /* =====================================================
       CONTINUE
       ===================================================== */

    if (nextButton) {
        nextButton.addEventListener('click', () => {
            if (!selectedState) return;

            saveCurrentState();

            nextButton.disabled = true;
            nextButton.innerHTML = `
                <span class="button-spinner" aria-hidden="true"></span>
                <span>جارٍ المتابعة...</span>
            `;

            setTimeout(() => {
                window.location.href = 'profile.html';
            }, 400);
        });
    }


    /* =====================================================
       INIT
       ===================================================== */

    (function init() {
        ensureSession();
        restoreSelection();
        updateSelection();
    })();

})();