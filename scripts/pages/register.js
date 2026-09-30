/* =====================================================
   NEXT — REGISTER PAGE JS
   register.html
   ====================================================== */

(function initRegister() {

    /* =====================================================
       ELEMENTS
       ===================================================== */

    const registerForm = document.getElementById('registerForm');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const passwordConfirmationInput = document.getElementById('passwordConfirmation');
    const termsCheckbox = document.getElementById('terms');

    const nameError = document.getElementById('nameError');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const confirmationError = document.getElementById('confirmationError');
    const termsError = document.getElementById('termsError');

    const passwordToggle = document.getElementById('passwordToggle');
    const confirmationToggle = document.getElementById('confirmationToggle');
    const eyeIcon = document.getElementById('eyeIcon');
    const confirmationEyeIcon = document.getElementById('confirmationEyeIcon');

    const registerButton = document.getElementById('registerButton');
    const registerButtonText = document.getElementById('registerButtonText');
    const googleButton = document.getElementById('googleButton');

    const passwordRequirements = document.getElementById('passwordRequirements');

    const lengthRequirement = document.getElementById('lengthRequirement');
    const numberRequirement = document.getElementById('numberRequirement');
    const uppercaseRequirement = document.getElementById('uppercaseRequirement');
    const specialRequirement = document.getElementById('specialRequirement');


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

    function setupPasswordToggle(toggleButton, input, icon) {
        if (!toggleButton || !input || !icon) return;

        toggleButton.addEventListener('click', () => {
            const visible = input.type === 'password';
            input.type = visible ? 'text' : 'password';

            toggleButton.setAttribute(
                'aria-label',
                visible ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'
            );

            toggleButton.setAttribute('aria-pressed', String(visible));
            icon.innerHTML = visible ? EYE_CLOSED : EYE_OPEN;
        });
    }

    setupPasswordToggle(passwordToggle, passwordInput, eyeIcon);
    setupPasswordToggle(confirmationToggle, passwordConfirmationInput, confirmationEyeIcon);


    /* =====================================================
       VALIDATION HELPERS
       ===================================================== */

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function getPasswordChecks(password) {
        return {
            length: password.length >= 8,
            number: /\d/.test(password),
            uppercase: /[A-Z]/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };
    }

    function updatePasswordRequirements(password) {
        if (!passwordRequirements) return;

        if (password) {
            passwordRequirements.classList.add('visible');
        } else {
            passwordRequirements.classList.remove('visible');
        }

        const checks = getPasswordChecks(password);

        if (lengthRequirement) {
            lengthRequirement.classList.toggle('valid', checks.length);
        }
        if (numberRequirement) {
            numberRequirement.classList.toggle('valid', checks.number);
        }
        if (uppercaseRequirement) {
            uppercaseRequirement.classList.toggle('valid', checks.uppercase);
        }
        if (specialRequirement) {
            specialRequirement.classList.toggle('valid', checks.special);
        }

        return checks;
    }


    /* =====================================================
       INPUT LISTENERS
       ===================================================== */

    if (nameInput) {
        nameInput.addEventListener('input', () => {
            if (nameInput.value.trim()) {
                nameInput.classList.remove('has-error');
                if (nameError) nameError.classList.remove('visible');
            }
        });
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
            const password = passwordInput.value;

            updatePasswordRequirements(password);

            if (password) {
                passwordInput.classList.remove('has-error');
                if (passwordError) passwordError.classList.remove('visible');
            }

            // إعادة التحقق من التطابق
            if (passwordConfirmationInput && passwordConfirmationInput.value) {
                const matches = password === passwordConfirmationInput.value;

                if (matches) {
                    passwordConfirmationInput.classList.remove('has-error');
                    if (confirmationError) confirmationError.classList.remove('visible');
                }
            }
        });

        passwordInput.addEventListener('focus', () => {
            if (passwordRequirements && passwordInput.value) {
                passwordRequirements.classList.add('visible');
            }
        });
    }

    if (passwordConfirmationInput) {
        passwordConfirmationInput.addEventListener('input', () => {
            if (passwordConfirmationInput.value) {
                passwordConfirmationInput.classList.remove('has-error');
                if (confirmationError) confirmationError.classList.remove('visible');
            }
        });
    }

    if (termsCheckbox) {
        termsCheckbox.addEventListener('change', () => {
            if (termsCheckbox.checked) {
                if (termsError) termsError.classList.remove('visible');
            }
        });
    }


    /* =====================================================
       VALIDATION
       ===================================================== */

    function validateForm() {
        let valid = true;

        // الاسم
        const name = nameInput ? nameInput.value.trim() : '';

        if (!name || name.length < 2) {
            if (nameInput) nameInput.classList.add('has-error');
            if (nameError) nameError.classList.add('visible');
            valid = false;
        }

        // البريد
        const email = emailInput ? sanitizeEmail(emailInput.value) : '';

        if (!email || !isValidEmail(email)) {
            if (emailInput) emailInput.classList.add('has-error');
            if (emailError) emailError.classList.add('visible');
            valid = false;
        }

        // كلمة المرور
        const password = passwordInput ? passwordInput.value : '';
        const checks = getPasswordChecks(password);
        const passwordValid = checks.length && checks.number && checks.uppercase && checks.special;

        if (!passwordValid) {
            if (passwordInput) passwordInput.classList.add('has-error');
            if (passwordError) passwordError.classList.add('visible');
            updatePasswordRequirements(password);
            valid = false;
        }

        // التطابق
        const confirmation = passwordConfirmationInput ? passwordConfirmationInput.value : '';

        if (!confirmation || confirmation !== password) {
            if (passwordConfirmationInput) passwordConfirmationInput.classList.add('has-error');
            if (confirmationError) confirmationError.classList.add('visible');
            valid = false;
        }

        // الشروط
        if (termsCheckbox && !termsCheckbox.checked) {
            if (termsError) termsError.classList.add('visible');
            valid = false;
        }

        return valid;
    }


    /* =====================================================
       REGISTER SUBMIT
       ===================================================== */

    if (registerForm) {
        registerForm.addEventListener('submit', (event) => {
            event.preventDefault();

            if (!validateForm()) {
                const firstError = document.querySelector('.has-error');
                if (firstError) firstError.focus();
                return;
            }

            const name = nameInput.value.trim();
            const email = sanitizeEmail(emailInput.value);
            const now = new Date().toISOString();

            if (registerButton) {
                registerButton.disabled = true;
            }

            if (registerButtonText) {
                registerButtonText.innerHTML = `
                    <span class="button-spinner" aria-hidden="true"></span>
                `;
            }

            // ⚠️ لا ننشئ session — سنترك login.html يفعل ذلك

            // ✅ نحفظ بيانات المستخدم في next_profile
            const existingProfile = readJSON('next_profile') || {};

            const updatedProfile = {
                ...existingProfile,
                name,
                email,
                entry_source: existingProfile.entry_source || 'register',
                entry_at: existingProfile.entry_at || now,
                created_at: existingProfile.created_at || now,
                updated_at: now
            };

            saveJSON('next_profile', updatedProfile);

            // ✅ نضع علامة "just_registered" لصفحة login
            sessionStorage.setItem('just_registered', 'true');

            setTimeout(() => {
                window.location.href = 'login.html';
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