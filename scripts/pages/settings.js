/* =====================================================
   NEXT — SETTINGS PAGE JS
   ===================================================== */

(function initSettings() {

    ensureSession();

    const profileForm = document.getElementById('profileForm');
    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const profileAvatar = document.getElementById('profileAvatar');
    const cancelProfile = document.getElementById('cancelProfile');
    const saveProfileButton = document.getElementById('saveProfileButton');
    const toast = document.getElementById('toast');

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
       RENDER
       ===================================================== */

    let originalProfile = readJSON('next_profile') || {};

    function renderProfile(profile) {
        const name = profile.name?.trim() || 'حسابي';
        const email = profile.email?.trim() || 'account@example.com';

        fullNameInput.value = profile.name || '';
        emailInput.value = profile.email || '';

        profileName.textContent = name;
        profileEmail.textContent = email;

        const initial = getInitial(profile.name);
        profileAvatar.textContent = initial;

        updateSaveButtonState();
    }

    function hasUnsavedChanges() {
        const name = fullNameInput.value.trim();
        const email = emailInput.value.trim();
        return (
            name !== (originalProfile.name || '') ||
            email !== (originalProfile.email || '')
        );
    }

    function updateSaveButtonState() {
        saveProfileButton.disabled = !hasUnsavedChanges();
    }

    fullNameInput.addEventListener('input', updateSaveButtonState);
    emailInput.addEventListener('input', updateSaveButtonState);

    renderProfile(originalProfile);

    /* =====================================================
       SUBMIT
       ===================================================== */

    profileForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const name = fullNameInput.value.trim();
        const email = emailInput.value.trim();

        if (!name) {
            fullNameInput.focus();
            showToast('اكتب اسمك أولًا.');
            return;
        }

        if (!email || !email.includes('@')) {
            emailInput.focus();
            showToast('تأكد من البريد الإلكتروني.');
            return;
        }

        const now = new Date().toISOString();

        const merged = { ...originalProfile, name, email, updated_at: now };
        saveJSON('next_profile', merged);

        const session = readJSON('next_session');
        if (session) {
            session.user_email = email;
            session.updated_at = now;
            saveJSON('next_session', session);
        }

        originalProfile = merged;
        renderProfile(merged);
        showToast('تم حفظ التغييرات.');

        if (window.NEXTComponents && window.NEXTComponents.updateSidebarProfile) {
            window.NEXTComponents.updateSidebarProfile();
        }
    });

    cancelProfile.addEventListener('click', () => {
        renderProfile(originalProfile);
        showToast('تم إلغاء التغييرات.');
    });

    /* =====================================================
       TOGGLES
       ===================================================== */

    document.querySelectorAll('.toggle').forEach(toggle => {
        const setting = toggle.dataset.setting;

        const profile = readJSON('next_profile') || {};
        const settings = isObject(profile.settings) ? profile.settings : {};

        if (typeof settings[setting] === 'boolean') {
            toggle.setAttribute('aria-checked', String(settings[setting]));
        }

        toggle.addEventListener('click', function () {
            const current = this.getAttribute('aria-checked') === 'true';
            const next = !current;
            this.setAttribute('aria-checked', String(next));

            const profile = readJSON('next_profile') || {};
            const settings = isObject(profile.settings) ? profile.settings : {};
            settings[setting] = next;
            profile.settings = settings;
            profile.updated_at = new Date().toISOString();
            saveJSON('next_profile', profile);

            showToast(next ? 'تم تفعيل التفضيل.' : 'تم إيقاف التفضيل.');
        });
    });

    /* =====================================================
       LOGOUT
       ===================================================== */

    document.getElementById('logoutButton').addEventListener('click', () => {
        const confirmed = window.confirm('هل تريد تسجيل الخروج من NEXT؟');
        if (!confirmed) return;
        localStorage.removeItem('next_session');
        window.location.href = 'login.html';
    });

    /* =====================================================
       DELETE ACCOUNT
       ===================================================== */

    document.getElementById('deleteAccountButton').addEventListener('click', () => {
        const confirmation = window.prompt('اكتب كلمة DELETE للتأكيد:');
        if (confirmation !== 'DELETE') {
            if (confirmation !== null) showToast('لم يتم التأكيد — الحذف ملغى.');
            return;
        }
        try {
            localStorage.clear();
            sessionStorage.clear();
        } catch (error) {
            console.warn('Unable to clear storage.', error);
        }
        window.location.href = 'index.html';
    });

    /* =====================================================
       INIT
       ===================================================== */

    updateNotificationsBadge();

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