/* =====================================================
   NEXT — WELCOME PAGE JS
   welcome.html
   ====================================================== */

(function initWelcome() {

    const startButton = document.getElementById('startButton');
    const buttonText = document.getElementById('buttonText');

    /* =====================================================
       INIT
       ===================================================== */

    (function init() {
        ensureSession();
    })();


    /* =====================================================
       START JOURNEY
       ===================================================== */

    if (startButton) {
        startButton.addEventListener('click', () => {
            startButton.disabled = true;

            if (buttonText) {
                buttonText.innerHTML = `
                    <span class="button-spinner" aria-hidden="true"></span>
                `;
            }

            const profile = readJSON('next_profile') || {};
            const now = new Date().toISOString();

            profile.journey_started = true;
            profile.journey_started_at = now;
            profile.updated_at = now;

            saveJSON('next_profile', profile);

            setTimeout(() => {
                window.location.href = 'goal-selection.html';
            }, 500);
        });
    }

})();