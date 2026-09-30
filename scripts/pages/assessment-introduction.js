/* =====================================================
   NEXT — ASSESSMENT INTRODUCTION PAGE JS
   assessment-introduction.html
   ====================================================== */

(function initAssessmentIntroduction() {

    console.log('🚀 assessment-introduction.js بدأ التحميل');

    /* =====================================================
       ELEMENTS
       ===================================================== */

    const backButton = document.getElementById('backButton');
    const startButton = document.getElementById('startButton');
    const startButtonText = document.getElementById('startButtonText');

    console.log('🔍 العناصر:');
    console.log('  - startButton:', !!startButton);
    console.log('  - backButton:', !!backButton);
    console.log('  - startButtonText:', !!startButtonText);


    /* =====================================================
       GUARDS
       ===================================================== */

    function hasJourneyStarted() {
        const profile = readJSON('next_profile');
        return !!(profile && profile.journey_started === true);
    }

    function hasGoal() {
        const goal = readJSON('next_goal');
        return !!(goal && goal.value);
    }

    function hasGoalDefinition() {
        const definition = readJSON('next_goal_definition');
        return !!(definition && definition.goal);
    }

    function hasCurrentState() {
        const state = readJSON('next_current_state');
        return !!(state && state.value);
    }

    function hasCompleteProfile() {
        const profile = readJSON('next_profile');
        return !!(
            profile &&
            profile.education &&
            profile.field &&
            profile.experience &&
            profile.journey_started === true
        );
    }

    (function guard() {
        console.log('🛡️ فحص الحراس...');

        if (!hasJourneyStarted()) {
            console.error('❌ journey_started = false');
            window.location.replace('welcome.html');
            return;
        }

        if (!hasGoal()) {
            console.error('❌ next_goal غير موجود');
            window.location.replace('goal-selection.html');
            return;
        }

        if (!hasGoalDefinition()) {
            console.error('❌ next_goal_definition غير موجود');
            window.location.replace('goal-definition.html');
            return;
        }

        if (!hasCurrentState()) {
            console.error('❌ next_current_state غير موجود');
            window.location.replace('current-state.html');
            return;
        }

        if (!hasCompleteProfile()) {
            console.error('❌ next_profile غير مكتمل (education/field/experience)');
            window.location.replace('profile.html');
            return;
        }

        console.log('✅ كل الحراس نجحوا');
    })();


    /* =====================================================
       BACK
       ===================================================== */

    if (backButton) {
        backButton.addEventListener('click', () => {
            window.location.href = 'profile.html';
        });
    }


    /* =====================================================
       START ASSESSMENT
       ===================================================== */

    if (startButton) {
        startButton.addEventListener('click', () => {
            console.log('🎯 تم الضغط على زر "نبدأ"');

            try {
                const now = new Date().toISOString();

                const assessmentState = {
                    mode: 'initial',
                    status: 'in_progress',
                    started_at: now,
                    updated_at: now,
                    completed_at: null,
                    budget_max: 8,
                    budget_used: 0,
                    current_question_id: null,
                    asked_question_ids: [],
                    answers: {},
                    known: [],
                    unknown: [],
                    uncertain: [],
                    controllable: [],
                    early_completion_reason: null,
                    version: 1
                };

                // حفظ الحالة
                const saved = saveJSON('next_assessment', assessmentState);
                console.log('💾 حفظ next_assessment:', saved);

                if (!saved) {
                    console.error('❌ فشل حفظ next_assessment');
                    startButton.disabled = false;
                    return;
                }

                // تحديث profile
                const profile = readJSON('next_profile');
                if (profile) {
                    profile.updated_at = now;
                    saveJSON('next_profile', profile);
                }

                // تعطيل الزر + spinner
                startButton.disabled = true;

                if (startButtonText) {
                    startButtonText.innerHTML = `
                        <span class="button-spinner" aria-hidden="true"></span>
                        <span>جارٍ التحضير...</span>
                    `;
                }

                console.log('➡️ جارٍ الانتقال إلى adaptive-question.html...');

                // ✅ الانتقال
                setTimeout(() => {
                    console.log('✅ الآن!');
                    window.location.href = 'adaptive-question.html';
                }, 800);

            } catch (error) {
                console.error('❌ خطأ:', error);
                startButton.disabled = false;

                if (startButtonText) {
                    startButtonText.textContent = 'نبدأ';
                }
            }
        });
    } else {
        console.error('❌ زر البدء غير موجود');
    }


    /* =====================================================
       INIT
       ===================================================== */

    (function init() {
        if (typeof ensureSession === 'function') {
            ensureSession();
        }
    })();

})();