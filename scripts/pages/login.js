/* =====================================================
   NEXT — LOGIN PAGE JS
   login.html
   ====================================================== */

(function initLogin() {

    /* =====================================================
       ELEMENTS
       ===================================================== */

    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const passwordToggle = document.getElementById('passwordToggle');
    const eyeIcon = document.getElementById('eyeIcon');
    const loginButton = document.getElementById('loginButton');
    const loginButtonText = document.getElementById('loginButtonText');
    const googleButton = document.getElementById('googleButton');
    const rememberMe = document.getElementById('rememberMe');
    
    const successBanner = document.getElementById('successBanner');


    /* =====================================================
       SUCCESS BANNER (يظهر بعد التسجيل)
       ===================================================== */

    (function showSuccessBanner() {
        const justRegistered = sessionStorage.getItem('just_registered');

        if (justRegistered === 'true' && successBanner) {
            successBanner.hidden = false;

            // إخفاء تلقائي بعد 8 ثواني
            setTimeout(() => {
                successBanner.hidden = true;
            }, 8000);
        }
    })();


    /* =====================================================
       EXISTING SESSION HANDLING
       ===================================================== */

    (function handleExistingSession() {

    // إذا كان المستخدم قادماً من التسجيل → تجاهل
    const justRegistered = sessionStorage.getItem('just_registered');
    if (justRegistered === 'true') {
        removeKey(SESSION_KEY);
        return;
    }

    clearExpiredSession();

    const session = readJSON(SESSION_KEY);

    if (isValidSession(session)) {
        // ✅ المستخدم مسجّل دخول بالفعل → انتقل مباشرة إلى dashboard
        console.log('✅ جلسة نشطة - الانتقال إلى dashboard.html');
        window.location.replace('dashboard.html');
        return;
    }
})();


    /* =====================================================
       PASSWORD VISIBILITY
       ===================================================== */

    const EYE_OPEN = `
        <path d="M2.062 12.348a1 1 0 0 1 0-.696C3.423 7.604 7.36 5 12 5c4.64 0 8.577 2.604 9.938 6.652a1 1 0 0 1 0 .696C20.577 16.396 16.64 19 12 19c-4.64 0-8.577-2.604-9.938-6.652Z"></path>
        <circle cx="12" cy="12" r="3"></circle>
    `;

    const EYE_CLOSED = `
        <path d="M3 3l18 18"></path>
        <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83"></path>
        <path d="M9.88 4.24A10.6 10.6 0 0 1 12 4c4.64 0 8.58 2.6 9.94 6.65a1 1 0 0 1 0 .7 10.9 10.9 0 0 1-3.05 4.36"></path>
        <path d="M6.61 6.61A10.9 10.9 0 0 0 2.06 11.3a1 1 0 0 0 0 .7C3.42 16.4 7.36 19 12 19c1.61 0 3.13-.35 4.47-.98"></path>
    `;

    if (passwordToggle && eyeIcon && passwordInput) {
        passwordToggle.addEventListener('click', () => {
            const visible = passwordInput.type === 'password';
            passwordInput.type = visible ? 'text' : 'password';

            passwordToggle.setAttribute(
                'aria-label',
                visible ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'
            );

            passwordToggle.setAttribute('aria-pressed', String(visible));
            eyeIcon.innerHTML = visible ? EYE_CLOSED : EYE_OPEN;
        });
    }


    /* =====================================================
       VALIDATION
       ===================================================== */

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function clearErrors() {
        if (emailInput) emailInput.classList.remove('has-error');
        if (passwordInput) passwordInput.classList.remove('has-error');
        if (emailError) emailError.classList.remove('visible');
        if (passwordError) passwordError.classList.remove('visible');
    }

    function validateForm() {
        clearErrors();

        let valid = true;

        const email = sanitizeEmail(emailInput ? emailInput.value : '');

        if (!email || !isValidEmail(email)) {
            if (emailInput) emailInput.classList.add('has-error');
            if (emailError) emailError.classList.add('visible');
            valid = false;
        }

        if (!passwordInput || !passwordInput.value) {
            if (passwordInput) passwordInput.classList.add('has-error');
            if (passwordError) passwordError.classList.add('visible');
            valid = false;
        }

        return valid;
    }

    if (emailInput) {
        emailInput.addEventListener('input', () => {
            if (emailInput.value.trim()) {
                emailInput.classList.remove('has-error');
                if (emailError) emailError.classList.remove('visible');
            }
        });
    }

    if (passwordInput) {
        passwordInput.addEventListener('input', () => {
            if (passwordInput.value) {
                passwordInput.classList.remove('has-error');
                if (passwordError) passwordError.classList.remove('visible');
            }
        });
    }


    /* =====================================================
       LOGIN SUBMIT
       ===================================================== */

    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();

            if (!validateForm()) {
                const firstError = document.querySelector('.has-error');
                if (firstError) firstError.focus();
                return;
            }

            const email = sanitizeEmail(emailInput.value);
            const remember = rememberMe ? rememberMe.checked : false;

            if (loginButton) {
                loginButton.disabled = true;
            }

            if (loginButtonText) {
                loginButtonText.innerHTML = `
                    <span class="button-spinner" aria-hidden="true"></span>
                `;
            }

            // ✅ إنشاء الجلسة
            createSession(email, remember);

            // ✅ تحديث next_profile بالبريد (لضمان التزامن)
            const profile = readJSON('next_profile') || {};
            profile.email = email;
            profile.updated_at = new Date().toISOString();
            saveJSON('next_profile', profile);

            // ✅ تحديد وجهة الانتقال
            const hasCompletedJourney =
                profile.journey_started === true &&
                readJSON('next_analysis') &&
                readJSON('next_steps');

            // ✅ حذف علامة just_registered
            sessionStorage.removeItem('just_registered');

            setTimeout(() => {
                if (hasCompletedJourney) {
                    window.location.href = 'dashboard.html';
                } else {
                    window.location.href = 'welcome.html';
                }
            }, 700);
        });
    }


    /* =====================================================
       GOOGLE AUTH
       ===================================================== */

    if (googleButton) {
        googleButton.addEventListener('click', () => {
            console.log('Google authentication will be connected here.');
        });
    }

})();