/* =====================================================
   NEXT — MOTION
   Reveal, Stagger, Animations
   ====================================================== */

/**
 * Setup stagger index for groups
 */
function staggerIndex(selector = '.stagger, .journey') {
    document.querySelectorAll(selector).forEach(group => {
        Array.from(group.children).forEach((child, index) => {
            child.style.setProperty('--i', index);
        });
    });
}

/**
 * Initialize reveal UI with IntersectionObserver
 */
function revealUI(selector = '.reveal, .stagger, .reveal-item', options = {}) {
    const elements = document.querySelectorAll(selector);

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
        {
            threshold: options.threshold || 0.08,
            rootMargin: options.rootMargin || '0px 0px -40px 0px'
        }
    );

    elements.forEach(el => observer.observe(el));
}

/**
 * Initialize full motion system
 */
function initMotion() {
    staggerIndex();
    revealUI();
}

/**
 * Animate count from 0 to target
 */
function animateCount(element, from, to, duration, suffix = '') {
    if (!element) return;

    const prefersReduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReduced || duration <= 0) {
        element.textContent = String(to) + suffix;
        return;
    }

    const start = performance.now();
    const diff = to - from;

    function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(1, elapsed / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.round(from + diff * eased);

        element.textContent = value + suffix;

        if (progress < 1) {
            requestAnimationFrame(tick);
        }
    }

    requestAnimationFrame(tick);
}