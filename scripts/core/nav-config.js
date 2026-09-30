/* =====================================================
   NEXT — NAV CONFIG
   إعدادات التنقل المشتركة (Sidebar + Topbar + Breadcrumb)
   ====================================================== */

window.NEXT_NAV = {

    /* =====================================================
       SIDEBAR — الروابط الرئيسية
       ===================================================== */
    sidebar: [
        {
            id: 'dashboard',
            href: 'dashboard.html',
            label: 'الرئيسية',
            icon: `<rect x="3" y="3" width="7" height="7" rx="1"></rect>
                   <rect x="14" y="3" width="7" height="7" rx="1"></rect>
                   <rect x="3" y="14" width="7" height="7" rx="1"></rect>
                   <rect x="14" y="14" width="7" height="7" rx="1"></rect>`
        },
        {
            id: 'goal',
            href: 'goal-details.html',
            label: 'هدفي',
            icon: `<circle cx="12" cy="12" r="9"></circle>
                   <circle cx="12" cy="12" r="5"></circle>
                   <circle cx="12" cy="12" r="1" fill="currentColor"></circle>`
        },
        {
            id: 'analysis',
            href: 'analysis.html',
            label: 'موقفي',
            icon: `<path d="M3 3v18h18"></path>
                   <path d="m7 16 4-5 3 3 5-7"></path>`
        },
        {
            id: 'steps',
            href: 'next-steps.html',
            label: 'خطواتي',
            icon: `<path d="M9 11 12 14 22 4"></path>
                   <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"></path>`
        },
        {
            id: 'progress',
            href: 'progress.html',
            label: 'تقدمي',
            icon: `<path d="M4 19V5"></path>
                   <path d="M4 19h16"></path>
                   <path d="M8 16v-5"></path>
                   <path d="M12 16V8"></path>
                   <path d="M16 16v-3"></path>
                   <path d="M20 16V6"></path>`
        }
    ],

    /* =====================================================
       SIDEBAR — رابط الإعدادات (منفصل بعد divider)
       ===================================================== */
    sidebarSecondary: [
        {
            id: 'settings',
            href: 'settings.html',
            label: 'الإعدادات',
            icon: `<circle cx="12" cy="12" r="3"></circle>
                   <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06-1.7 1.7-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V20h-2.4v-.3a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06-1.7-1.7.06-.06A1.65 1.65 0 0 0 8.6 15a1.65 1.65 0 0 0-1.51-1H6v-2.4h1.09A1.65 1.65 0 0 0 8.6 10a1.65 1.65 0 0 0-.33-1.82l-.06-.06 1.7-1.7.06.06A1.65 1.65 0 0 0 11.8 6a1.65 1.65 0 0 0 1-1.51V4h2.4v.49A1.65 1.65 0 0 0 16.2 6a1.65 1.65 0 0 0 1.82-.33l.06-.06 1.7 1.7-.06.06A1.65 1.65 0 0 0 19.4 15z"></path>`
        }
    ],

    /* =====================================================
       TOPBAR — Breadcrumb لكل صفحة
       ===================================================== */
    breadcrumbs: {
        'dashboard':      { parent: null,              current: 'الرئيسية' },
        'goal-details':   { parent: 'dashboard.html',  current: 'هدفي' },
        'analysis':       { parent: 'dashboard.html',  current: 'موقفي' },
        'next-steps':     { parent: 'dashboard.html',  current: 'خطوتي' },
        'progress':       { parent: 'dashboard.html',  current: 'تقدمي' },
        'notifications':  { parent: 'dashboard.html',  current: 'الإشعارات' },
        'settings':       { parent: 'dashboard.html',  current: 'الإعدادات' }
    },

    /* =====================================================
       TOPBAR — أزرار الإجراءات (ثابتة)
       ===================================================== */
    topbarActions: [
        {
            id: 'notifications',
            href: 'notifications.html',
            label: 'الإشعارات',
            withBadge: true,
            icon: `<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"></path>
                   <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>`
        },
        {
            id: 'account',
            href: 'settings.html',
            label: 'الحساب',
            withBadge: false,
            icon: `<circle cx="12" cy="8" r="4"></circle>
                   <path d="M4 21a8 8 0 0 1 16 0"></path>`
        }
    ]
};