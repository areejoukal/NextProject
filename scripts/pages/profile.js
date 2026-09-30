/* =====================================================
   NEXT — PROFILE PAGE JS
   profile.html
   ====================================================== */

(function initProfile() {

    /* =====================================================
       ELEMENTS
       ===================================================== */

    const profileForm = document.getElementById('profileForm');
    const ageInput = document.getElementById('age');
    const locationInput = document.getElementById('location');
    const educationSelect = document.getElementById('education');
    const fieldInput = document.getElementById('field');
    const experienceSelect = document.getElementById('experience');
    const backgroundTextarea = document.getElementById('background');
    const backgroundCounter = document.getElementById('backgroundCounter');
    const backButton = document.getElementById('backButton');
    const continueButton = document.getElementById('continueButton');

    const BACKGROUND_MAX = 500;


    /* =====================================================
       RESTORE PROFILE
       ===================================================== */

    function restoreProfile() {
        const saved = readJSON('next_profile');
        if (!saved) return;

        if (ageInput) ageInput.value = saved.age ?? '';
        if (locationInput) locationInput.value = saved.location ?? '';
        if (educationSelect) educationSelect.value = saved.education ?? '';
        if (fieldInput) fieldInput.value = saved.field ?? '';
        if (experienceSelect) experienceSelect.value = saved.experience ?? '';
        if (backgroundTextarea) backgroundTextarea.value = saved.background ?? '';

        updateCharCounter();
    }


    /* =====================================================
       VALIDATION
       ===================================================== */

    function setInvalid(element, invalid) {
        const wrapper = element.closest('.field');
        if (!wrapper) return;
        wrapper.classList.toggle('has-error', invalid);
    }

    function validate() {
        let valid = true;

        // AGE — OPTIONAL
        const ageValue = ageInput ? ageInput.value.trim() : '';

        if (ageValue) {
            const numericAge = Number(ageValue);
            const isValidAge =
                /^\d+$/.test(ageValue) &&
                Number.isInteger(numericAge) &&
                numericAge >= 16 &&
                numericAge <= 100;

            if (!isValidAge) {
                setInvalid(ageInput, true);
                valid = false;
            } else {
                setInvalid(ageInput, false);
            }
        } else {
            if (ageInput) setInvalid(ageInput, false);
        }

        // EDUCATION — REQUIRED
        if (!educationSelect.value) {
            setInvalid(educationSelect, true);
            valid = false;
        } else {
            setInvalid(educationSelect, false);
        }

        // FIELD — REQUIRED
        if (!fieldInput.value.trim()) {
            setInvalid(fieldInput, true);
            valid = false;
        } else {
            setInvalid(fieldInput, false);
        }

        // EXPERIENCE — REQUIRED
        if (!experienceSelect.value) {
            setInvalid(experienceSelect, true);
            valid = false;
        } else {
            setInvalid(experienceSelect, false);
        }

        return valid;
    }


    /* =====================================================
       COLLECT PROFILE
       ===================================================== */

    function collectProfile() {
        return {
            age: ageInput.value.trim() ? Number(ageInput.value) : null,
            location: locationInput.value.trim(),
            education: educationSelect.value,
            field: fieldInput.value.trim(),
            experience: experienceSelect.value,
            background: backgroundTextarea.value.trim()
        };
    }


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
       SAVE PROFILE
       ===================================================== */

    function saveProfile() {
        const previous = readJSON('next_profile') || {};
        const current = collectProfile();

        const previousComparable = {
            age: previous.age ?? null,
            location: previous.location ?? '',
            education: previous.education ?? '',
            field: previous.field ?? '',
            experience: previous.experience ?? '',
            background: previous.background ?? ''
        };

        const currentComparable = {
            age: current.age,
            location: current.location,
            education: current.education,
            field: current.field,
            experience: current.experience,
            background: current.background
        };

        const changed =
            JSON.stringify(previousComparable) !==
            JSON.stringify(currentComparable);

        const mergedProfile = {
            ...previous,
            ...current,
            journey_started: true,
            updated_at: new Date().toISOString()
        };

        saveJSON('next_profile', mergedProfile);

        if (changed) invalidateDerived();

        return mergedProfile;
    }


    /* =====================================================
       CHARACTER COUNTER
       ===================================================== */

    function updateCharCounter() {
        if (!backgroundCounter || !backgroundTextarea) return;

        const length = backgroundTextarea.value.length;

        backgroundCounter.textContent = `${length} / ${BACKGROUND_MAX}`;

        backgroundCounter.classList.toggle(
            'warning',
            length >= 400 && length < 480
        );

        backgroundCounter.classList.toggle(
            'limit',
            length >= 480
        );
    }


    /* =====================================================
       LIVE VALIDATION
       ===================================================== */

    const liveInputs = [
        ageInput,
        locationInput,
        educationSelect,
        fieldInput,
        experienceSelect,
        backgroundTextarea
    ].filter(Boolean);

    liveInputs.forEach(element => {
        element.addEventListener('input', () => {
            setInvalid(element, false);
            if (element === backgroundTextarea) updateCharCounter();
        });

        element.addEventListener('change', () => {
            setInvalid(element, false);
        });
    });


    /* =====================================================
       SCROLL TO ERROR
       ===================================================== */

    function scrollToError() {
        const firstError = document.querySelector('.field.has-error');
        if (!firstError) return;

        const prefersReduced = window.matchMedia(
            '(prefers-reduced-motion: reduce)'
        ).matches;

        firstError.scrollIntoView({
            behavior: prefersReduced ? 'auto' : 'smooth',
            block: 'center'
        });

        const input = firstError.querySelector(
            '.field-input, .field-select, .field-textarea'
        );

        if (input) {
            setTimeout(() => input.focus(), prefersReduced ? 0 : 400);
        }
    }


    /* =====================================================
       SUBMIT
       ===================================================== */

    if (profileForm) {
        profileForm.addEventListener('submit', event => {
            event.preventDefault();

            if (!validate()) {
                scrollToError();
                return;
            }

            saveProfile();

            if (continueButton) {
                continueButton.disabled = true;
                continueButton.innerHTML = `
                    <span class="button-spinner" aria-hidden="true"></span>
                    <span>جارٍ التحضير...</span>
                `;
            }

            setTimeout(() => {
                window.location.href = 'assessment-introduction.html';
            }, 400);
        });
    }


    /* =====================================================
       BACK
       ===================================================== */

    if (backButton) {
        backButton.addEventListener('click', () => {
            window.location.href = 'current-state.html';
        });
    }


    /* =====================================================
       INIT
       ===================================================== */

    (function init() {
        ensureSession();
        restoreProfile();
        updateCharCounter();
    })();

})();