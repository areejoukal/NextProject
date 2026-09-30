/* =====================================================
   NEXT — DASHBOARD PAGE JS
   dashboard.html
   ====================================================== */

(function initDashboard() {

    /* =====================================================
       SESSION
       ===================================================== */

    ensureSession();

    /* =====================================================
       LABEL HELPERS
       ===================================================== */

    function goalLabel(goal) {
        const labels = {
            academic: 'الدراسة والماجستير',
            employment: 'الحصول على وظيفة',
            career_growth: 'تطوير مساري المهني',
            career_change: 'تغيير مجالي',
            skills: 'تطوير مهاراتي',
            other: 'هدف مختلف'
        };
        return labels[goal] || 'هدفك الحالي';
    }

    function effortLabel(value) {
        const labels = {
            low: 'منخفض',
            medium: 'متوسط',
            high: 'مرتفع'
        };
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

    function statusLabel(status) {
        const labels = {
            pending: 'لم تبدأ بعد',
            in_progress: 'قيد التنفيذ',
            completed: 'مكتملة',
            skipped: 'تم تخطيها'
        };
        return labels[status] || 'لم تبدأ بعد';
    }

    /* =====================================================
       LOAD USER
       ===================================================== */

    function loadUser() {
        const profile = readJSON('next_profile');
        if (!profile) return;

        const name = profile.name?.trim() || '';

        if (name) {
            const welcomeTitle = document.getElementById('welcomeTitle');
            if (welcomeTitle) welcomeTitle.textContent = `أهلًا ${name}.`;
        }
    }

    /* =====================================================
       LOAD GOAL
       ===================================================== */

    function loadGoal() {
        const goal = readJSON('next_goal');
        const definition = readJSON('next_goal_definition') || {};

        const goalValue = document.getElementById('goalValue');
        const goalDetail = document.getElementById('goalDetail');

        if (goalValue) {
            goalValue.textContent =
                (goal && goal.label) ||
                goalLabel(goal && goal.value) ||
                'لم يتم تحديد الهدف';
        }

        if (goalDetail) {
            let detail = 'الهدف الذي اخترته حاليًا.';

            if (definition.target_field) detail = definition.target_field;
            else if (definition.target_role) detail = definition.target_role;
            else if (definition.target_skill) detail = definition.target_skill;
            else if (definition.target_direction) detail = definition.target_direction;
            else if (definition.goal_text) detail = definition.goal_text;

            goalDetail.textContent = detail;
        }
    }

    /* =====================================================
       LOAD POSITION
       ===================================================== */

    function loadPosition() {
        const analysis = readJSON('next_analysis');

        const positionTitle = document.getElementById('positionTitle');
        const positionSummary = document.getElementById('positionSummary');

        if (!analysis) {
            if (positionTitle) positionTitle.textContent = 'لم يكتمل التحليل بعد.';
            if (positionSummary) positionSummary.textContent = 'أكمل التقييم لعرض صورتك الحالية.';
            return;
        }

        const knownCount = Array.isArray(analysis.known) ? analysis.known.length : 0;
        const unknownCount = Array.isArray(analysis.unknown) ? analysis.unknown.length : 0;

        let headline;

        if (unknownCount > knownCount) {
            headline = 'تحتاج إلى ترتيب الصورة قبل إضافة خطوات جديدة.';
        } else {
            headline = 'لديك اتجاه واضح، لكن بعض التفاصيل ما تزال بحاجة إلى وضوح.';
        }

        const summary =
            analysis.position_summary ||
            (analysis.position && analysis.position.summary) ||
            'أنت تعرف الاتجاه الذي تريد الوصول إليه.';

        if (positionTitle) positionTitle.textContent = headline;
        if (positionSummary) positionSummary.textContent = summary;
    }

    /* =====================================================
       LOAD CURRENT STEP
       ===================================================== */

    function loadCurrentStep() {
        const steps = readJSON('next_steps');

        const currentStepTitle = document.getElementById('currentStepTitle');
        const currentStepReason = document.getElementById('currentStepReason');
        const stepTime = document.getElementById('stepTime');
        const stepEffort = document.getElementById('stepEffort');
        const currentStepStatus = document.getElementById('currentStepStatus');
        const currentStepButtonLabel = document.getElementById('currentStepButtonLabel');

        if (!isObject(steps) || !isObject(steps.primary)) {
            if (currentStepTitle) currentStepTitle.textContent = 'لا توجد خطوة محددة بعد.';
            if (currentStepReason) currentStepReason.textContent = 'انتقل إلى صفحة الخطوات لتحديد خطوتك الأولى.';
            if (stepTime) stepTime.textContent = '—';
            if (stepEffort) stepEffort.textContent = '—';
            if (currentStepStatus) currentStepStatus.textContent = '—';
            if (currentStepButtonLabel) currentStepButtonLabel.textContent = 'الخطوات';
            return;
        }

        const primary = steps.primary;

        if (currentStepTitle) currentStepTitle.textContent = primary.title || '—';
        if (currentStepReason) currentStepReason.textContent = primary.reason || '';
        if (stepTime) stepTime.textContent = timeLabel(primary.estimated_minutes);
        if (stepEffort) stepEffort.textContent = effortLabel(primary.effort);
        if (currentStepStatus) currentStepStatus.textContent = statusLabel(primary.status);

        if (currentStepButtonLabel) {
            if (primary.status === 'completed') {
                currentStepButtonLabel.textContent = 'مراجعة الخطوة';
            } else if (primary.status === 'in_progress') {
                currentStepButtonLabel.textContent = 'متابعة الخطوة';
            } else {
                currentStepButtonLabel.textContent = 'فتح الخطوة';
            }
        }
    }

    /* =====================================================
       LOAD UPCOMING
       ===================================================== */

    function loadUpcoming() {
        const steps = readJSON('next_steps');
        const container = document.getElementById('upcomingList');

        if (!container) return;

        container.innerHTML = '';

        let upcoming = [];

        if (isObject(steps) && Array.isArray(steps.secondary)) {
            upcoming = steps.secondary;
        }

        if (!upcoming.length) {
            const empty = document.createElement('p');
            empty.style.color = 'var(--next-muted)';
            empty.style.fontSize = '13px';
            empty.style.lineHeight = '1.7';
            empty.textContent = 'لا توجد خطوات إضافية بعد الخطوة الحالية.';
            container.appendChild(empty);
            return;
        }

        upcoming.slice(0, 2).forEach((step, index) => {
            const item = document.createElement('div');
            item.className = 'upcoming-item';

            const number = document.createElement('div');
            number.className = 'upcoming-number';
            number.textContent = String(index + 2).padStart(2, '0');

            const content = document.createElement('div');
            content.style.minWidth = '0';

            const title = document.createElement('p');
            title.className = 'upcoming-title';
            title.textContent = step.title || 'خطوة قادمة';

            const status = document.createElement('p');
            status.className = 'upcoming-status';
            status.textContent = 'بعد الخطوة الحالية';

            content.appendChild(title);
            content.appendChild(status);
            item.appendChild(number);
            item.appendChild(content);
            container.appendChild(item);
        });
    }

    /* =====================================================
       LOAD PROGRESS
       ===================================================== */

    function loadProgress() {
        const steps = readJSON('next_steps');
        const progress = readJSON('next_progress');

        const primaryCount = 1;
        const secondaryCount =
            isObject(steps) && Array.isArray(steps.secondary)
                ? steps.secondary.length
                : 2;

        const total = primaryCount + secondaryCount;

        let completed = 0;

        if (isObject(steps) && isObject(steps.primary)) {
            if (steps.primary.status === 'completed') completed += 1;
        }

        if (isObject(progress) && Array.isArray(progress.completed_steps)) {
            const uniqueCompleted = new Set(progress.completed_steps);
            completed = Math.max(completed, uniqueCompleted.size);
        }

        completed = Math.min(completed, total);

        const progressCount = document.getElementById('progressCount');
        const progressFill = document.getElementById('progressFill');

        const ratio = total > 0
            ? Math.max(0, Math.min(1, completed / total))
            : 0;

        setTimeout(() => {
            if (progressCount) animateCount(progressCount, 0, completed, 900);
        }, 500);

        if (progressFill) {
            setTimeout(() => {
                progressFill.style.transform = `scaleX(${ratio})`;
            }, 500);
        }
    }

    /* =====================================================
       CURRENT STEP BUTTON
       ===================================================== */

    function setupCurrentStepButton() {
        const button = document.getElementById('currentStepButton');
        if (!button) return;

        button.addEventListener('click', () => {
            const steps = readJSON('next_steps');

            if (!isObject(steps) || !isObject(steps.primary)) {
                window.location.href = 'next-steps.html';
                return;
            }

            window.location.href = 'action-details.html';
        });
    }

    /* =====================================================
       REVEAL UI
       ===================================================== */

    function initRevealUI() {
        const elements = document.querySelectorAll('.reveal');

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
            { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
        );

        elements.forEach(el => observer.observe(el));
    }

    /* =====================================================
       INIT
       ===================================================== */

    function init() {
        loadUser();
        loadGoal();
        loadPosition();
        loadCurrentStep();
        loadUpcoming();
        loadProgress();

        updateNotificationsBadge();
        setupCurrentStepButton();
        initMobileSidebar();

        setTimeout(initRevealUI, 60);
    }

    // نشغّلها فورًا — DOM جاهز
    init();

})();