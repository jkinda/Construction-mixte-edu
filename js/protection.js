/**
 * Protections anti-copie et anti-duplication
 * Note: Ces protections peuvent être contournées par un utilisateur technique
 */

(function () {
    'use strict';

    // ===== DÉSACTIVATION CLIC DROIT =====
    document.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        showProtectionMessage();
        return false;
    });

    // ===== DÉSACTIVATION RACCOURCIS CLAVIER =====
    document.addEventListener('keydown', function (e) {
        // Ctrl+S (Save)
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            showProtectionMessage();
            return false;
        }
        // Ctrl+U (View Source)
        if (e.ctrlKey && e.key === 'u') {
            e.preventDefault();
            showProtectionMessage();
            return false;
        }
        // Ctrl+P (Print)
        if (e.ctrlKey && e.key === 'p') {
            e.preventDefault();
            showProtectionMessage();
            return false;
        }
        // Ctrl+Shift+I (DevTools)
        if (e.ctrlKey && e.shiftKey && e.key === 'I') {
            e.preventDefault();
            return false;
        }
        // Ctrl+Shift+J (Console)
        if (e.ctrlKey && e.shiftKey && e.key === 'J') {
            e.preventDefault();
            return false;
        }
        // Ctrl+Shift+C (Inspect Element)
        if (e.ctrlKey && e.shiftKey && e.key === 'C') {
            e.preventDefault();
            return false;
        }
        // F12 (DevTools)
        if (e.key === 'F12') {
            e.preventDefault();
            return false;
        }
        // Ctrl+A (Select All)
        if (e.ctrlKey && e.key === 'a') {
            e.preventDefault();
            return false;
        }
        // Ctrl+C (Copy) - sauf dans les inputs
        if (e.ctrlKey && e.key === 'c' && !isInputElement(e.target)) {
            e.preventDefault();
            return false;
        }
    });

    // ===== DÉSACTIVATION SÉLECTION TEXTE =====
    document.addEventListener('selectstart', function (e) {
        if (!isInputElement(e.target)) {
            e.preventDefault();
            return false;
        }
    });

    // ===== DÉSACTIVATION DRAG =====
    document.addEventListener('dragstart', function (e) {
        e.preventDefault();
        return false;
    });

    // ===== CSS ANTI-SÉLECTION =====
    const style = document.createElement('style');
    style.textContent = `
        body {
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
        }
        input, textarea, select {
            -webkit-user-select: text;
            -moz-user-select: text;
            -ms-user-select: text;
            user-select: text;
        }
    `;
    document.head.appendChild(style);

    // ===== WATERMARK DYNAMIQUE =====
    function createWatermark() {
        if (typeof getWatermarkText !== 'function') return;

        const text = getWatermarkText();
        if (!text) return;

        const watermark = document.createElement('div');
        watermark.id = 'cm-watermark';
        watermark.style.cssText = `
            position: fixed;
            bottom: 10px;
            right: 10px;
            background: rgba(45, 90, 138, 0.1);
            color: rgba(45, 90, 138, 0.5);
            padding: 5px 10px;
            border-radius: 5px;
            font-size: 11px;
            font-family: 'Inter', sans-serif;
            pointer-events: none;
            z-index: 9999;
        `;
        watermark.textContent = text;
        document.body.appendChild(watermark);
    }

    // ===== MESSAGE DE PROTECTION =====
    function showProtectionMessage() {
        // Créer notification
        let notification = document.getElementById('protection-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'protection-notification';
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: linear-gradient(135deg, #c00, #900);
                color: white;
                padding: 15px 30px;
                border-radius: 10px;
                font-family: 'Inter', sans-serif;
                font-size: 14px;
                font-weight: 500;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                z-index: 10000;
                opacity: 0;
                transition: opacity 0.3s;
            `;
            document.body.appendChild(notification);
        }

        notification.textContent = '🔒 Contenu protégé - Action non autorisée';
        notification.style.opacity = '1';

        setTimeout(() => {
            notification.style.opacity = '0';
        }, 2000);
    }

    // ===== UTILITAIRES =====
    function isInputElement(element) {
        const tagName = element.tagName.toLowerCase();
        return tagName === 'input' || tagName === 'textarea' || tagName === 'select';
    }

    // ===== INITIALISATION =====
    document.addEventListener('DOMContentLoaded', function () {
        createWatermark();
    });

    // ===== DÉTECTION DEVTOOLS (optionnel) =====
    // Cette détection peut causer des faux positifs
    /*
    let devtools = { open: false };
    const threshold = 160;
    
    setInterval(function() {
        if (window.outerHeight - window.innerHeight > threshold || 
            window.outerWidth - window.innerWidth > threshold) {
            if (!devtools.open) {
                devtools.open = true;
                console.clear();
            }
        } else {
            devtools.open = false;
        }
    }, 500);
    */

})();
