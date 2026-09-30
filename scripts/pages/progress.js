/* =====================================================
   NEXT — PROGRESS PAGE JS
   ===================================================== */

(function initProgress() {

    ensureSession();

    const STATUS_LABELS = {
        pending: 'لم تبدأ بعد',
        in_progress: 'قيد التنفيذ',
        completed: 'مكتملة',
        skipped: 'تم تخطيها'
    };

    function loadProgress() {
        const steps = readJSON('next_steps');
        const progress = readJSON('next_progress');

        const primaryCount = 1;
        const secondaryCount = steps && Array.isArray(steps.secondary) ? steps.secondary.length : 2;
        const total = primaryCount + secondaryCount;

        let completed = 0;

        if (steps && steps.primary && steps.primary.status === 'completed') {
            completed += 1;
        }

        if (progress && Array.isArray(progress.completed_steps)) {
            completed = Math.max(completed, new Set(progress.completed_steps).size);
        }

        completed = Math.min(completed, total);

        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        let currentStatus = 'لم تبدأ بعد';
        if (steps && steps.primary) {
            currentStatus = STATUS_LABELS[steps.primary.status] || 'لم تبدأ بعد';
        }

        const lastUpdate = (progress && progress.updated_at) || (steps && steps.updated_at) || null;

        document.getElementById('completedCount').textContent = String(completed);
        document.getElementById('progressNumber').textContent = `${percentage}%`;
        document.getElementById('progressCompletedText').textContent = `${completed} من ${total} خطوات مكتملة`;
        document.getElementById('currentStatus').textContent = currentStatus;
        document.getElementById('lastUpdated').textContent = lastUpdate ? formatShortDate(lastUpdate) : 'لا يوجد';

        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (!prefersReduced) {
            setTimeout(() => {
                const completedEl = document.getElementById('completedCount');
                completedEl.textContent = '0';
                animateCount(completedEl, 0, completed, 900);

                const progressEl = document.getElementById('progressNumber');
                progressEl.textContent = '0%';
                animateCount(progressEl, 0, percentage, 1000, '%');

                const ratio = total > 0 ? Math.max(0, Math.min(1, completed / total)) : 0;
                document.getElementById('progressFill').style.transform = `scaleX(${ratio})`;
            }, 500);
        } else {
            document.getElementById('progressFill').style.transform =
                `scaleX(${total > 0 ? completed / total : 0})`;
        }
    }

    function loadActivity() {
        const steps = readJSON('next_steps');
        const progress = readJSON('next_progress');

        const container = document.getElementById('activityList');
        container.innerHTML = '';

        const events = [];

        if (steps && steps.primary) {
            const primary = steps.primary;
            if (primary.status === 'completed') {
                events.push({ label: 'اكتملت الخطوة', title: primary.title || '', date: primary.completed_at || primary.updated_at || null, icon: 'completed' });
            } else if (primary.status === 'in_progress') {
                events.push({ label: 'بدأت الخطوة', title: primary.title || '', date: primary.updated_at || null, icon: 'in_progress' });
            } else {
                events.push({ label: 'الخطوة الرئيسية', title: primary.title || '', date: primary.updated_at || null, icon: 'neutral' });
            }
        }

        if (steps && Array.isArray(steps.secondary) && progress && Array.isArray(progress.completed_steps)) {
            const set = new Set(progress.completed_steps);
            steps.secondary.forEach(step => {
                if (set.has(step.id)) {
                    events.push({ label: 'اكتملت خطوة', title: step.title || '', date: progress.updated_at || null, icon: 'completed' });
                }
            });
        }

        events.sort((a, b) => (b.date ? new Date(b.date) : 0) - (a.date ? new Date(a.date) : 0));

        if (!events.length) {
            const empty = document.createElement('div');
            empty.className = 'empty-state';
            empty.innerHTML = '<div class="empty-title">لسه ما عندك نشاط مسجل</div><p class="empty-text">لما تبدأ تنفيذ خطواتك، رح يظهر تقدمك هون.</p>';
            container.appendChild(empty);
            return;
        }

        events.forEach(event => {
            const item = document.createElement('div');
            item.style.cssText = 'display: flex; align-items: flex-start; gap: 12px; padding: 14px 0; border-bottom: 1px solid #F0F1F3;';

            const content = document.createElement('div');
            const title = document.createElement('div');
            title.style.cssText = 'font-size: 14px; color: var(--next-ink); margin-bottom: 4px;';
            title.textContent = event.title ? `${event.label}: ${event.title}` : event.label;

            const date = document.createElement('div');
            date.style.cssText = 'font-size: 11px; color: #9CA3AF;';
            date.textContent = formatDate(event.date, { fallback: 'الآن' });

            content.appendChild(title);
            content.appendChild(date);
            item.appendChild(content);
            container.appendChild(item);
        });
    }

    document.getElementById('reassessmentButton').addEventListener('click', () => {
        const progress = readJSON('next_progress') || {};
        const now = new Date().toISOString();
        progress.last_reassessment_at = now;
        progress.updated_at = now;
        saveJSON('next_progress', progress);
        window.location.href = 'reassessment.html';
    });

    /* =====================================================
       INIT
       ===================================================== */

    (function init() {
        updateNotificationsBadge();
        loadProgress();
        loadActivity();
    })();

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