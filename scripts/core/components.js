/* =====================================================
   NEXT — COMPONENTS
   حقن المكونات المشتركة (Sidebar + Topbar)
   ====================================================== */

(function initComponents() {

    /* =====================================================
       HELPERS
       ===================================================== */

    function readJSON(key) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    function getInitial(name) {
        if (!name || !name.trim()) return 'أ';
        return name.trim().charAt(0).toUpperCase();
    }

    function getCurrentPageId() {
        return document.body.dataset.page || '';
    }

    /* =====================================================
       SIDEBAR — BUILD HTML
       ===================================================== */

    function buildSidebarHTML(activePageId) {
        const nav = window.NEXT_NAV;
        if (!nav) {
            console.error('NEXT_COMPONENTS: NEXT_NAV غير محمّل');
            return '';
        }

        const primaryLinks = nav.sidebar.map(item => {
            const isActive = item.id === activePageId;
            return `
                <a href="${item.href}" class="nav-item${isActive ? ' active' : ''}"
                   ${isActive ? 'aria-current="page"' : ''}>
                    <svg class="nav-icon" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                        ${item.icon}
                    </svg>
                    ${item.label}
                </a>
            `;
        }).join('');

        const secondaryLinks = nav.sidebarSecondary.map(item => {
            const isActive = item.id === activePageId;
            return `
                <a href="${item.href}" class="nav-item${isActive ? ' active' : ''}"
                   ${isActive ? 'aria-current="page"' : ''}>
                    <svg class="nav-icon" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                        ${item.icon}
                    </svg>
                    ${item.label}
                </a>
            `;
        }).join('');

        const profile = readJSON('next_profile') || {};
        const name = profile.name?.trim() || 'حسابي';
        const email = profile.email?.trim() || 'account@example.com';
        const initial = getInitial(profile.name);

        return `
            <div class="sidebar-brand">
                <span class="brand-name">NEXT</span>
            </div>

            <nav class="sidebar-nav">
                <div class="nav-section-label">المساحة الشخصية</div>
                ${primaryLinks}
                <div class="sidebar-divider"></div>
                ${secondaryLinks}
            </nav>

            <div class="sidebar-footer">
                <div class="user-mini">
                    <div id="sidebarAvatar" class="user-avatar">${initial}</div>
                    <div class="user-mini-info">
                        <div id="sidebarName" class="user-mini-name">${name}</div>
                        <div id="sidebarEmail" class="user-mini-email">${email}</div>
                    </div>
                </div>
            </div>
        `;
    }

    /* =====================================================
       TOPBAR — BUILD HTML
       ===================================================== */

    function buildTopbarHTML(activePageId) {
        const nav = window.NEXT_NAV;
        if (!nav) {
            console.error('NEXT_COMPONENTS: NEXT_NAV غير محمّل');
            return '';
        }

        const crumb = nav.breadcrumbs[activePageId] || { parent: null, current: '' };

        const breadcrumbHTML = crumb.parent
            ? `<a href="${crumb.parent}" class="topbar-breadcrumb-parent">المساحة الشخصية</a>
               <span class="topbar-breadcrumb-sep">/</span>
               <span class="topbar-breadcrumb-current">${crumb.current}</span>`
            : `<span class="topbar-breadcrumb-current">${crumb.current}</span>`;

        const actionsHTML = nav.topbarActions.map(action => {
            const badge = action.withBadge
                ? `<span id="notificationsBadge" class="notifications-badge" style="display:none;"></span>`
                : '';
            return `
                <a href="${action.href}" class="icon-button" aria-label="${action.label}">
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
                         stroke-linejoin="round">
                        ${action.icon}
                    </svg>
                    ${badge}
                </a>
            `;
        }).join('');

        return `
            <div class="topbar-inner">
                <button id="mobileMenuButton" class="mobile-menu-button" type="button"
                        aria-label="فتح القائمة" aria-controls="sidebar" aria-expanded="false">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
                        <line x1="4" y1="6" x2="20" y2="6"></line>
                        <line x1="4" y1="12" x2="20" y2="12"></line>
                        <line x1="4" y1="18" x2="20" y2="18"></line>
                    </svg>
                </button>

                <div class="topbar-breadcrumb">${breadcrumbHTML}</div>

                <div class="topbar-actions">${actionsHTML}</div>
            </div>
        `;
    }

    /* =====================================================
       INJECT FUNCTIONS
       ===================================================== */

    function injectSidebar() {
        const target = document.querySelector('[data-component="sidebar"]');
        if (!target) return;

        const activePageId = getCurrentPageId();
        target.outerHTML = `
            <aside id="sidebar" class="sidebar" aria-label="التنقل الرئيسي">
                ${buildSidebarHTML(activePageId)}
            </aside>
        `;
    }

    function injectTopbar() {
        const target = document.querySelector('[data-component="topbar"]');
        if (!target) return;

        const activePageId = getCurrentPageId();
        target.outerHTML = `
            <header class="topbar">
                ${buildTopbarHTML(activePageId)}
            </header>
        `;
    }

    /* =====================================================
       UPDATE PROFILE
       ===================================================== */

    function updateSidebarProfile() {
        const profile = readJSON('next_profile') || {};
        const name = profile.name?.trim() || 'حسابي';
        const email = profile.email?.trim() || 'account@example.com';
        const initial = getInitial(profile.name);

        const sidebarName = document.getElementById('sidebarName');
        const sidebarEmail = document.getElementById('sidebarEmail');
        const sidebarAvatar = document.getElementById('sidebarAvatar');

        if (sidebarName) sidebarName.textContent = name;
        if (sidebarEmail) sidebarEmail.textContent = email;
        if (sidebarAvatar) sidebarAvatar.textContent = initial;
    }

    /* =====================================================
       UPDATE NOTIFICATIONS BADGE
       ===================================================== */

    function updateNotificationsBadge() {
        const profile = readJSON('next_profile') || {};
        const notifications = Array.isArray(profile.notifications)
            ? profile.notifications : [];

        const unread = notifications.filter(n => !n.read).length;
        const badge = document.getElementById('notificationsBadge');

        if (!badge) return;

        if (unread > 0) {
            badge.textContent = unread > 9 ? '9+' : String(unread);
            badge.style.display = 'inline-flex';
        } else {
            badge.style.display = 'none';
        }
    }

    /* =====================================================
       INIT
       ===================================================== */

    function init() {
        console.log('NEXT_COMPONENTS: init');

        if (!window.NEXT_NAV) {
            console.error('NEXT_COMPONENTS: NEXT_NAV غير موجود!');
            return;
        }

        injectSidebar();
        injectTopbar();
        updateNotificationsBadge();
    }

    // نشغّلها فورًا — DOM جاهز لأن السكربت في نهاية body
    init();

    window.NEXTComponents = {
        updateSidebarProfile,
        updateNotificationsBadge
    };

})();