/**
 * Système d'authentification - Construction Mixte
 * Note: Cette authentification est côté client uniquement
 */

// ===== LISTE DES EMAILS AUTORISÉS =====
// Encodée en Base64 pour obscurcir (pas une vraie sécurité)
// Format: email1,email2,email3...
const AUTHORIZED_EMAILS_ENCODED = 'YWRtaW5AZXN1cC5mcixwcm9mQGVzdXAuZnIsdGVzdEBleGFtcGxlLmNvbSxldHVkaWFudEBlc3VwLmZy';

// Durée de session en jours
const SESSION_DURATION_DAYS = 7;

// Clé de stockage
const SESSION_KEY = 'cm_session';

/**
 * Décoder et récupérer les emails autorisés
 */
function getAuthorizedEmails() {
    try {
        const decoded = atob(AUTHORIZED_EMAILS_ENCODED);
        return decoded.split(',').map(e => e.trim().toLowerCase());
    } catch (e) {
        console.error('Erreur décodage');
        return [];
    }
}

/**
 * Valider si un email est autorisé
 */
function validateAccess(email) {
    const normalized = email.trim().toLowerCase();
    const authorizedEmails = getAuthorizedEmails();

    // Vérifier correspondance exacte ou domaine autorisé
    for (const authEmail of authorizedEmails) {
        if (authEmail.startsWith('@')) {
            // C'est un domaine autorisé
            if (normalized.endsWith(authEmail)) {
                return true;
            }
        } else if (normalized === authEmail) {
            return true;
        }
    }

    // Mode permissif: autoriser tout le monde si la liste est vide
    if (authorizedEmails.length === 0) {
        return true;
    }

    return false;
}

/**
 * Sauvegarder la session
 */
function saveSession(nom, prenom, email) {
    const session = {
        nom: nom,
        prenom: prenom,
        email: email.toLowerCase(),
        timestamp: Date.now(),
        expires: Date.now() + (SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000)
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

/**
 * Récupérer la session actuelle
 */
function getSession() {
    try {
        const data = localStorage.getItem(SESSION_KEY);
        if (!data) return null;

        const session = JSON.parse(data);

        // Vérifier expiration
        if (Date.now() > session.expires) {
            localStorage.removeItem(SESSION_KEY);
            return null;
        }

        return session;
    } catch (e) {
        return null;
    }
}

/**
 * Vérifier si l'utilisateur est authentifié
 */
function isAuthenticated() {
    return getSession() !== null;
}

/**
 * Déconnexion
 */
function logout() {
    localStorage.removeItem(SESSION_KEY);
    window.location.href = 'index.html';
}

/**
 * Protéger une page (rediriger si non authentifié)
 */
function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = getBasePath() + 'index.html';
        return false;
    }
    return true;
}

/**
 * Obtenir le chemin de base selon la profondeur
 */
function getBasePath() {
    const path = window.location.pathname;
    const depth = (path.match(/\//g) || []).length - 1;

    if (path.includes('/cours/poutres/') || path.includes('/cours/planchers/')) {
        return '../../';
    } else if (path.includes('/cours/')) {
        return '../';
    }
    return '';
}

/**
 * Obtenir le watermark avec les infos utilisateur
 */
function getWatermarkText() {
    const session = getSession();
    if (!session) return '';
    return `${session.prenom} ${session.nom} - ${session.email}`;
}
