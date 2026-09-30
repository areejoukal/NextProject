/* =====================================================
   NEXT — ADAPTIVE QUESTION PAGE JS
   adaptive-question.html
   ====================================================== */

(function initAdaptiveQuestion() {

    /* =====================================================
       STATUS UI
       ===================================================== */

    const statusBlock = document.getElementById('statusBlock');
    const statusTitle = document.getElementById('statusTitle');
    const statusText = document.getElementById('statusText');
    const statusSpinner = document.getElementById('statusSpinner');
    const questionCard = document.getElementById('questionCard');
    const stepperArea = document.getElementById('stepperArea');


    function showLoading(title, text) {
        statusSpinner.style.display = 'block';
        statusTitle.textContent = title || 'جارٍ التحضير...';
        statusText.textContent = text || 'لحظة من فضلك.';

        statusBlock.style.display = 'block';
        questionCard.style.display = 'none';
        stepperArea.style.display = 'none';
    }


    function showError(title, text, redirectUrl) {
        statusSpinner.style.display = 'none';
        statusTitle.textContent = title;
        statusText.textContent = text;

        statusBlock.style.display = 'block';
        questionCard.style.display = 'none';
        stepperArea.style.display = 'none';

        if (redirectUrl) {
            setTimeout(() => {
                window.location.replace(redirectUrl);
            }, 1500);
        }
    }


    function showQuestion() {
        statusBlock.style.display = 'none';
        questionCard.style.display = 'block';
        stepperArea.style.display = 'block';
    }


    /* =====================================================
       GUARD
       ===================================================== */

    function ensureRequiredState() {
        const profile = readJSON('next_profile');
        const goal = readJSON('next_goal');
        const goalDefinition = readJSON('next_goal_definition');
        const currentState = readJSON('next_current_state');

        if (!profile || profile.journey_started !== true) {
            return {
                ok: false,
                redirectTo: 'welcome.html',
                message: 'ما لقينا بداية رحلتك.'
            };
        }

        if (!isObject(goal) || !goal.value) {
            return {
                ok: false,
                redirectTo: 'goal-selection.html',
                message: 'لم يتم اختيار الهدف بعد.'
            };
        }

        if (!isObject(goalDefinition) || !goalDefinition.goal) {
            return {
                ok: false,
                redirectTo: 'goal-definition.html',
                message: 'لم يتم تحديد تفاصيل الهدف.'
            };
        }

        if (!isObject(currentState) || !currentState.value) {
            return {
                ok: false,
                redirectTo: 'current-state.html',
                message: 'لم يتم تحديد وضعك الحالي.'
            };
        }

        if (!profile.education || !profile.field || !profile.experience) {
            return {
                ok: false,
                redirectTo: 'profile.html',
                message: 'لم يتم إكمال معلوماتك.'
            };
        }

        return {
            ok: true,
            context: {
                profile,
                goal: goal.value,
                goalLabel: goal.label || '',
                goalDefinition,
                currentState: currentState.value
            }
        };
    }


    /* =====================================================
       ASSESSMENT LOAD / SAVE
       ===================================================== */

    function loadAssessment() {
        const raw = readJSON('next_assessment');

        if (!raw) {
            return {
                ok: false,
                redirectTo: 'assessment-introduction.html',
                message: 'لم يبدأ التقييم بعد.'
            };
        }

        if (raw.status === 'completed') {
            return {
                ok: false,
                redirectTo: 'assessment-processing.html',
                message: 'التقييم مكتمل — جارٍ الانتقال.'
            };
        }

        if (raw.status !== 'in_progress') {
            return {
                ok: false,
                redirectTo: 'assessment-introduction.html',
                message: 'حالة التقييم غير صحيحة.'
            };
        }

        // Defaults
        if (typeof raw.budget_max !== 'number' || raw.budget_max < 1) {
            raw.budget_max = 8;
        }

        if (!Array.isArray(raw.asked_question_ids)) {
            raw.asked_question_ids = [];
        }

        if (!isObject(raw.answers)) {
            raw.answers = {};
        }

        raw.updated_at = new Date().toISOString();
        saveJSON('next_assessment', raw);

        return { ok: true, assessment: raw };
    }


    function saveAssessment(assessment) {
        assessment.updated_at = new Date().toISOString();
        saveJSON('next_assessment', assessment);

        const profile = readJSON('next_profile');
        if (profile) {
            profile.updated_at = assessment.updated_at;
            saveJSON('next_profile', profile);
        }
    }


    /* =====================================================
       QUESTION BANK
       ===================================================== */

    const QUESTION_BANK = [
        {
            id: 'goal_clarity',
            type: 'single_choice',
            text: 'ما هو الشيء الأكثر إرباكًا عندك الآن بشأن هدفك؟',
            options: [
                { value: 'direction',    label: 'أنا غير واضح على اتجاهي',           signal: { type: 'unknown',   key: 'goal_direction' } },
                { value: 'requirements', label: 'لا أعرف ما المطلوب فعلًا',            signal: { type: 'unknown',   key: 'requirements' } },
                { value: 'readiness',    label: 'لا أعلم إن كنت جاهزًا',               signal: { type: 'uncertain', key: 'readiness' } },
                { value: 'priority',     label: 'أعرف كثيرًا لكن لا أعلم ما الأهم',    signal: { type: 'known',     key: 'knowledge_priority' } },
                { value: 'confidence',   label: 'لا أملك الثقة لأبدأ',                  signal: { type: 'uncertain', key: 'confidence' } }
            ],
            category: 'goal',
            priority: 95,
            required: true
        },

        {
            id: 'current_understanding',
            type: 'single_choice',
            text: 'كيف تصف فهمك لوضعك الحالي؟',
            options: [
                { value: 'clear',        label: 'واضح جدًا',                          signal: { type: 'known',     key: 'current_clarity' } },
                { value: 'mostly_clear', label: 'واضح في معظم التفاصيل',              signal: { type: 'known',     key: 'current_clarity' } },
                { value: 'mixed',        label: 'أفهم بعض الأشياء وأتردد في بعضها',    signal: { type: 'uncertain', key: 'mixed_understanding' } },
                { value: 'unclear',      label: 'غير واضح نسبيًا',                     signal: { type: 'unknown',   key: 'current_clarity' } }
            ],
            category: 'current_state',
            priority: 88,
            required: true
        },

        {
            id: 'progress_level',
            type: 'single_choice',
            text: 'ما أقرب وصف للتقدم الذي وصلت إليه حاليًا؟',
            options: [
                { value: 'not_started', label: 'لسه ما بدأت',                  signal: { type: 'unknown',      key: 'practical_progress' } },
                { value: 'learning',    label: 'أتعلم وأجهّز نفسي',            signal: { type: 'controllable', key: 'skill_building' } },
                { value: 'building',    label: 'أبني مهارة أو تجربة أو مشروع', signal: { type: 'controllable', key: 'building' } },
                { value: 'applying',    label: 'بدأت أستعمل ما تعلمته',        signal: { type: 'controllable', key: 'application' } },
                { value: 'active',      label: 'أنا متحرك فعلًا نحو الهدف',    signal: { type: 'known',        key: 'active_progress' } }
            ],
            category: 'progress',
            priority: 82,
            required: true
        },

        {
            id: 'main_blocker',
            type: 'single_choice',
            text: 'ما هو أكبر عائق يوقفك الآن؟',
            options: [
                { value: 'knowledge_gap',   label: 'نقص معرفة أو مهارة',                 signal: { type: 'unknown',         key: 'knowledge_gap' } },
                { value: 'experience_gap',  label: 'نقص خبرة أو تطبيق',                  signal: { type: 'unknown',         key: 'experience_gap' } },
                { value: 'clarity_gap',     label: 'أنا لا أملك وضوحًا كافيًا',          signal: { type: 'unknown',         key: 'clarity_gap' } },
                { value: 'opportunity_gap', label: 'أحتاج فرصة أو وصولًا مناسبًا',       signal: { type: 'outside_control', key: 'opportunity_gap' } },
                { value: 'uncertain',       label: 'ما زلت غير متأكد من العائق الحقيقي', signal: { type: 'uncertain',       key: 'barrier_uncertainty' } }
            ],
            category: 'barrier',
            priority: 90,
            required: true
        },

        {
            id: 'control_area',
            type: 'single_choice',
            text: 'في أي جزء لديك أكبر قدرة على التأثير؟',
            options: [
                { value: 'skills',       label: 'تطوير مهاراتي',            signal: { type: 'controllable', key: 'skills' } },
                { value: 'portfolio',    label: 'بناء أعمال أو مشاريع',      signal: { type: 'controllable', key: 'portfolio' } },
                { value: 'applications', label: 'التقديم والمبادرة',         signal: { type: 'controllable', key: 'applications' } },
                { value: 'network',      label: 'التواصل والوصول للفرص',     signal: { type: 'controllable', key: 'network' } },
                { value: 'unsure',       label: 'لا أزال غير متأكد',         signal: { type: 'uncertain',    key: 'control_uncertainty' } }
            ],
            category: 'control',
            priority: 75,
            required: true
        },

        {
            id: 'next_step_need',
            type: 'single_choice',
            text: 'ما الذي تحتاجه الآن أكثر من غيره؟',
            options: [
                { value: 'direction',  label: 'تحديد الاتجاه',           signal: { type: 'controllable', key: 'direction_action' } },
                { value: 'skills',     label: 'تطوير مهارة محددة',       signal: { type: 'controllable', key: 'skill_action' } },
                { value: 'proof',      label: 'إثبات أو عرض عمل',        signal: { type: 'controllable', key: 'proof' } },
                { value: 'goal_check', label: 'تأكيد صحة الهدف نفسه',    signal: { type: 'uncertain',    key: 'goal_check' } },
                { value: 'unknown',    label: 'لا أزال غير متأكد',       signal: { type: 'unknown',      key: 'next_step_uncertainty' } }
            ],
            category: 'next_step',
            priority: 80,
            required: true
        },

        {
            id: 'uncertainty_focus',
            type: 'single_choice',
            text: 'ما هو أول سؤال يهمك أن تجيب عنه الآن؟',
            options: [
                { value: 'position',        label: 'أين أنا الآن؟',                 signal: { type: 'unknown',      key: 'position' } },
                { value: 'missing',         label: 'ما الذي ينقصني؟',               signal: { type: 'unknown',      key: 'missing' } },
                { value: 'next_move',       label: 'ما الذي أفعله الآن؟',           signal: { type: 'controllable', key: 'next_move' } },
                { value: 'direction_check', label: 'هل أنا على الطريق الصحيح؟',     signal: { type: 'uncertain',    key: 'direction_check' } },
                { value: 'not_sure',        label: 'ما زلت غير متأكد',              signal: { type: 'uncertain',    key: 'uncertainty' } }
            ],
            category: 'uncertainty',
            priority: 78,
            required: true
        },

        {
            id: 'supporting_steps',
            type: 'multi_choice',
            text: 'ما هي الخطوات أو الموارد التي ستساعدك أكثر في الوقت الحالي؟',
            options: [
                { value: 'skill_building', label: 'تطوير مهارة محددة',            signal: { type: 'controllable', key: 'skill_building' } },
                { value: 'portfolio',      label: 'بناء مشروع أو عرض عمل',        signal: { type: 'controllable', key: 'portfolio' } },
                { value: 'networking',     label: 'التواصل مع أشخاص مناسبين',     signal: { type: 'controllable', key: 'networking' } },
                { value: 'research',       label: 'مراجعة خيارات أو فرص متاحة',   signal: { type: 'controllable', key: 'research' } },
                { value: 'clarity',        label: 'توضيح الهدف أو الأولويات',     signal: { type: 'controllable', key: 'clarity_action' } }
            ],
            category: 'support',
            priority: 72,
            required: true
        },

        {
            id: 'readiness_scale',
            type: 'scale',
            text: 'ما مدى استعدادك للخطوة التالية نحو هدفك؟',
            options: [
                { value: 1, label: '1', hint: 'غير مستعد',      signal: { type: 'uncertain', key: 'low_readiness' } },
                { value: 2, label: '2', hint: 'متردد',          signal: { type: 'uncertain', key: 'low_readiness' } },
                { value: 3, label: '3', hint: 'متوسط',          signal: { type: 'uncertain', key: 'medium_readiness' } },
                { value: 4, label: '4', hint: 'مستعد جدًا',    signal: { type: 'known',     key: 'high_readiness' } },
                { value: 5, label: '5', hint: 'مستعد تمامًا',  signal: { type: 'known',     key: 'high_readiness' } }
            ],
            category: 'readiness',
            priority: 68,
            required: true,
            min: 1,
            max: 5
        },

        {
            id: 'extra_context',
            type: 'short_text',
            text: 'هل هناك شيء مهم حول هدفك أو وضعك الحالي تريد أن تذكره؟',
            options: [],
            category: 'context',
            priority: 40,
            required: false
        }
    ];


    /* =====================================================
       HELPERS
       ===================================================== */

    const QUESTION_LABELS = {
        single_choice: 'سؤال سريع',
        multi_choice: 'اختيار متعدد',
        scale: 'مقياس',
        short_text: 'إجابة قصيرة'
    };

    function getQuestionById(id) {
        return QUESTION_BANK.find(q => q.id === id) || null;
    }

    function getOptionByValue(question, value) {
        if (!question || !question.options) return null;
        return question.options.find(o => String(o.value) === String(value)) || null;
    }

    function appendUnique(list, value) {
        if (value && !list.includes(value)) {
            list.push(value);
        }
    }

    function canAnswerQuestion(question, answer) {
        if (!question) return false;

        if (question.type === 'single_choice') {
            return typeof answer !== 'undefined' && answer !== null && answer !== '';
        }

        if (question.type === 'multi_choice') {
            return Array.isArray(answer) && answer.length > 0;
        }

        if (question.type === 'scale') {
            const value = Number(answer);
            return Number.isFinite(value) &&
                value >= (question.min || 1) &&
                value <= (question.max || 5);
        }

        if (question.type === 'short_text') {
            if (question.required === false) return true;
            return typeof answer === 'string' && answer.trim().length > 0;
        }

        return false;
    }


    /* =====================================================
       SIGNAL ENGINE
       ===================================================== */

    function resetSignals(assessment) {
        assessment.known = [];
        assessment.unknown = [];
        assessment.uncertain = [];
        assessment.controllable = [];
    }

    function addSignal(assessment, signal, question) {
        if (!signal || !signal.type || !signal.key) return;

        const entry = `${question.category}:${signal.key}`;

        if (signal.type === 'known') appendUnique(assessment.known, entry);
        else if (signal.type === 'unknown') appendUnique(assessment.unknown, entry);
        else if (signal.type === 'uncertain') appendUnique(assessment.uncertain, entry);
        else if (signal.type === 'controllable') appendUnique(assessment.controllable, entry);
    }

    function applySignalForAnswer(assessment, question, answerValue) {
        if (!question) return;

        const values = Array.isArray(answerValue) ? answerValue : [answerValue];

        values.forEach(value => {
            const option = getOptionByValue(question, value);
            if (option && option.signal) {
                addSignal(assessment, option.signal, question);
            }
        });

        if (
            question.type === 'short_text' &&
            typeof answerValue === 'string' &&
            answerValue.trim()
        ) {
            appendUnique(assessment.uncertain, `${question.category}:user_context`);
        }
    }

    function recomputeSignals(assessment) {
        resetSignals(assessment);

        Object.entries(assessment.answers).forEach(([questionId, answerValue]) => {
            const question = getQuestionById(questionId);
            if (!question) return;
            applySignalForAnswer(assessment, question, answerValue);
        });
    }


    /* =====================================================
       ADAPTIVE ENGINE
       ===================================================== */

    function scoreCandidate(question, context, assessment) {
        let score = Number(question.priority) || 1;

        if (
            context.currentState === 'unclear' &&
            question.category === 'current_state'
        ) {
            score += 18;
        }

        if (
            assessment.unknown.length &&
            ['goal', 'current_state', 'barrier', 'uncertainty', 'next_step', 'readiness'].includes(question.category)
        ) {
            score += 8;
        }

        if (
            assessment.controllable.length &&
            ['control', 'support', 'next_step'].includes(question.category)
        ) {
            score += 8;
        }

        if (question.id === 'extra_context') {
            score -= 15;
        }

        return score;
    }

    function selectNextQuestion(assessment, context) {
        const candidates = QUESTION_BANK
            .filter(q => !assessment.asked_question_ids.includes(q.id))
            .sort((a, b) =>
                scoreCandidate(b, context, assessment) -
                scoreCandidate(a, context, assessment)
            );

        return candidates[0] || null;
    }

    function shouldCompleteEarly(assessment) {
        if (assessment.asked_question_ids.length < 3) return false;

        const hasUnderstanding =
            assessment.known.length >= 2 &&
            assessment.controllable.length >= 1;

        const hasCoreSignals =
            assessment.unknown.length >= 1 ||
            assessment.uncertain.length >= 1;

        return hasUnderstanding && hasCoreSignals;
    }


    /* =====================================================
       STEPPER UI
       ===================================================== */

    function updateStepper(assessment) {
        const total = assessment.budget_max;
        const used = assessment.asked_question_ids.length;

        let currentStep;
        const currentIsAnswered = assessment.asked_question_ids.includes(
            assessment.current_question_id
        );

        if (currentIsAnswered) {
            currentStep =
                assessment.asked_question_ids.indexOf(assessment.current_question_id) + 1;
        } else {
            currentStep = Math.min(used + 1, total);
        }

        currentStep = Math.max(1, Math.min(currentStep, total));

        const stepperCount = document.getElementById('stepperCount');
        if (stepperCount) {
            stepperCount.textContent = `${currentStep} / ${total}`;
        }

        document.querySelectorAll('.step-dot').forEach(dot => {
            const step = Number(dot.dataset.step);

            dot.classList.remove('completed', 'current', 'upcoming');

            if (step < currentStep) dot.classList.add('completed');
            else if (step === currentStep) dot.classList.add('current');
            else dot.classList.add('upcoming');
        });

        const progressPercent = ((currentStep - 1) / (total - 1)) * 100;

        const progressEl = document.getElementById('stepperProgress');
        if (progressEl) {
            progressEl.style.width = `${progressPercent}%`;
        }

        const stepper = document.getElementById('stepper');
        if (stepper) {
            stepper.setAttribute('aria-valuenow', String(currentStep));
        }
    }


    /* =====================================================
       DOM
       ===================================================== */

    const questionType = document.getElementById('questionType');
    const questionTitle = document.getElementById('questionTitle');
    const questionDescription = document.getElementById('questionDescription');
    const answerContainer = document.getElementById('answerContainer');
    const nextButton = document.getElementById('nextButton');
    const backButton = document.getElementById('backButton');


    /* =====================================================
       FINALIZE
       ===================================================== */

    function finalizeAssessment(assessment, reason) {
        assessment.status = 'completed';
        assessment.completed_at = new Date().toISOString();
        assessment.updated_at = new Date().toISOString();
        assessment.early_completion_reason = reason;
        assessment.current_question_id = null;

        document.querySelectorAll('.step-dot').forEach(dot => {
            dot.classList.remove('current', 'upcoming');
            dot.classList.add('completed');
        });

        const progressEl = document.getElementById('stepperProgress');
        if (progressEl) progressEl.style.width = '100%';

        const stepperCount = document.getElementById('stepperCount');
        if (stepperCount) {
            stepperCount.textContent = `${assessment.budget_max} / ${assessment.budget_max}`;
        }

        saveAssessment(assessment);

        showError(
            'اكتمل التقييم',
            'جارٍ تحضير التحليل...',
            'assessment-processing.html'
        );
    }


    /* =====================================================
       MAIN FLOW
       ===================================================== */

    (function init() {
        showLoading('جارٍ التحضير...', 'نتحقق من بياناتك.');

        const guard = ensureRequiredState();

        if (!guard.ok) {
            showError('لحظة', guard.message, guard.redirectTo);
            return;
        }

        const context = guard.context;
        const loaded = loadAssessment();

        if (!loaded.ok) {
            showError('لحظة', loaded.message, loaded.redirectTo);
            return;
        }

        const assessment = loaded.assessment;
        recomputeSignals(assessment);

        if (assessment.asked_question_ids.length >= assessment.budget_max) {
            finalizeAssessment(assessment, 'maximum_questions_reached');
            return;
        }

        const currentId = assessment.current_question_id;
        const currentQuestion = currentId ? getQuestionById(currentId) : null;
        const currentAlreadyAsked = currentId && assessment.asked_question_ids.includes(currentId);

        if (!currentQuestion || currentAlreadyAsked) {
            const nextQuestion = selectNextQuestion(assessment, context);

            if (!nextQuestion) {
                finalizeAssessment(assessment, 'maximum_questions_reached');
                return;
            }

            assessment.current_question_id = nextQuestion.id;
            saveAssessment(assessment);
        }

        if (shouldCompleteEarly(assessment)) {
            finalizeAssessment(assessment, 'sufficient_understanding');
            return;
        }

        showQuestion();
        renderQuestion();


        /* =====================================================
           RENDER QUESTION
           ===================================================== */

        function renderQuestion() {
            const question = getQuestionById(assessment.current_question_id);

            if (!question) {
                const nextQuestion = selectNextQuestion(assessment, context);

                if (!nextQuestion) {
                    finalizeAssessment(assessment, 'maximum_questions_reached');
                    return;
                }

                assessment.current_question_id = nextQuestion.id;
                saveAssessment(assessment);
                renderQuestion();
                return;
            }

            // Reset animation
            questionCard.classList.remove('question-transition');
            answerContainer.innerHTML = '';
            void questionCard.offsetWidth;
            questionCard.classList.add('question-transition');

            updateStepper(assessment);

            questionType.textContent = QUESTION_LABELS[question.type] || 'سؤال سريع';
            questionTitle.textContent = question.text;
            questionDescription.textContent =
                question.required === false ? 'هذا السؤال اختياري.' : '';

            nextButton.disabled = true;

            const savedAnswer = assessment.answers[question.id];

            /* SINGLE */
            if (question.type === 'single_choice') {
                answerContainer.className = 'options';

                (question.options || []).forEach((option, index) => {
                    const button = document.createElement('button');
                    button.type = 'button';
                    button.style.setProperty('--i', index);
                    button.className = 'option' +
                        (savedAnswer === option.value ? ' selected' : '');

                    button.innerHTML = `
                        <span class="option-marker"></span>
                        <span class="option-text">${option.label}</span>
                    `;

                    if (savedAnswer === option.value) nextButton.disabled = false;

                    button.addEventListener('click', () => {
                        document.querySelectorAll('.option').forEach(item =>
                            item.classList.remove('selected')
                        );
                        button.classList.add('selected');

                        assessment.answers[question.id] = option.value;
                        recomputeSignals(assessment);
                        saveAssessment(assessment);

                        nextButton.disabled = false;
                    });

                    answerContainer.appendChild(button);
                });
            }

            /* MULTI */
            if (question.type === 'multi_choice') {
                answerContainer.className = 'options';

                const currentValues = Array.isArray(savedAnswer) ? savedAnswer : [];

                (question.options || []).forEach((option, index) => {
                    const button = document.createElement('button');
                    const isSelected = currentValues.includes(option.value);

                    button.type = 'button';
                    button.style.setProperty('--i', index);
                    button.className = 'option checkbox' + (isSelected ? ' selected' : '');

                    button.innerHTML = `
                        <span class="option-marker"></span>
                        <span class="option-text">${option.label}</span>
                    `;

                    if (isSelected) nextButton.disabled = false;

                    button.addEventListener('click', () => {
                        const current = Array.isArray(assessment.answers[question.id])
                            ? assessment.answers[question.id]
                            : [];
                        const exists = current.includes(option.value);
                        const nextValues = exists
                            ? current.filter(v => v !== option.value)
                            : [...current, option.value];

                        assessment.answers[question.id] = nextValues;
                        recomputeSignals(assessment);
                        saveAssessment(assessment);

                        button.classList.toggle('selected', !exists);
                        nextButton.disabled = nextValues.length === 0;
                    });

                    answerContainer.appendChild(button);
                });
            }

            /* SCALE */
            if (question.type === 'scale') {
                answerContainer.className = 'options scale-type';

                (question.options || []).forEach((option, index) => {
                    const button = document.createElement('button');
                    button.type = 'button';
                    button.style.setProperty('--i', index);
                    button.className = 'option' +
                        (Number(savedAnswer) === Number(option.value) ? ' selected' : '');

                    button.innerHTML = `
                        <span class="option-text">${option.label}</span>
                        ${option.hint ? `<span class="scale-hint">${option.hint}</span>` : ''}
                    `;

                    if (Number(savedAnswer) === Number(option.value)) nextButton.disabled = false;

                    button.addEventListener('click', () => {
                        document.querySelectorAll('.option').forEach(item =>
                            item.classList.remove('selected')
                        );
                        button.classList.add('selected');

                        assessment.answers[question.id] = Number(option.value);
                        recomputeSignals(assessment);
                        saveAssessment(assessment);

                        nextButton.disabled = false;
                    });

                    answerContainer.appendChild(button);
                });
            }

            /* SHORT TEXT */
            if (question.type === 'short_text') {
                answerContainer.className = 'options text-type';

                const textarea = document.createElement('textarea');
                textarea.className = 'text-answer';
                textarea.placeholder = 'اكتب ما تريد إضافته هنا...';
                textarea.maxLength = 500;
                textarea.value = typeof savedAnswer === 'string' ? savedAnswer : '';

                textarea.addEventListener('input', () => {
                    const cleanValue = textarea.value.trim();
                    assessment.answers[question.id] = cleanValue;
                    recomputeSignals(assessment);
                    saveAssessment(assessment);

                    nextButton.disabled =
                        question.required !== false && cleanValue.length === 0;
                });

                nextButton.disabled = false;
                answerContainer.appendChild(textarea);

                setTimeout(() => textarea.focus(), 300);
            }
        }


        /* =====================================================
           NEXT
           ===================================================== */

        function handleNext() {
            const question = getQuestionById(assessment.current_question_id);
            if (!question) return;

            let answer = assessment.answers[question.id];

            if (
                question.type === 'short_text' &&
                question.required === false &&
                typeof answer !== 'string'
            ) {
                answer = '';
                assessment.answers[question.id] = '';
            }

            if (!canAnswerQuestion(question, answer)) return;

            if (!assessment.asked_question_ids.includes(question.id)) {
                assessment.asked_question_ids.push(question.id);
            }

            assessment.budget_used = assessment.asked_question_ids.length;

            recomputeSignals(assessment);
            saveAssessment(assessment);

            if (assessment.asked_question_ids.length >= assessment.budget_max) {
                finalizeAssessment(assessment, 'maximum_questions_reached');
                return;
            }

            if (shouldCompleteEarly(assessment)) {
                finalizeAssessment(assessment, 'sufficient_understanding');
                return;
            }

            const nextQuestion = selectNextQuestion(assessment, context);

            if (!nextQuestion) {
                finalizeAssessment(assessment, 'maximum_questions_reached');
                return;
            }

            assessment.current_question_id = nextQuestion.id;
            saveAssessment(assessment);

            renderQuestion();
        }


        /* =====================================================
           BACK
           ===================================================== */

        function handleBack() {
            if (assessment.asked_question_ids.length > 0) {
                const previousQuestionId =
                    assessment.asked_question_ids[assessment.asked_question_ids.length - 1];

                const previousQuestion = getQuestionById(previousQuestionId);

                if (previousQuestion) {
                    assessment.current_question_id = previousQuestionId;
                    saveAssessment(assessment);
                    renderQuestion();
                    return;
                }
            }

            window.location.href = 'assessment-introduction.html';
        }


        nextButton.addEventListener('click', handleNext);
        backButton.addEventListener('click', handleBack);
    })();

})();