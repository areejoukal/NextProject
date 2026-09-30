/* =====================================================
   NEXT — NOTIFICATIONS PAGE JS
   ===================================================== */

(function initNotifications() {

    ensureSession();

    const notificationsList = document.getElementById('notificationsList');
    const emptyState = document.getElementById('emptyState');
    const unreadCount = document.getElementById('unreadCount');
    const toast = document.getElementById('toast');

    let notifications = [];

    /* =====================================================
       TOAST
       ===================================================== */

    let toastTimer;

    function showToast(message) {
        if (!toast) return;
        clearTimeout(toastTimer);
        toast.textContent = message;
        toast.classList.add('show');
        toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
    }

    /* =====================================================
       DEMO
       ===================================================== */

    function buildDemoNotifications() {
        return [
            { id: 'welcome', type: 'info', title: 'أهلًا بك في NEXT', message: 'ابدأ باختيار هدفك، وسنرافقك خطوة بخطوة.', action: 'goal-selection.html', created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(), read: false },
            { id: 'step_ready', type: 'success', title: 'خطوتك جاهزة', message: 'خلينا نرتب الصورة ونحدد أول خطوة.', action: 'next-steps.html', created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), read: false },
            { id: 'reassessment_reminder', type: 'warning', title: 'حان وقت مراجعة وضعك', message: 'مرّ بعض الوقت على تقييمك.', action: 'reassessment.html', created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), read: false },
            { id: 'settings_tip', type: 'neutral', title: 'خصّص تجربتك', message: 'يمكنك ضبط تذكيراتك من الإعدادات.', action: 'settings.html', created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), read: true }
        ];
    }

    function loadNotifications() {
        const profile = readJSON('next_profile') || {};
        if (isObject(profile) && Array.isArray(profile.notifications)) {
            notifications = profile.notifications;
            return;
        }
        notifications = buildDemoNotifications();
        saveNotifications();
    }

    function saveNotifications() {
        const profile = readJSON('next_profile') || {};
        profile.notifications = notifications;
        profile.updated_at = new Date().toISOString();
        saveJSON('next_profile', profile);
    }

    /* =====================================================
       ICONS
       ===================================================== */

    function getNotificationIcon(type) {
        const icons = {
            info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"></circle><path d="M12 10v6"></path><path d="M12 7h.01"></path></svg>',
            success: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M20 6L9 17l-5-5"></path></svg>',
            warning: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 3l9 17H3L12 3Z"></path><path d="M12 9v5"></path><path d="M12 17h.01"></path></svg>',
            neutral: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"></circle><path d="M8 12h8"></path></svg>'
        };
        return icons[type] || icons.info;
    }

    /* =====================================================
       TIME
       ===================================================== */

    function formatTime(dateValue) {
        if (!dateValue) return '';
        const date = new Date(dateValue);
        if (Number.isNaN(date.getTime())) return '';

        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minute = 60 * 1000;
        const hour = 60 * minute;
        const day = 24 * hour;

        if (diff < minute) return 'الآن';
        if (diff < hour) return `منذ ${Math.floor(diff / minute)} دقيقة`;
        if (diff < day) return `منذ ${Math.floor(diff / hour)} ساعة`;
        if (diff < 7 * day) return `منذ ${Math.floor(diff / day)} يوم`;

        return date.toLocaleDateString('ar', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    /* =====================================================
       RENDER
       ===================================================== */

    function renderNotifications() {
        notificationsList.innerHTML = '';

        const unread = notifications.filter(n => !n.read).length;
        unreadCount.textContent = unread;
        updateNotificationsBadge();

        if (!notifications.length) {
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';

        notifications.forEach(notification => {
            const item = document.createElement('article');
            item.style.cssText = `padding: 16px; border-bottom: 1px solid #F0F1F3; display: flex; gap: 12px; cursor: pointer; ${!notification.read ? 'background: #F8FAFF;' : ''}`;

            const icon = document.createElement('div');
            icon.style.cssText = 'width: 40px; height: 40px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; border-radius: 10px; background: #EFF6FF; color: var(--next-blue);';
            icon.innerHTML = getNotificationIcon(notification.type);

            const content = document.createElement('div');
            content.style.cssText = 'flex: 1; min-width: 0;';

            const title = document.createElement('div');
            title.style.cssText = 'font-size: 14px; font-weight: 600; color: var(--next-ink); margin-bottom: 4px;';
            title.textContent = notification.title || '';

            const message = document.createElement('div');
            message.style.cssText = 'font-size: 13px; color: var(--next-muted); line-height: 1.7;';
            message.textContent = notification.message || '';

            const time = document.createElement('div');
            time.style.cssText = 'margin-top: 6px; font-size: 11px; color: #9CA3AF;';
            time.textContent = formatTime(notification.created_at);

            content.appendChild(title);
            content.appendChild(message);
            content.appendChild(time);

            item.appendChild(icon);
            item.appendChild(content);

            item.addEventListener('click', () => {
                notification.read = true;
                saveNotifications();
                renderNotifications();
                if (notification.action) {
                    window.location.href = notification.action;
                }
            });

            notificationsList.appendChild(item);
        });
    }

    /* =====================================================
       MARK ALL
       ===================================================== */

    document.getElementById('markAllReadButton').addEventListener('click', () => {
        if (!notifications.length) {
            showToast('لا توجد إشعارات.');
            return;
        }
        notifications = notifications.map(n => ({ ...n, read: true }));
        saveNotifications();
        renderNotifications();
        showToast('تم تعليم جميع الإشعارات كمقروءة.');
    });

    /* =====================================================
       INIT
       ===================================================== */

    (function init() {
        loadNotifications();
        renderNotifications();
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