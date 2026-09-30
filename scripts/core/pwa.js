/* =====================================================
   NEXT — PWA
   Service Worker + Install Prompt + Update Handler
   Simple Pinterest-style Bottom Bar
   ====================================================== */

(function initPWA() {

    /* =====================================================
       STYLES — بسيط مثل Pinterest
       ===================================================== */

    const PWA_STYLES = `
        /* ============ BOTTOM BAR ============ */
        .pwa-bar {
            position: fixed;
            left: 50%;
            bottom: 16px;
            z-index: 99999;

            width: calc(100% - 32px);
            max-width: 440px;

            transform: translateX(-50%) translateY(150%);
            opacity: 0;
            pointer-events: none;

            font-family: 'IBM Plex Sans Arabic', -apple-system, BlinkMacSystemFont, sans-serif;

            transition:
                transform 500ms cubic-bezier(0.16, 1, 0.3, 1),
                opacity 400ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .pwa-bar.visible {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
            pointer-events: auto;
        }

        /* ============ CONTAINER ============ */
        .pwa-bar-inner {
            display: flex;
            align-items: center;
            gap: 12px;

            padding: 10px 12px;

            background: #FFFFFF;
            border: 1px solid rgba(229, 231, 235, 0.9);
            border-radius: 16px;

            box-shadow:
                0 12px 32px -8px rgba(17, 24, 39, 0.18),
                0 4px 12px -4px rgba(17, 24, 39, 0.08);
        }

        /* ============ LOGO SMALL ============ */
        .pwa-bar-logo {
            position: relative;
            width: 40px;
            height: 40px;
            flex-shrink: 0;

            display: flex;
            align-items: center;
            justify-content: center;

            background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
            border-radius: 10px;
            border: 1px solid #BFDBFE;
        }

        .pwa-bar-logo .pwa-logo {
            position: relative;
            width: 22px;
            height: 22px;
        }

        .pwa-bar-logo .pwa-logo::before,
        .pwa-bar-logo .pwa-logo::after {
            content: '';
            position: absolute;
            width: 2.5px;
            height: 20px;
            background: #111827;
            border-radius: 1px;
            top: 1px;
        }

        .pwa-bar-logo .pwa-logo::before { left: 2px; }
        .pwa-bar-logo .pwa-logo::after  { right: 2px; }

        .pwa-bar-logo .pwa-logo-diagonal {
            position: absolute;
            width: 2.5px;
            height: 21px;
            top: 0.5px;
            left: 10px;
            background: #111827;
            border-radius: 1px;
            transform: rotate(39deg);
            transform-origin: center;
        }

        .pwa-bar-logo .pwa-logo-corner {
            position: absolute;
            width: 6px;
            height: 6px;
            top: -1px;
            right: -1px;
            background: #2563EB;
            border-radius: 1.5px;
            box-shadow: 0 0 0 2px #FFFFFF;
        }

        /* ============ TEXT ============ */
        .pwa-bar-text {
            flex: 1;
            min-width: 0;
            display: flex;
            flex-direction: column;
            gap: 2px;
        }

        .pwa-bar-title {
            font-size: 13.5px;
            font-weight: 700;
            color: #111827;
            line-height: 1.3;
            letter-spacing: -0.01em;
        }

        .pwa-bar-subtitle {
            font-size: 11.5px;
            font-weight: 500;
            color: #6B7280;
            line-height: 1.3;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        /* ============ ACTIONS ============ */
        .pwa-bar-actions {
            display: flex;
            align-items: center;
            gap: 6px;
            flex-shrink: 0;
        }

        .pwa-bar-install {
            height: 36px;
            padding: 0 16px;

            background: #2563EB;
            border: 0;
            border-radius: 10px;
            color: #FFFFFF;

            font-family: inherit;
            font-size: 13px;
            font-weight: 700;
            white-space: nowrap;
            cursor: pointer;

            transition:
                background 200ms ease,
                transform 200ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .pwa-bar-install:hover {
            background: #1D4ED8;
            transform: translateY(-1px);
        }

        .pwa-bar-install:active {
            transform: translateY(0) scale(0.97);
        }

        .pwa-bar-close {
            width: 32px;
            height: 32px;
            flex-shrink: 0;

            display: flex;
            align-items: center;
            justify-content: center;

            background: transparent;
            border: 0;
            border-radius: 8px;
            color: #9CA3AF;
            cursor: pointer;

            transition:
                background 180ms ease,
                color 180ms ease;
        }

        .pwa-bar-close:hover {
            background: #F3F4F6;
            color: #111827;
        }

        /* ============ RESPONSIVE ============ */
        @media (max-width: 480px) {
            .pwa-bar {
                bottom: 12px;
                width: calc(100% - 24px);
            }

            .pwa-bar-inner {
                padding: 8px 10px;
                gap: 10px;
                border-radius: 14px;
            }

            .pwa-bar-logo {
                width: 36px;
                height: 36px;
                border-radius: 9px;
            }

            .pwa-bar-logo .pwa-logo {
                width: 20px;
                height: 20px;
            }

            .pwa-bar-title {
                font-size: 12.5px;
            }

            .pwa-bar-subtitle {
                font-size: 11px;
            }

            .pwa-bar-install {
                height: 34px;
                padding: 0 12px;
                font-size: 12px;
            }
        }

        /* ============ SAFE AREA (iPhone) ============ */
        @supports (padding: max(0px)) {
            .pwa-bar {
                bottom: max(16px, env(safe-area-inset-bottom, 16px));
            }

            @media (max-width: 480px) {
                .pwa-bar {
                    bottom: max(12px, env(safe-area-inset-bottom, 12px));
                }
            }
        }

        /* ============ STANDALONE — Hide ============ */
        @media (display-mode: standalone) {
            .pwa-bar {
                display: none !important;
            }
        }
    `;

    /* حقن الـ Styles */
    function injectStyles() {
        if (document.getElementById('pwa-styles')) return;

        const style = document.createElement('style');
        style.id = 'pwa-styles';
        style.textContent = PWA_STYLES;
        document.head.appendChild(style);
    }


    /* =====================================================
       CHECK SUPPORT
       ===================================================== */

    if (!('serviceWorker' in navigator)) {
        console.log('[PWA] Service Worker غير مدعوم');
        return;
    }


    /* =====================================================
       REGISTER SERVICE WORKER
       ===================================================== */

    let swRegistration = null;

    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('/service-worker.js', { scope: '/' })
            .then((registration) => {
                swRegistration = registration;
                console.log('[PWA] Service Worker مُسجّل:', registration.scope);

                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    console.log('[PWA] تحديث جديد متوفر');

                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' &&
                            navigator.serviceWorker.controller) {
                            showUpdateBanner();
                        }
                    });
                });
            })
            .catch((error) => {
                console.warn('[PWA] تعذّر تسجيل Service Worker:', error.message);
            });
    });


    /* =====================================================
       INSTALL PROMPT
       ===================================================== */

    let deferredPrompt = null;
    let installBannerShown = false;

    window.addEventListener('beforeinstallprompt', (event) => {
        console.log('[PWA] Install prompt متوفر');

        event.preventDefault();
        deferredPrompt = event;

        if (localStorage.getItem('next_pwa_dismissed') === 'true') {
            return;
        }

        if (isStandalone()) return;

        setTimeout(() => {
            showInstallBanner();
        }, 2000);
    });


    /* =====================================================
       APP INSTALLED
       ===================================================== */

    window.addEventListener('appinstalled', () => {
        console.log('[PWA] تم تثبيت التطبيق');
        deferredPrompt = null;
        hideInstallBanner();
    });


    /* =====================================================
       HELPER
       ===================================================== */

    function isStandalone() {
        return (
            window.matchMedia('(display-mode: standalone)').matches ||
            window.navigator.standalone === true ||
            document.referrer.includes('android-app://')
        );
    }


    /* =====================================================
       LOGO HTML
       ===================================================== */

    const NEXT_LOGO_HTML = `
        <div class="pwa-logo" aria-hidden="true">
            <span class="pwa-logo-diagonal"></span>
            <span class="pwa-logo-corner"></span>
        </div>
    `;


    /* =====================================================
       SHOW INSTALL BANNER — Bottom Bar
       ===================================================== */

    function showInstallBanner() {
        if (installBannerShown) return;
        if (!deferredPrompt) return;

        installBannerShown = true;

        injectStyles();

        const existing = document.getElementById('pwaInstallBanner');
        if (existing) existing.remove();

        const bar = document.createElement('div');
        bar.id = 'pwaInstallBanner';
        bar.className = 'pwa-bar';
        bar.setAttribute('role', 'dialog');
        bar.setAttribute('aria-label', 'تثبيت NEXT');

        bar.innerHTML = `
            <div class="pwa-bar-inner">

                <div class="pwa-bar-logo">
                    ${NEXT_LOGO_HTML}
                </div>

                <div class="pwa-bar-text">
                    <div class="pwa-bar-title">ثبّت NEXT</div>
                    <div class="pwa-bar-subtitle">استخدمه بدون إنترنت، من الشاشة الرئيسية</div>
                </div>

                <div class="pwa-bar-actions">
                    <button type="button" class="pwa-bar-install" id="pwaInstallBtn">
                        تثبيت
                    </button>

                    <button type="button" class="pwa-bar-close" id="pwaCloseBtn" aria-label="إغلاق">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M18 6 6 18"></path>
                            <path d="m6 6 12 12"></path>
                        </svg>
                    </button>
                </div>

            </div>
        `;

        document.body.appendChild(bar);

        requestAnimationFrame(() => {
            bar.classList.add('visible');
        });

        /* Install */
        document.getElementById('pwaInstallBtn').addEventListener('click', async () => {
            if (!deferredPrompt) return;

            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;

            console.log('[PWA] User choice:', outcome);

            deferredPrompt = null;
            hideInstallBanner();
        });

        /* Close */
        document.getElementById('pwaCloseBtn').addEventListener('click', () => {
            localStorage.setItem('next_pwa_dismissed', 'true');
            hideInstallBanner();
        });
    }


    function hideInstallBanner() {
        const bar = document.getElementById('pwaInstallBanner');
        if (!bar) return;

        bar.classList.remove('visible');
        setTimeout(() => bar.remove(), 500);
    }


    /* =====================================================
       UPDATE BANNER
       ===================================================== */

    function showUpdateBanner() {
        injectStyles();

        const existing = document.getElementById('pwaUpdateBanner');
        if (existing) return;

        const bar = document.createElement('div');
        bar.id = 'pwaUpdateBanner';
        bar.className = 'pwa-bar';
        bar.setAttribute('role', 'alert');

        bar.innerHTML = `
            <div class="pwa-bar-inner">

                <div class="pwa-bar-logo">
                    ${NEXT_LOGO_HTML}
                </div>

                <div class="pwa-bar-text">
                    <div class="pwa-bar-title">تحديث جديد</div>
                    <div class="pwa-bar-subtitle">حدّث للحصول على آخر التحسينات</div>
                </div>

                <div class="pwa-bar-actions">
                    <button type="button" class="pwa-bar-install" id="pwaUpdateBtn">
                        تحديث
                    </button>

                    <button type="button" class="pwa-bar-close" id="pwaUpdateClose" aria-label="إغلاق">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M18 6 6 18"></path>
                            <path d="m6 6 12 12"></path>
                        </svg>
                    </button>
                </div>

            </div>
        `;

        document.body.appendChild(bar);

        requestAnimationFrame(() => {
            bar.classList.add('visible');
        });

        document.getElementById('pwaUpdateBtn').addEventListener('click', () => {
            if (swRegistration && swRegistration.waiting) {
                swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
            }
            setTimeout(() => window.location.reload(), 500);
        });

        document.getElementById('pwaUpdateClose').addEventListener('click', () => {
            bar.classList.remove('visible');
            setTimeout(() => bar.remove(), 500);
        });
    }


    /* =====================================================
       RELOAD ON SW UPDATE
       ===================================================== */

    let refreshing = false;

    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
    });


    /* =====================================================
       EXPOSE API
       ===================================================== */

    window.NEXTPWA = {
        isStandalone,
        getInstallPrompt: () => deferredPrompt,
        promptInstall: async () => {
            if (!deferredPrompt) return false;
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            return outcome === 'accepted';
        }
    };

    console.log('[PWA] جاهز');

})();