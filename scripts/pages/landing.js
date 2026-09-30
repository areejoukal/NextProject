/* =====================================================
   NEXT — LANDING PAGE JS
   index.html
   ====================================================== */

(function initLanding() {

    /* =====================================================
       HEADER SCROLL STATE
       ===================================================== */

    const header = document.getElementById('siteHeader');

    function updateHeader() {
        if (!header) return;

        if (window.scrollY > 12) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    if (header) {
        updateHeader();
        window.addEventListener('scroll', updateHeader, { passive: true });
    }


    /* =====================================================
       MOBILE MENU
       ===================================================== */

    const mobileMenuButton = document.getElementById('mobileMenuButton');
    const mobileMenu = document.getElementById('mobileMenu');
    const menuIcon = document.getElementById('menuIcon');

    function closeMobileMenu() {
        if (!mobileMenu) return;

        mobileMenu.classList.remove('active');
        mobileMenuButton.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('menu-open');

        if (menuIcon) {
            menuIcon.innerHTML = `
                <path d="M4 7h16"></path>
                <path d="M4 12h16"></path>
                <path d="M4 17h16"></path>
            `;
        }
    }

    function openMobileMenu() {
        if (!mobileMenu) return;

        mobileMenu.classList.add('active');
        mobileMenuButton.setAttribute('aria-expanded', 'true');
        document.body.classList.add('menu-open');

        if (menuIcon) {
            menuIcon.innerHTML = `
                <path d="M6 6l12 12"></path>
                <path d="M18 6L6 18"></path>
            `;
        }
    }

    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            const isOpen = mobileMenu.classList.contains('active');
            if (isOpen) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });

        document.querySelectorAll('.mobile-menu-link, .mobile-menu-actions a')
            .forEach(link => {
                link.addEventListener('click', closeMobileMenu);
            });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 900) {
                closeMobileMenu();
            }
        });
    }


    /* =====================================================
       MOTION SYSTEM
       ===================================================== */

    staggerIndex();
    revealUI('.reveal, .stagger');


    /* =====================================================
       SMOOTH ANCHOR HANDLING
       ===================================================== */

    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (event) => {
            const targetId = link.getAttribute('href');
            if (!targetId || targetId === '#') return;

            const target = document.querySelector(targetId);
            if (!target) return;

            event.preventDefault();

            const headerHeight = window.innerWidth <= 900 ? 64 : 72;
            const targetPosition =
                target.getBoundingClientRect().top +
                window.scrollY -
                headerHeight -
                20;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        });
    });


    /* =====================================================
       LANDING ENTRY TRACKING
       ===================================================== */

    function markLandingEntry(source) {
        try {
            const profile = readJSON('next_profile') || {};
            profile.entry_source = source;
            profile.entry_at = new Date().toISOString();
            profile.updated_at = profile.entry_at;
            saveJSON('next_profile', profile);
        } catch (error) {
            /* ignore */
        }
    }

    document.querySelectorAll('[data-cta]').forEach(button => {
        button.addEventListener('click', () => {
            markLandingEntry(button.dataset.source || 'landing');
        });
    });

})();