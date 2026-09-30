/* =====================================================
   NEXT — GOAL DEFINITION PAGE JS
   goal-definition.html
   ====================================================== */

(function initGoalDefinition() {

    /* =====================================================
       STATE       ===================================================== */

    let selectedGoal = readJSON('next_goal')?.value || null;


    /* =====================================================
       DOM
       ===================================================== */

    const definitionContent = document.getElementById('definitionContent');
    const invalidState = document.getElementById('invalidState');
    const dynamicFields = document.getElementById('dynamicFields');
    const pageTitle = document.getElementById('pageTitle');
    const pageDescription = document.getElementById('pageDescription');
    const goalContextText = document.getElementById('goalContextText');
    const goalContextIcon = document.getElementById('goalContextIcon');
    const goalForm = document.getElementById('goalForm');
    const backButton = document.getElementById('backButton');
    const continueButton = document.getElementById('continueButton');


    /* =====================================================
       ICONS
       ===================================================== */

    const GOAL_ICONS = {
        academic: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 10 12 5l10 5-10 5L2 10Z"></path><path d="M6 12v5c2.5 2 9.5 2 12 0v-5"></path></svg>`,

        employment: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"></rect><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`,

        career_growth: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 20h18"></path><path d="M5 17l5-5 3 3 6-7"></path></svg>`,

        career_change: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19h16"></path><path d="M6 17V7"></path><path d="M18 17V4"></path></svg>`,

        skills: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18"></path><path d="M5 8h14"></path></svg>`,

        other: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><path d="M12 8v4"></path><path d="M12 16h.01"></path></svg>`
    };


    /* =====================================================
       GOAL CONFIGURATIONS
       ===================================================== */

    const goalConfigs = {
        academic: {
            context: 'الدراسة والماجستير',
            title: 'خلينا نحدد هدفك الأكاديمي.',
            description: 'حدد الشيء الذي تفكر فيه الآن، حتى نفهم وضعك بناءً عليه.',
            fields: [
                {
                    type: 'text',
                    id: 'target_field',
                    name: 'target_field',
                    label: 'المجال أو التخصص الذي تفكر فيه',
                    placeholder: 'مثال: علوم الحاسوب، الذكاء الاصطناعي',
                    required: true
                },
                {
                    type: 'text',
                    id: 'target_program',
                    name: 'target_program',
                    label: 'برنامج أو درجة علمية محددة؟',
                    placeholder: 'مثال: ماجستير علوم حاسوب',
                    hint: 'يمكنك تركها فارغة إذا لم تحددها بعد.',
                    required: false
                },
                {
                    type: 'text',
                    id: 'target_university',
                    name: 'target_university',
                    label: 'جامعة أو جهة تعليمية في بالك؟',
                    placeholder: 'اكتب اسم الجامعة إن وجد',
                    hint: 'إذا لم تحدد بعد، اتركها فارغة.',
                    required: false
                },
                {
                    type: 'choice',
                    id: 'target_timeline',
                    name: 'target_timeline',
                    label: 'متى تفكر في البدء؟',
                    required: true,
                    options: [
                        { value: '3_months', label: 'خلال 3 أشهر' },
                        { value: '6_months', label: 'خلال 6 أشهر' },
                        { value: '1_year', label: 'خلال سنة' },
                        { value: 'not_sure', label: 'لسه مش محدد' }
                    ]
                }
            ]
        },

        employment: {
            context: 'الحصول على وظيفة',
            title: 'خلينا نحدد الوظيفة اللي تستهدفها.',
            description: 'مش مطلوب منك تعرف كل شيء عنها الآن. نحتاج صورة أولية فقط.',
            fields: [
                {
                    type: 'text',
                    id: 'target_role',
                    name: 'target_role',
                    label: 'الوظيفة أو الدور الذي تستهدفه',
                    placeholder: 'مثال: Full-Stack Developer',
                    required: true
                },
                {
                    type: 'text',
                    id: 'target_organization',
                    name: 'target_organization',
                    label: 'جهة أو نوع شركة في بالك؟',
                    placeholder: 'مثال: شركة تقنية، شركة ناشئة',
                    hint: 'إذا ما عندك جهة محددة، اتركها فارغة.',
                    required: false
                },
                {
                    type: 'choice',
                    id: 'target_timeline',
                    name: 'target_timeline',
                    label: 'متى تريد أن تبدأ البحث الجدي؟',
                    required: true,
                    options: [
                        { value: 'now', label: 'الآن' },
                        { value: '3_months', label: 'خلال 3 أشهر' },
                        { value: '6_months', label: 'خلال 6 أشهر' },
                        { value: 'not_sure', label: 'لسه مش محدد' }
                    ]
                }
            ]
        },

        career_growth: {
            context: 'تطوير المسار المهني',
            title: 'خلينا نحدد الاتجاه اللي بدك تتطور فيه.',
            description: 'حدد التغيير الذي تتمنى تشوفه في مسارك.',
            fields: [
                {
                    type: 'text',
                    id: 'target_direction',
                    name: 'target_direction',
                    label: 'إلى أي اتجاه تريد أن تتطور؟',
                    placeholder: 'مثال: الانتقال إلى Full-Stack',
                    required: true
                },
                {
                    type: 'choice',
                    id: 'current_focus',
                    name: 'current_focus',
                    label: 'ما الشيء الذي تريد أن يتغير أكثر؟',
                    required: true,
                    options: [
                        { value: 'role', label: 'الدور أو المسمى' },
                        { value: 'skills', label: 'المهارات والخبرة' },
                        { value: 'responsibility', label: 'المسؤوليات' },
                        { value: 'income', label: 'الدخل' },
                        { value: 'clarity', label: 'وضوح المسار' },
                        { value: 'not_sure', label: 'مش متأكد بعد' }
                    ]
                },
                {
                    type: 'choice',
                    id: 'target_timeline',
                    name: 'target_timeline',
                    label: 'متى تريد أن تشعر بهذا التغيير؟',
                    required: true,
                    options: [
                        { value: '3_months', label: 'خلال 3 أشهر' },
                        { value: '6_months', label: 'خلال 6 أشهر' },
                        { value: '1_year', label: 'خلال سنة' },
                        { value: 'not_sure', label: 'لسه مش محدد' }
                    ]
                }
            ]
        },

        career_change: {
            context: 'تغيير المجال',
            title: 'خلينا نحدد الانتقال اللي تفكر فيه.',
            description: 'نحتاج نعرف من أين تبدأ وإلى أين تريد الوصول.',
            fields: [
                {
                    type: 'text',
                    id: 'current_field',
                    name: 'current_field',
                    label: 'ما المجال الذي أنت فيه الآن؟',
                    placeholder: 'مثال: تصميم، برمجة، تسويق',
                    required: true
                },
                {
                    type: 'text',
                    id: 'target_field',
                    name: 'target_field',
                    label: 'إلى أي مجال تريد الانتقال؟',
                    placeholder: 'مثال: تطوير البرمجيات',
                    required: true
                },
                {
                    type: 'choice',
                    id: 'target_timeline',
                    name: 'target_timeline',
                    label: 'متى تفكر في هذا الانتقال؟',
                    required: true,
                    options: [
                        { value: '3_months', label: 'خلال 3 أشهر' },
                        { value: '6_months', label: 'خلال 6 أشهر' },
                        { value: '1_year', label: 'خلال سنة' },
                        { value: 'not_sure', label: 'لسه مش محدد' }
                    ]
                }
            ]
        },

        skills: {
            context: 'تطوير المهارات',
            title: 'خلينا نحدد المهارة اللي بدك تطورها.',
            description: 'بدل قائمة طويلة، حدد الشيء الذي تريد أن يصبح أوضح وأقوى.',
            fields: [
                {
                    type: 'text',
                    id: 'target_skill',
                    name: 'target_skill',
                    label: 'ما المهارة التي تريد تطويرها؟',
                    placeholder: 'مثال: JavaScript، Laravel، الإنجليزية',
                    required: true
                },
                {
                    type: 'text',
                    id: 'skill_use',
                    name: 'skill_use',
                    label: 'لماذا تريد تطويرها؟',
                    placeholder: 'مثال: للحصول على وظيفة أو بناء مشاريع',
                    required: true
                },
                {
                    type: 'choice',
                    id: 'target_timeline',
                    name: 'target_timeline',
                    label: 'متى تريد أن تصل إلى مستوى أفضل؟',
                    required: true,
                    options: [
                        { value: '3_months', label: 'خلال 3 أشهر' },
                        { value: '6_months', label: 'خلال 6 أشهر' },
                        { value: '1_year', label: 'خلال سنة' },
                        { value: 'not_sure', label: 'لسه مش محدد' }
                    ]
                }
            ]
        },

        other: {
            context: 'هدف مختلف',
            title: 'خلينا نفهم هدفك أكثر.',
            description: 'اكتب لنا الهدف بالطريقة التي تفكر فيه فيها الآن.',
            fields: [
                {
                    type: 'textarea',
                    id: 'goal_text',
                    name: 'goal_text',
                    label: 'شو الهدف اللي بدك تفهم وضعك عشانه؟',
                    placeholder: 'اكتب هدفك كما هو في بالك الآن...',
                    required: true
                },
                {
                    type: 'choice',
                    id: 'target_timeline',
                    name: 'target_timeline',
                    label: 'متى تريد أن تبدأ بالتحرك تجاهه؟',
                    required: true,
                    options: [
                        { value: 'now', label: 'الآن' },
                        { value: '3_months', label: 'خلال 3 أشهر' },
                        { value: '6_months', label: 'خلال 6 أشهر' },
                        { value: 'not_sure', label: 'لسه مش محدد' }
                    ]
                }
            ]
        }
    };


    /* =====================================================
       VALIDATION — INVALID GOAL
       ===================================================== */

    if (!selectedGoal || !goalConfigs[selectedGoal]) {
        definitionContent.style.display = 'none';
        invalidState.style.display = 'block';
        return;
    }

    definitionContent.style.display = 'block';


    /* =====================================================
       RENDER
       ===================================================== */

    renderGoal(goalConfigs[selectedGoal]);


    function renderGoal(config) {
        pageTitle.textContent = config.title;
        pageDescription.textContent = config.description;
        goalContextText.textContent = config.context;

        if (goalContextIcon && GOAL_ICONS[selectedGoal]) {
            goalContextIcon.innerHTML = GOAL_ICONS[selectedGoal];
        }

        // بناء الحقول
        dynamicFields.innerHTML = config.fields
            .map((field, index) => renderField(field, index))
            .join('');

        restoreSavedValues();
        initializeChoiceFields();
        initializeInputValidation();
    }


    /* =====================================================
       RENDER FIELD
       ===================================================== */

    function renderField(field, index) {
        const isRequired = field.required !== false;

        const labelRow = `
            <div class="field-label-row">
                <label class="field-label" for="${field.id}">
                    ${field.label}
                    ${isRequired ? '<span class="field-label-required">*</span>' : ''}
                </label>
                ${!isRequired ? '<span class="field-label-optional">اختياري</span>' : ''}
            </div>
        `;

        const hint = field.hint
            ? `<span class="field-hint">${field.hint}</span>`
            : '';

        let controlHTML = '';

        if (field.type === 'text') {
            controlHTML = `
                <input
                    id="${field.id}"
                    name="${field.name}"
                    type="text"
                    class="field-input"
                    placeholder="${field.placeholder || ''}"
                    autocomplete="off"
                >
            `;
        } else if (field.type === 'textarea') {
            controlHTML = `
                <textarea
                    id="${field.id}"
                    name="${field.name}"
                    class="field-textarea"
                    placeholder="${field.placeholder || ''}"
                ></textarea>
            `;
        } else if (field.type === 'choice') {
            controlHTML = `
                <div class="choice-group" data-choice-group="${field.name}">
                    ${field.options.map(option => `
                        <label class="choice-option">
                            <input
                                type="radio"
                                name="${field.name}"
                                value="${option.value}"
                            >
                            <span class="choice-radio" aria-hidden="true"></span>
                            <span class="choice-text">${option.label}</span>
                        </label>
                    `).join('')}
                </div>
            `;
        }

        return `
            <div class="field" data-field="${field.id}" style="--field-index: ${index}">
                ${labelRow}
                ${controlHTML}
                ${hint}
                <span class="field-error">هذا الحقل مطلوب.</span>
            </div>
        `;
    }


    /* =====================================================
       RESTORE SAVED VALUES
       ===================================================== */

    function restoreSavedValues() {
        const saved = readJSON('next_goal_definition');
        if (!saved) return;

        Object.entries(saved).forEach(([key, value]) => {
            if (key === 'updated_at' || key === 'goal') return;

            const input = document.querySelector(`[name="${key}"]`);
            if (!input) return;

            if (input.type === 'radio') {
                const radio = document.querySelector(
                    `input[name="${key}"][value="${value}"]`
                );
                if (radio) {
                    radio.checked = true;
                    radio.closest('.choice-option').classList.add('selected');
                }
            } else {
                input.value = value;
            }
        });
    }


    /* =====================================================
       CHOICE FIELDS
       ===================================================== */

    function initializeChoiceFields() {
        document.querySelectorAll('.choice-option').forEach(choice => {
            const input = choice.querySelector('input');

            input.addEventListener('change', () => {
                const groupName = input.name;

                document
                    .querySelectorAll(`input[name="${groupName}"]`)
                    .forEach(item => {
                        item.closest('.choice-option')
                            .classList.remove('selected');
                    });

                choice.classList.add('selected');

                const field = choice.closest('.field');
                if (field) field.classList.remove('has-error');
            });
        });
    }


    /* =====================================================
       INPUT VALIDATION (live)
       ===================================================== */

    function initializeInputValidation() {
        document
            .querySelectorAll('.field-input, .field-textarea')
            .forEach(input => {
                input.addEventListener('input', () => {
                    if (input.value.trim()) {
                        const field = input.closest('.field');
                        if (field) field.classList.remove('has-error');
                    }
                });
            });
    }


    /* =====================================================
       VALIDATE FORM
       ===================================================== */

    function validateForm() {
        let isValid = true;

        document
            .querySelectorAll('.field')
            .forEach(field => field.classList.remove('has-error'));

        const config = goalConfigs[selectedGoal];

        config.fields.forEach(fieldConfig => {
            if (!fieldConfig.required) return;

            const field = document.querySelector(
                `[data-field="${fieldConfig.id}"]`
            );

            if (!field) return;

            if (fieldConfig.type === 'choice') {
                const checked = document.querySelector(
                    `input[name="${fieldConfig.name}"]:checked`
                );

                if (!checked) {
                    field.classList.add('has-error');
                    isValid = false;
                }
            } else {
                const input = document.getElementById(fieldConfig.id);

                if (!input || !input.value.trim()) {
                    field.classList.add('has-error');
                    isValid = false;
                }
            }
        });

        return isValid;
    }


    /* =====================================================
       COLLECT FORM DATA
       ===================================================== */

    function collectFormData() {
        const formData = new FormData(goalForm);
        const data = {
            goal: selectedGoal,
            updated_at: new Date().toISOString()
        };

        formData.forEach((value, key) => {
            data[key] = typeof value === 'string' ? value.trim() : value;
        });

        return data;
    }


    /* =====================================================
       INVALIDATE DERIVED
       ===================================================== */

    function invalidateDerived() {
        const derivedKeys = [
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
       SAVE
       ===================================================== */

    function saveDefinition(data) {
        const previous = readJSON('next_goal_definition');
        const hasChanged = !previous ||
            JSON.stringify(previous) !== JSON.stringify(data);

        saveJSON('next_goal_definition', data);

        if (hasChanged) invalidateDerived();

        const profile = readJSON('next_profile');
        if (profile) {
            profile.updated_at = data.updated_at;
            saveJSON('next_profile', profile);
        }
    }


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

        // focus على أول input
        const input = firstError.querySelector(
            '.field-input, .field-textarea, input[type="radio"]'
        );
        if (input) {
            setTimeout(() => input.focus(), prefersReduced ? 0 : 400);
        }
    }


    /* =====================================================
       SUBMIT
       ===================================================== */

    goalForm.addEventListener('submit', event => {
        event.preventDefault();

        if (!validateForm()) {
            scrollToError();
            return;
        }

        const data = collectFormData();
        saveDefinition(data);

        continueButton.disabled = true;
        continueButton.innerHTML = `
            <span class="button-spinner" aria-hidden="true"></span>
            <span>جارٍ المتابعة...</span>
        `;

        setTimeout(() => {
            window.location.href = 'current-state.html';
        }, 400);
    });


    /* =====================================================
       BACK
       ===================================================== */

    backButton.addEventListener('click', () => {
        window.location.href = 'goal-selection.html';
    });

})();