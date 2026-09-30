/* =====================================================
   NEXT — UI HELPERS
   Mobile sidebar, Toast, Badges
   ====================================================== */

/**
 * Initialize mobile sidebar
 */
function initMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const menuButton = document.getElementById('mobileMenuButton');

    if (!sidebar || !overlay || !menuButton) return;

    function openSidebar() {
        sidebar.classList.add('open');
        overlay.classList.add('show');
        menuButton.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
        menuButton.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    menuButton.addEventListener('click', () => {
        const isOpen = sidebar.classList.contains('open');
        if (isOpen) {
            closeSidebar();
        } else {
            openSidebar();
        }
    });

    overlay.addEventListener('click', closeSidebar);

    document.querySelectorAll('.sidebar a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 900) {
                closeSidebar();
            }
        });
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && sidebar.classList.contains('open')) {
            closeSidebar();
        }
    });
}

/**
 * Show toast message
 */
let toastTimer;

function showToast(message, duration = 2600) {
    const toast = document.getElementById('toast');
    if (!toast) return;

    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('show');

    toastTimer = setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

/**
 * Update notifications badge
 */
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

/**
 * Update topbar notifications badge
 */
function updateTopbarBadge(unreadCount) {
    const badge = document.getElementById('notificationsBadge');
    if (!badge) return;

    if (unreadCount > 0) {
        badge.textContent = unreadCount > 9 ? '9+' : String(unreadCount);
        badge.style.display = 'inline-flex';
    } else {
        badge.style.display = 'none';
    }
}