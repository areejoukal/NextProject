/* =====================================================
   NEXT — ANALYSIS PAGE JS
   ===================================================== */

(function initAnalysis() {

    ensureSession();

    /* =====================================================
       DEMO FALLBACK
       ===================================================== */

    function ensureDemoState() {
        const goal = readJSON('next_goal');
        const analysis = readJSON('next_analysis');

        if (isObject(goal) && isObject(analysis)) {
            return { goal, analysis };
        }

        const now = new Date().toISOString();

        const demoGoal = goal || { value: 'academic', label: 'الدراسة والماجستير', updated_at: now };

        const demoAnalysis = analysis || {
            goal_snapshot: demoGoal.value,
            goal_label: demoGoal.label,
            state_snapshot: 'partially_clear',
            known: [
                'لديك جزء من الصورة، وبعض التفاصيل ما زالت تحتاج توضيحًا.',
                'لديك فهم واضح نسبيًا لوضعك الحالي.'
            ],
            unknown: [
                'المتطلبات الفعلية للوصول إلى هدفك ما زالت غير واضحة.',
                'هناك نقص في المعرفة أو المهارة يستحق المعالجة.'
            ],
            uncertain: ['استعدادك للخطوة القادمة متوسط حتى الآن.'],
            controllable: [
                { title: 'تطوير مهاراتك', description: 'يمكنك تحديد المهارات التي تحتاجها.' },
                { title: 'بناء أعمال ومشاريع', description: 'مشاريعك دليل ملموس.' },
                { title: 'التواصل وبناء العلاقات', description: 'بناء شبكة علاقات.' },
                { title: 'توضيح الهدف والأولويات', description: 'ترتيب أولوياتك.' }
            ],
            position_summary: 'لديك جزء من الصورة، وبعض التفاصيل ما زالت تحتاج توضيحًا.',
            answers_count: 6,
            completed_at: now,
            updated_at: now
        };

        saveJSON('next_goal', demoGoal);
        saveJSON('next_analysis', demoAnalysis);

        return { goal: demoGoal, analysis: demoAnalysis };
    }

    /* =====================================================
       RENDER LISTS
       ===================================================== */

    function renderList(elementId, items, markerClass) {
        const element = document.getElementById(elementId);
        element.innerHTML = '';

        if (!items || !items.length) {
            const empty = document.createElement('div');
            empty.className = 'list-empty';
            empty.textContent = 'ما في عناصر هنا حاليًا.';
            element.appendChild(empty);
            return;
        }

        items.forEach(item => {
            const text = typeof item === 'string' ? item : (item.title || '');
            if (!text) return;

            const row = document.createElement('div');
            row.className = 'list-item';

            const marker = document.createElement('span');
            marker.className = `list-marker ${markerClass}`;

            const span = document.createElement('span');
            span.textContent = text;

            row.appendChild(marker);
            row.appendChild(span);
            element.appendChild(row);
        });
    }

    function renderControlGrid(items) {
        const grid = document.getElementById('controlGrid');
        grid.innerHTML = '';

        if (!items || !items.length) {
            const empty = document.createElement('div');
            empty.className = 'list-empty';
            empty.textContent = 'ما في عناصر هنا حاليًا.';
            grid.appendChild(empty);
            return;
        }

        items.forEach(item => {
            const title = typeof item === 'string' ? item : (item.title || '');
            const description = typeof item === 'string' ? '' : (item.description || '');
            if (!title) return;

            const card = document.createElement('div');
            card.className = 'control-item';

            const icon = document.createElement('div');
            icon.className = 'control-item-icon';
            icon.textContent = '✓';

            const content = document.createElement('div');
            content.className = 'control-item-content';

            const titleEl = document.createElement('h4');
            titleEl.className = 'control-item-title';
            titleEl.textContent = title;
            content.appendChild(titleEl);

            if (description) {
                const descEl = document.createElement('p');
                descEl.className = 'control-item-text';
                descEl.textContent = description;
                content.appendChild(descEl);
            }

            card.appendChild(icon);
            card.appendChild(content);
            grid.appendChild(card);
        });
    }

    /* =====================================================
       RENDER ANALYSIS
       ===================================================== */

    function renderAnalysis(analysis, goal) {
        const positionHeadline = document.getElementById('positionHeadline');
        const positionSummary = document.getElementById('positionSummary');

        const knownCount = Array.isArray(analysis.known) ? analysis.known.length : 0;
        const unknownCount = Array.isArray(analysis.unknown) ? analysis.unknown.length : 0;
        const controlCount = Array.isArray(analysis.controllable) ? analysis.controllable.length : 0;

        let headline;
        if (unknownCount > knownCount) {
            headline = 'تحتاج إلى ترتيب الصورة قبل إضافة خطوات جديدة.';
        } else {
            headline = 'لديك اتجاه واضح، لكن بعض التفاصيل ما تزال بحاجة إلى وضوح.';
        }

        positionHeadline.textContent = headline;
        positionSummary.textContent = analysis.position_summary ||
            'أنت تعرف الاتجاه الذي تريد الوصول إليه.';

        renderList('knownList', analysis.known, 'blue');
        renderList('unclearList', analysis.unknown, 'amber');
        renderControlGrid(analysis.controllable);

        setTimeout(() => {
            animateCount(document.getElementById('metricKnown'), 0, knownCount, 900);
            animateCount(document.getElementById('metricUnknown'), 0, unknownCount, 900);
            animateCount(document.getElementById('metricControl'), 0, controlCount, 900);
        }, 500);
    }

    /* =====================================================
       INIT
       ===================================================== */

    (function init() {
        updateNotificationsBadge();

        const state = ensureDemoState();
        renderAnalysis(state.analysis, state.goal);
    })();

    document.getElementById('continueButton').addEventListener('click', () => {
        window.location.href = 'what-you-can-control.html';
    });

    /* =====================================================
       REVEAL UI
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