/* =====================================================
   NEXT — STORAGE HELPERS
   ====================================================== */

function readJSON(key) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
    } catch (error) {
        return null;
    }
}

function saveJSON(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        return false;
    }
}

function removeKey(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        /* ignore */
    }
}

function isObject(value) {
    return (
        value !== null &&
        typeof value === 'object' &&
        !Array.isArray(value)
    );
}

function sanitizeEmail(value) {
    if (typeof value !== 'string') {
        return '';
    }
    return value.trim().toLowerCase().slice(0, 254);
}

function getInitial(name) {
    if (!name || !name.trim()) return 'أ';
    return name.trim().charAt(0).toUpperCase();
}

function formatDate(value, options = {}) {
    if (!value) return options.fallback || '—';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return options.fallback || '—';

    return date.toLocaleDateString('ar', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        ...options
    });
}

function formatShortDate(value) {
    if (!value) return '—';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';

    return date.toLocaleDateString('ar', {
        day: 'numeric',
        month: 'short'
    });
}