/* =====================================================
   NEXT — SESSION
   ====================================================== */

const SESSION_KEY = 'next_session';
const PROFILE_KEY = 'next_profile';

const DEFAULT_SESSION_DAYS = 1;
const REMEMBER_SESSION_DAYS = 90;

function isValidSession(session) {
    if (!session) return false;
    if (!session.user_email) return false;
    if (!session.expires_at) return false;

    const expiresAt = new Date(session.expires_at).getTime();
    if (Number.isNaN(expiresAt)) return false;
    if (expiresAt <= Date.now()) return false;

    return true;
}

function clearExpiredSession() {
    const session = readJSON(SESSION_KEY);
    if (session && !isValidSession(session)) {
        removeKey(SESSION_KEY);
    }
}

function createSession(email, remember) {
    const now = new Date();
    const days = remember ? REMEMBER_SESSION_DAYS : DEFAULT_SESSION_DAYS;
    const expiresAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const session = {
        user_email: email,
        logged_in_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        remember: Boolean(remember)
    };

    saveJSON(SESSION_KEY, session);

    const profile = readJSON(PROFILE_KEY) || {};
    profile.email = email;
    profile.updated_at = now.toISOString();
    saveJSON(PROFILE_KEY, profile);

    return session;
}

function ensureSession(options = {}) {
    const session = readJSON(SESSION_KEY);
    const profile = readJSON(PROFILE_KEY) || {};
    const now = new Date().toISOString();

    if (isObject(session) && session.user_email) {
        session.updated_at = now;
        saveJSON(SESSION_KEY, session);
        return;
    }

    if (isObject(profile) && profile.email) {
        saveJSON(SESSION_KEY, {
            user_email: profile.email,
            logged_in_at: now,
            updated_at: now,
            restored: true
        });
        return;
    }

    const defaultName = 'مستخدم NEXT';
    const defaultEmail = 'user@next.app';

    const newProfile = {
        ...profile,
        name: profile.name || defaultName,
        email: profile.email || defaultEmail,
        journey_started: profile.journey_started === true,
        entry_source: profile.entry_source || 'demo',
        entry_at: profile.entry_at || now,
        updated_at: now
    };

    saveJSON(PROFILE_KEY, newProfile);

    saveJSON(SESSION_KEY, {
        user_email: newProfile.email,
        logged_in_at: now,
        updated_at: now,
        is_demo: true
    });
}

function getUser() {
    return readJSON(PROFILE_KEY) || {};
}

function logout() {
    removeKey(SESSION_KEY);
    window.location.href = 'login.html';
}

window.nextLogout = logout;