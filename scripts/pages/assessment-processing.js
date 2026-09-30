/* =====================================================
   NEXT — ASSESSMENT PROCESSING PAGE JS
   assessment-processing.html
   ====================================================== */

(function initAssessmentProcessing() {

    /* =====================================================
       DOM
       ===================================================== */

    const processingCard = document.getElementById('processingCard');
    const errorCard = document.getElementById('errorCard');
    const errorTitle = document.getElementById('errorTitle');
    const errorText = document.getElementById('errorText');
    const errorLink = document.getElementById('errorLink');

    const pageTitle = document.getElementById('pageTitle');
    const pageDescription = document.querySelector('.processing-description');


    /* =====================================================
       ERROR
       ===================================================== */

    function showError(title, text, href, label) {
        processingCard.style.display = 'none';

        errorTitle.textContent = title;
        errorText.textContent = text;
        errorLink.href = href || 'assessment-introduction.html';

        // تغيير نص زر "العودة"
        const labelEl = errorLink.querySelector('span');
        if (labelEl) labelEl.textContent = label || 'العودة';

        errorCard.hidden = false;
    }


    /* =====================================================
       GUARD + LOAD STATE
       ===================================================== */

    const profile = readJSON('next_profile');
    const goal = readJSON('next_goal');
    const goalDefinition = readJSON('next_goal_definition');
    const currentState = readJSON('next_current_state');
    const assessment = readJSON('next_assessment');

    (function guard() {
        if (!profile || profile.journey_started !== true) {
            showError('لحظة', 'ما لقينا بداية رحلتك.', 'welcome.html', 'العودة للبداية');
            return;
        }

        if (!isObject(goal) || !goal.value) {
            showError('لحظة', 'لم يتم اختيار الهدف بعد.', 'goal-selection.html', 'اختيار الهدف');
            return;
        }

        if (!isObject(goalDefinition) || !goalDefinition.goal) {
            showError('لحظة', 'لم يتم تحديد تفاصيل الهدف.', 'goal-definition.html', 'تحديد الهدف');
            return;
        }

        if (!isObject(currentState) || !currentState.value) {
            showError('لحظة', 'لم يتم تحديد وضعك الحالي.', 'current-state.html', 'تحديد الوضع');
            return;
        }

        if (!isObject(assessment)) {
            showError('لحظة', 'لم يبدأ التقييم بعد.', 'assessment-introduction.html', 'بدء التقييم');
            return;
        }

        if (assessment.status !== 'completed') {
            window.location.replace('adaptive-question.html');
            return;
        }
    })();


    /* =====================================================
       ANALYSIS BUILDER
       ===================================================== */

    function buildAnalysis() {
        const answers = isObject(assessment.answers) ? assessment.answers : {};

        const known = Array.isArray(assessment.known) ? [...assessment.known] : [];
        const unknown = Array.isArray(assessment.unknown) ? [...assessment.unknown] : [];
        const uncertain = Array.isArray(assessment.uncertain) ? [...assessment.uncertain] : [];
        const controllable = Array.isArray(assessment.controllable) ? [...assessment.controllable] : [];

        const goalValue = goal.value;
        const goalLabel = goal.label || '';
        const stateValue = currentState.value;

        const positionSummary = buildPositionSummary({
            known,
            unknown,
            uncertain,
            controllable,
            goalLabel,
            stateValue
        });

        return {
            goal_snapshot: goalValue,
            goal_label: goalLabel,
            state_snapshot: stateValue,
            known,
            unknown,
            uncertain,
            controllable,
            position_summary: positionSummary,
            answers_count: Array.isArray(assessment.asked_question_ids)
                ? assessment.asked_question_ids.length
                : 0,
            completed_at: assessment.completed_at || new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
    }


    function buildPositionSummary({
        known,
        unknown,
        uncertain,
        controllable,
        goalLabel,
        stateValue
    }) {
        const parts = [];

        if (goalLabel) parts.push(`الهدف الحالي: ${goalLabel}.`);
        if (known.length) parts.push(`لديك عناصر واضحة (${known.length}).`);
        if (unknown.length) parts.push(`لديك عناصر غير واضحة (${unknown.length}).`);
        if (uncertain.length) parts.push(`لديك نقاط غير مؤكدة (${uncertain.length}).`);
        if (controllable.length) parts.push(`لديك جوانب يمكنك التأثير عليها (${controllable.length}).`);

        return parts.join(' ');
    }


    /* =====================================================
       STEPS UI
       ===================================================== */

    const steps = [
        document.getElementById('step1'),
        document.getElementById('step2'),
        document.getElementById('step3'),
        document.getElementById('step4')
    ];

    let currentStep = 0;
    let intervalId = null;
    let finished = false;

    function updateSteps() {
        steps.forEach((step, index) => {
            step.classList.remove('active', 'done');

            if (index < currentStep) step.classList.add('done');
            if (index === currentStep) step.classList.add('active');
        });
    }

    function markAllDone() {
        steps.forEach(step => {
            step.classList.remove('active');
            step.classList.add('done');
        });

        processingCard.classList.add('completed');

        if (pageTitle) {
            pageTitle.textContent = 'خلصنا نرتب الصورة.';
        }

        if (pageDescription) {
            pageDescription.textContent = 'جاهزين نعرض لك اللي فهمناه.';
        }
    }


    /* =====================================================
       REDUCED MOTION
       ===================================================== */

    const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
    ).matches;


    /* =====================================================
       FINALIZE
       ===================================================== */

    function finalize() {
        if (finished) return;
        finished = true;

        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }

        markAllDone();

        const analysis = buildAnalysis();
        saveJSON('next_analysis', analysis);

        if (profile) {
            profile.updated_at = new Date().toISOString();
            saveJSON('next_profile', profile);
        }

        setTimeout(() => {
            window.location.href = 'analysis.html';
        }, prefersReducedMotion ? 200 : 1400);
    }


    /* =====================================================
       START
       ===================================================== */

    (function start() {

        if (prefersReducedMotion) {
            currentStep = steps.length;
            markAllDone();
            finalize();
            return;
        }

        updateSteps();

        intervalId = setInterval(() => {
            currentStep++;
            updateSteps();

            if (currentStep >= steps.length) {
                clearInterval(intervalId);
                intervalId = null;
                setTimeout(finalize, 800);
            }
        }, 1100);

    })();


    /* =====================================================
       CLEANUP ON UNLOAD
       ===================================================== */

    window.addEventListener('beforeunload', () => {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
    });

})();