/* =====================================================
   NEXT — NEXT STEPS PAGE JS
   ===================================================== */

(function initNextSteps() {

    ensureSession();

    function effortLabel(value) {
        const labels = { low: 'منخفض', medium: 'متوسط', high: 'مرتفع' };
        return labels[value] || 'متوسط';
    }

    function timeLabel(minutes) {
        const value = Number(minutes);
        if (!value || Number.isNaN(value)) return '30–45 دقيقة';
        if (value <= 20) return `${value} دقيقة`;
        if (value <= 45) return '30–45 دقيقة';
        if (value <= 60) return 'حوالي ساعة';
        return `حوالي ${Math.round(value / 60)} ساعة`;
    }

    function buildOrRestoreSteps(analysis, controlMap, goal) {
        const existing = readJSON('next_steps');
        if (isObject(existing) && isObject(existing.primary) && Array.isArray(existing.secondary)) {
            return existing;
        }

        const unknown = Array.isArray(analysis.unknown) ? analysis.unknown : [];
        const controllable = Array.isArray(controlMap.controllable) ? controlMap.controllable : [];
        const goalLabel = goal && goal.label ? goal.label : 'هدفك';

        const hasUnknown = unknown.length > 0;
        const firstControllable = controllable[0] || null;

        const primary = hasUnknown
            ? {
                id: 'step_clarify',
                title: 'وضّح أهم نقطة غير واضحة عندك حاليًا',
                reason: 'قبل إضافة خطوات جديدة، تحتاج أولًا تفهم النقطة التي تُعيق رؤيتك الحالية.',
                why: 'لأن الوضوح يأتي قبل التنفيذ.',
                outcome: 'يكون عندك فهم أوضح لنقطة واحدة على الأقل، وقرار مبدئي حولها.',
                effort: 'medium',
                estimated_minutes: 45,
                status: 'pending'
            }
            : {
                id: 'step_develop',
                title: firstControllable ? (firstControllable.title || 'طوّر الجانب الأكثر ارتباطًا بهدفك') : 'طوّر الجانب الأكثر ارتباطًا بهدفك',
                reason: 'لديك وضوح كافٍ للبدء.',
                why: 'لأن التقدّم الفعلي نحو ' + goalLabel + ' يبدأ عندما تحوّل ما تعرفه إلى شيء ملموس.',
                outcome: 'يكون عندك تقدّم ملموس في الجانب الذي اخترته.',
                effort: 'medium',
                estimated_minutes: 60,
                status: 'pending'
            };

        const secondary = [
            { id: 'step_02', title: 'طوّر الجانب الأكثر ارتباطًا بهدفك', description: 'بعد وضوح الأولوية، انتقل إلى الجانب الذي يمكنك تطويره فعليًا.' },
            { id: 'step_03', title: 'راجع تقدمك بعد التنفيذ', description: 'بعد تنفيذ الخطوات الأولى، ارجع إلى NEXT وشوف كيف تغير وضعك.' }
        ];

        const explanation = 'لأنها مرتبطة بالأشياء التي يمكنك التأثير فيها.';
        const now = new Date().toISOString();

        const steps = {
            primary, secondary, explanation,
            goal_snapshot: goal.value,
            updated_at: now
        };

        saveJSON('next_steps', steps);

        const profile = readJSON('next_profile');
        if (profile) {
            profile.updated_at = now;
            saveJSON('next_profile', profile);
        }

        return steps;
    }

    function renderSteps(steps) {
        const primary = steps.primary;

        document.getElementById('primaryStepTitle').textContent = primary.title || '';
        document.getElementById('primaryStepReason').textContent = primary.reason || '';
        document.getElementById('primaryStepWhy').textContent = primary.why || '';
        document.getElementById('primaryStepOutcome').textContent = primary.outcome || '';
        document.getElementById('primaryStepEffort').textContent = effortLabel(primary.effort);
        document.getElementById('primaryStepTime').textContent = timeLabel(primary.estimated_minutes);

        if (Array.isArray(steps.secondary) && steps.secondary.length >= 2) {
            const first = steps.secondary[0];
            const second = steps.secondary[1];
            document.getElementById('secondaryStepOneTitle').textContent = first.title || '';
            document.getElementById('secondaryStepOneText').textContent = first.description || '';
            document.getElementById('secondaryStepTwoTitle').textContent = second.title || '';
            document.getElementById('secondaryStepTwoText').textContent = second.description || '';
        }

        document.getElementById('stepsExplanation').textContent = steps.explanation || '';
    }

    function ensureDemoState() {
        const goal = readJSON('next_goal');
        const analysis = readJSON('next_analysis');
        const controlMap = readJSON('next_control_map');

        if (isObject(goal) && isObject(analysis) && isObject(controlMap)) {
            return { goal, analysis, controlMap };
        }

        const now = new Date().toISOString();

        const demoGoal = goal || { value: 'academic', label: 'الدراسة والماجستير', updated_at: now };
        const demoAnalysis = analysis || {
            goal_snapshot: demoGoal.value,
            known: ['لديك فهم واضح نسبيًا لوضعك الحالي.'],
            unknown: ['المتطلبات الفعلية للوصول إلى هدفك ما زالت غير واضحة.', 'هناك نقص في المعرفة أو المهارة.'],
            uncertain: ['استعدادك متوسط.'],
            controllable: [
                { title: 'تطوير مهاراتك', description: 'يمكنك تحديد المهارات التي تحتاجها.' },
                { title: 'بناء أعمال ومشاريع', description: 'مشاريعك دليل ملموس.' }
            ],
            position_summary: 'لديك جزء من الصورة.',
            updated_at: now
        };
        const demoControlMap = controlMap || {
            controllable: [
                { title: 'تطوير مهاراتك', description: 'يمكنك تحديد المهارات التي تحتاجها.' },
                { title: 'بناء أعمال ومشاريع', description: 'مشاريعك دليل ملموس.' }
            ],
            uncontrollable: [{ title: 'قرار الجهة', description: 'ليس بيدك.' }],
            updated_at: now
        };

        saveJSON('next_goal', demoGoal);
        saveJSON('next_analysis', demoAnalysis);
        saveJSON('next_control_map', demoControlMap);

        return { goal: demoGoal, analysis: demoAnalysis, controlMap: demoControlMap };
    }

    /* =====================================================
       INIT
       ===================================================== */

    (function init() {
        updateNotificationsBadge();

        const state = ensureDemoState();
        const steps = buildOrRestoreSteps(state.analysis, state.controlMap, state.goal);
        renderSteps(steps);
    })();

    document.getElementById('primaryActionButton').addEventListener('click', () => {
        window.location.href = 'action-details.html';
    });

    document.getElementById('backButton').addEventListener('click', () => {
        window.location.href = 'what-you-can-control.html';
    });

    document.getElementById('dashboardButton').addEventListener('click', () => {
        window.location.href = 'dashboard.html';
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