/* =====================================================
   NEXT — GOAL DETAILS PAGE JS
   ===================================================== */

(function initGoalDetails() {

    ensureSession();

    const goalView = document.getElementById('goalView');
    const emptyState = document.getElementById('emptyState');
    const editPanel = document.getElementById('editPanel');
    const goalTitle = document.getElementById('goalTitle');
    const goalDescription = document.getElementById('goalDescription');
    const detailsGrid = document.getElementById('detailsGrid');
    const dynamicFields = document.getElementById('dynamicFields');
    const goalForm = document.getElementById('goalForm');
    const toast = document.getElementById('toast');

    /* =====================================================
       GOAL CONFIGURATION
       ===================================================== */

    const GOALS = {
        academic: {
            title: 'الدراسة والماجستير',
            description: 'تريد فهم موقعك الحالي والاستعداد للخطوة الأكاديمية القادمة.',
            fields: [
                { key: 'target_field', label: 'المجال أو التخصص المستهدف', type: 'text', required: true, placeholder: 'مثال: علوم الحاسوب' },
                { key: 'target_program', label: 'البرنامج أو الدرجة', type: 'text', required: false, placeholder: 'مثال: ماجستير تطوير البرمجيات' },
                { key: 'target_university', label: 'الجامعة أو المؤسسة', type: 'text', required: false, placeholder: 'يمكنك تركه فارغًا' },
                { key: 'target_timeline', label: 'الإطار الزمني', type: 'select', required: true,
                  options: [['soon', 'خلال الأشهر القادمة'], ['this_year', 'خلال هذه السنة'], ['one_two_years', 'خلال سنة إلى سنتين'], ['not_sure', 'لست متأكدًا بعد']] }
            ]
        },
        employment: {
            title: 'الحصول على وظيفة',
            description: 'تريد فهم مدى جاهزيتك للخطوة المهنية القادمة.',
            fields: [
                { key: 'target_role', label: 'المسمى أو الدور الذي تستهدفه', type: 'text', required: true, placeholder: 'مثال: Full-Stack Developer' },
                { key: 'target_organization', label: 'شركة أو جهة مستهدفة', type: 'text', required: false, placeholder: 'اختياري' },
                { key: 'target_timeline', label: 'الإطار الزمني', type: 'select', required: true,
                  options: [['soon', 'خلال الأشهر القادمة'], ['this_year', 'خلال هذه السنة'], ['one_two_years', 'خلال سنة إلى سنتين'], ['not_sure', 'لست متأكدًا بعد']] }
            ]
        },
        career_growth: {
            title: 'تطوير مساري المهني',
            description: 'تريد فهم المرحلة التي وصلت إليها.',
            fields: [
                { key: 'target_direction', label: 'الاتجاه الذي تريد تطويره', type: 'text', required: true, placeholder: 'مثال: Full-Stack Development' },
                { key: 'current_focus', label: 'الجانب الأهم لك الآن؟', type: 'select', required: true,
                  options: [['role', 'الدور الوظيفي'], ['skills', 'المهارات'], ['responsibility', 'المسؤوليات'], ['income', 'الدخل'], ['clarity', 'وضوح المسار'], ['not_sure', 'لست متأكدًا']] },
                { key: 'target_timeline', label: 'الإطار الزمني', type: 'select', required: true,
                  options: [['soon', 'خلال الأشهر القادمة'], ['this_year', 'خلال هذه السنة'], ['one_two_years', 'خلال سنة إلى سنتين'], ['not_sure', 'لست متأكدًا بعد']] }
            ]
        },
        career_change: {
            title: 'تغيير مجالي',
            description: 'تريد فهم الفجوة بين وضعك الحالي والمجال المستهدف.',
            fields: [
                { key: 'current_field', label: 'مجالك الحالي', type: 'text', required: true, placeholder: 'مثال: تصميم الجرافيك' },
                { key: 'target_field', label: 'المجال المستهدف', type: 'text', required: true, placeholder: 'مثال: تطوير الويب' },
                { key: 'target_timeline', label: 'الإطار الزمني', type: 'select', required: true,
                  options: [['soon', 'خلال الأشهر القادمة'], ['this_year', 'خلال هذه السنة'], ['one_two_years', 'خلال سنة إلى سنتين'], ['not_sure', 'لست متأكدًا بعد']] }
            ]
        },
        skills: {
            title: 'تطوير مهاراتي',
            description: 'تريد تحديد المهارة التي تستحق وقتك الآن.',
            fields: [
                { key: 'target_skill', label: 'المهارة التي تريد تطويرها', type: 'text', required: true, placeholder: 'مثال: Laravel' },
                { key: 'skill_use', label: 'في ماذا ستستخدمها؟', type: 'text', required: true, placeholder: 'مثال: بناء تطبيقات ويب' },
                { key: 'target_timeline', label: 'الإطار الزمني', type: 'select', required: true,
                  options: [['soon', 'خلال الأشهر القادمة'], ['this_year', 'خلال هذه السنة'], ['one_two_years', 'خلال سنة إلى سنتين'], ['not_sure', 'لست متأكدًا بعد']] }
            ]
        },
        other: {
            title: 'هدف مختلف',
            description: 'هدفك لا يندرج ضمن الخيارات السابقة، وهذا طبيعي.',
            fields: [
                { key: 'goal_text', label: 'احكي لنا عن هدفك', type: 'textarea', required: true, placeholder: 'اكتب باختصار...' },
                { key: 'target_timeline', label: 'الإطار الزمني', type: 'select', required: true,
                  options: [['soon', 'خلال الأشهر القادمة'], ['this_year', 'خلال هذه السنة'], ['one_two_years', 'خلال سنة إلى سنتين'], ['not_sure', 'لست متأكدًا بعد']] }
            ]
        }
    };

    const VALUE_LABELS = {
        soon: 'خلال الأشهر القادمة',
        this_year: 'خلال هذه السنة',
        one_two_years: 'خلال سنة إلى سنتين',
        not_sure: 'لست متأكدًا بعد',
        role: 'الدور الوظيفي',
        skills: 'المهارات',
        responsibility: 'المسؤوليات',
        income: 'الدخل',
        clarity: 'وضوح المسار'
    };

    /* =====================================================
       TOAST
       ===================================================== */

    let toastTimer;

    function showToast(message) {
        if (!toast) return;
        clearTimeout(toastTimer);
        toast.textContent = message;
        toast.classList.add('show');
        toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
    }

    /* =====================================================
       READ GOAL
       ===================================================== */

    function readGoal() {
        const goal = readJSON('next_goal');
        if (!isObject(goal) || !goal.value) return null;

        const definition = readJSON('next_goal_definition') || {};

        return {
            type: goal.value,
            label: goal.label || '',
            definition
        };
    }

    /* =====================================================
       DEMO FALLBACK
       ===================================================== */

    function ensureDemoGoal() {
        const existing = readGoal();
        if (existing) return existing;

        const now = new Date().toISOString();

        const goal = { value: 'academic', label: 'الدراسة والماجستير', updated_at: now };
        const definition = {
            goal: 'academic',
            target_field: 'علوم الحاسوب',
            target_program: 'ماجستير تطوير البرمجيات',
            target_university: 'جامعة الأزهر',
            target_timeline: 'this_year',
            updated_at: now
        };

        saveJSON('next_goal', goal);
        saveJSON('next_goal_definition', definition);

        return { type: goal.value, label: goal.label, definition };
    }

    /* =====================================================
       HUMANIZE
       ===================================================== */

    function humanizeValue(value) {
        if (!value && value !== 0) return 'غير محدد';
        return VALUE_LABELS[value] || value;
    }

    /* =====================================================
       BUILD DETAILS
       ===================================================== */

    function buildDetails(goal) {
        detailsGrid.innerHTML = '';

        const config = GOALS[goal.type];
        if (!config) return;

        config.fields.forEach(field => {
            const value = goal.definition[field.key];
            if (!field.required && !value) return;

            const item = document.createElement('div');
            item.className = 'detail-item';

            const label = document.createElement('div');
            label.className = 'detail-label';
            label.textContent = field.label;

            const valueElement = document.createElement('div');
            valueElement.className = 'detail-value';
            valueElement.textContent = humanizeValue(value);

            item.appendChild(label);
            item.appendChild(valueElement);
            detailsGrid.appendChild(item);
        });
    }

    /* =====================================================
       RENDER GOAL
       ===================================================== */

    function renderGoal(goal) {
        if (!goal || !GOALS[goal.type]) {
            goalView.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        goalView.style.display = 'block';
        emptyState.style.display = 'none';

        const config = GOALS[goal.type];
        goalTitle.textContent = config.title;
        goalDescription.textContent = config.description;

        buildDetails(goal);
    }

    /* =====================================================
       BUILD EDIT FORM
       ===================================================== */

    function buildEditForm(goal) {
        dynamicFields.innerHTML = '';

        const config = GOALS[goal.type];

        config.fields.forEach(field => {
            const wrapper = document.createElement('div');
            wrapper.className = 'form-field';
            if (field.type === 'textarea') wrapper.classList.add('full');

            const label = document.createElement('label');
            label.className = 'form-label';
            label.htmlFor = `edit-${field.key}`;
            label.textContent = field.label;
            wrapper.appendChild(label);

            let control;

            if (field.type === 'textarea') {
                control = document.createElement('textarea');
                control.className = 'form-textarea';
                control.placeholder = field.placeholder || '';
            } else if (field.type === 'select') {
                control = document.createElement('select');
                control.className = 'form-select';

                const placeholder = document.createElement('option');
                placeholder.value = '';
                placeholder.textContent = 'اختر...';
                placeholder.disabled = true;
                control.appendChild(placeholder);

                field.options.forEach(option => {
                    const opt = document.createElement('option');
                    opt.value = option[0];
                    opt.textContent = option[1];
                    control.appendChild(opt);
                });
            } else {
                control = document.createElement('input');
                control.type = 'text';
                control.className = 'form-input';
                control.placeholder = field.placeholder || '';
            }

            control.id = `edit-${field.key}`;
            control.name = field.key;
            control.required = Boolean(field.required);

            if (goal.definition[field.key] !== undefined) {
                control.value = goal.definition[field.key];
            }

            wrapper.appendChild(control);
            dynamicFields.appendChild(wrapper);
        });
    }

    /* =====================================================
       EVENTS
       ===================================================== */

    document.getElementById('editGoalButton').addEventListener('click', function () {
        const goal = readGoal();
        if (!goal) return;

        buildEditForm(goal);
        editPanel.classList.add('open');
        editPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    document.getElementById('cancelEditButton').addEventListener('click', function () {
        editPanel.classList.remove('open');
    });

    function invalidateDerived() {
        ['next_analysis', 'next_control_map', 'next_steps', 'next_progress']
            .forEach(key => removeKey(key));
    }

    goalForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const currentGoal = readGoal();
        if (!currentGoal) return;

        const formData = new FormData(goalForm);
        const updatedDefinition = {};

        const config = GOALS[currentGoal.type];

        config.fields.forEach(field => {
            const value = formData.get(field.key);
            updatedDefinition[field.key] = typeof value === 'string' ? value.trim() : value;
        });

        const missing = config.fields.find(field =>
            field.required && !updatedDefinition[field.key]
        );

        if (missing) {
            const control = document.getElementById(`edit-${missing.key}`);
            if (control) control.focus();
            showToast(`أكمل حقل "${missing.label}".`);
            return;
        }

        const now = new Date().toISOString();

        const payload = {
            ...updatedDefinition,
            goal: currentGoal.type,
            previous_updated_at: currentGoal.definition.updated_at || null,
            updated_at: now
        };

        saveJSON('next_goal_definition', payload);

        const goal = readJSON('next_goal') || {};
        goal.updated_at = now;
        saveJSON('next_goal', goal);

        invalidateDerived();

        const profile = readJSON('next_profile');
        if (profile) {
            profile.updated_at = now;
            saveJSON('next_profile', profile);
        }

        renderGoal(readGoal());
        editPanel.classList.remove('open');
        showToast('تم تحديث هدفك.');
    });

    document.getElementById('reassessButton').addEventListener('click', function () {
        window.location.href = 'reassessment.html';
    });

    /* =====================================================
       INIT
       ===================================================== */

    (function init() {
        const goal = ensureDemoGoal();
        renderGoal(goal);
    })();

    /* =====================================================
       REVEAL UI — بعد تحميل كل شيء
       ===================================================== */

    window.addEventListener('load', () => {
        setTimeout(() => {
            const elements = document.querySelectorAll('.reveal:not(.visible)');
            if (!elements.length) return;

            const prefersReduced = window.matchMedia(
                '(prefers-reduced-motion: reduce)'
            ).matches;

            if (prefersReduced) {
                elements.forEach(el => el.classList.add('visible'));
                return;
            }

            const observer = new IntersectionObserver(
                (entries, obs) => {
                    entries.forEach(entry => {
                        if (!entry.isIntersecting) return;
                        entry.target.classList.add('visible');
                        obs.unobserve(entry.target);
                    });
                },
                { threshold: 0.05, rootMargin: '0px 0px -30px 0px' }
            );

            elements.forEach(el => observer.observe(el));
        }, 100);
    });

})();