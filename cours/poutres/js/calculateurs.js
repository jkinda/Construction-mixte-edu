/**
 * Poutres Mixtes - Calculateurs Interactifs
 * Dimensionnement selon Eurocode 4
 */

// ============================================
// DONNÉES DE RÉFÉRENCE
// ============================================

const MATERIAUX = {
    aciers: {
        'S235': { fy: 235, fu: 360 },
        'S275': { fy: 275, fu: 430 },
        'S355': { fy: 355, fu: 510 },
        'S460': { fy: 460, fu: 540 }
    },
    betons: {
        'C20/25': { fck: 20, fcm: 28, fctm: 2.2, Ecm: 30000 },
        'C25/30': { fck: 25, fcm: 33, fctm: 2.6, Ecm: 31500 },
        'C30/37': { fck: 30, fcm: 38, fctm: 2.9, Ecm: 33000 },
        'C35/45': { fck: 35, fcm: 43, fctm: 3.2, Ecm: 34000 },
        'C40/50': { fck: 40, fcm: 48, fctm: 3.5, Ecm: 35000 },
        'C50/60': { fck: 50, fcm: 58, fctm: 4.1, Ecm: 37000 }
    },
    profils: {
        'IPE 200': { Aa: 28.5, ha: 200, bf: 100, tf: 8.5, tw: 5.6, Iy: 1943, Wply: 221 },
        'IPE 240': { Aa: 39.1, ha: 240, bf: 120, tf: 9.8, tw: 6.2, Iy: 3892, Wply: 367 },
        'IPE 270': { Aa: 45.9, ha: 270, bf: 135, tf: 10.2, tw: 6.6, Iy: 5790, Wply: 484 },
        'IPE 300': { Aa: 53.8, ha: 300, bf: 150, tf: 10.7, tw: 7.1, Iy: 8356, Wply: 628 },
        'IPE 330': { Aa: 62.6, ha: 330, bf: 160, tf: 11.5, tw: 7.5, Iy: 11770, Wply: 804 },
        'IPE 360': { Aa: 72.7, ha: 360, bf: 170, tf: 12.7, tw: 8.0, Iy: 16270, Wply: 1019 },
        'IPE 400': { Aa: 84.5, ha: 400, bf: 180, tf: 13.5, tw: 8.6, Iy: 23130, Wply: 1307 },
        'IPE 450': { Aa: 98.8, ha: 450, bf: 190, tf: 14.6, tw: 9.4, Iy: 33740, Wply: 1702 },
        'IPE 500': { Aa: 116, ha: 500, bf: 200, tf: 16.0, tw: 10.2, Iy: 48200, Wply: 2194 },
        'IPE 550': { Aa: 134, ha: 550, bf: 210, tf: 17.2, tw: 11.1, Iy: 67120, Wply: 2787 },
        'IPE 600': { Aa: 156, ha: 600, bf: 220, tf: 19.0, tw: 12.0, Iy: 92080, Wply: 3512 },
        'HEA 200': { Aa: 53.8, ha: 190, bf: 200, tf: 10, tw: 6.5, Iy: 3692, Wply: 429 },
        'HEA 240': { Aa: 76.8, ha: 230, bf: 240, tf: 12, tw: 7.5, Iy: 7763, Wply: 745 },
        'HEA 300': { Aa: 112, ha: 290, bf: 300, tf: 14, tw: 8.5, Iy: 18260, Wply: 1383 },
        'HEB 200': { Aa: 78.1, ha: 200, bf: 200, tf: 15, tw: 9, Iy: 5696, Wply: 642 },
        'HEB 240': { Aa: 106, ha: 240, bf: 240, tf: 17, tw: 10, Iy: 11260, Wply: 1053 },
        'HEB 300': { Aa: 149, ha: 300, bf: 300, tf: 19, tw: 11, Iy: 25170, Wply: 1869 }
    }
};

const COEFFICIENTS = {
    gammaM0: 1.00,    // Acier - résistance
    gammaM1: 1.00,    // Acier - instabilité
    gammaC: 1.50,     // Béton
    gammaV: 1.25,     // Connecteurs
    alphaCC: 1.00,    // Coefficient béton
    Ea: 210000        // Module acier (MPa)
};

// ============================================
// FONCTIONS DE CALCUL
// ============================================

/**
 * Calcule la largeur participante de la dalle
 */
function calculerLargeurParticipante(portee, entraxe, typeAppui = 'simple') {
    let Le;
    switch(typeAppui) {
        case 'rive':
            Le = 0.85 * portee;
            break;
        case 'intermediaire':
            Le = 0.70 * portee;
            break;
        default:
            Le = portee;
    }
    
    const bei = Math.min(Le / 8, entraxe / 2);
    const beff = 2 * bei;
    
    return {
        Le: Le,
        bei: bei,
        beff: Math.min(beff, entraxe),
        limite: entraxe
    };
}

/**
 * Calcule le coefficient d'équivalence acier-béton
 */
function calculerCoefficientEquivalence(classesBeton, fluage = 0, psiL = 1.1) {
    const beton = MATERIAUX.betons[classesBeton];
    const n0 = COEFFICIENTS.Ea / beton.Ecm;
    const nL = n0 * (1 + psiL * fluage);
    
    return {
        n0: n0,
        nL: nL,
        Ecm: beton.Ecm
    };
}

/**
 * Calcule les forces plastiques dans la section
 */
function calculerForcesPlastiques(profil, acier, beton, beff, hc) {
    const profilData = MATERIAUX.profils[profil];
    const acierData = MATERIAUX.aciers[acier];
    const betonData = MATERIAUX.betons[beton];
    
    const fyd = acierData.fy / COEFFICIENTS.gammaM0;
    const fcd = COEFFICIENTS.alphaCC * betonData.fck / COEFFICIENTS.gammaC;
    
    // Force plastique acier (kN)
    const Napl = (profilData.Aa * 1e-4) * (fyd * 1e3);
    
    // Force de compression béton (kN)
    const Ncf = 0.85 * fcd * beff * hc * 1e-3;
    
    return {
        Napl: Napl,
        Ncf: Ncf,
        fyd: fyd,
        fcd: fcd,
        Aa: profilData.Aa
    };
}

/**
 * Calcule le moment résistant plastique
 */
function calculerMomentResistant(profil, acier, beton, beff, hc, hp = 0) {
    const profilData = MATERIAUX.profils[profil];
    const forces = calculerForcesPlastiques(profil, acier, beton, beff, hc);
    
    let result = {
        Napl: forces.Napl,
        Ncf: forces.Ncf,
        positionANP: '',
        zpl: 0,
        brasLevier: 0,
        MplRd: 0
    };
    
    if (forces.Ncf >= forces.Napl) {
        // ANP dans la dalle
        result.positionANP = 'dalle';
        result.zpl = forces.Napl / (0.85 * forces.fcd * beff) * 1000; // mm
        
        // Bras de levier
        const d = profilData.ha / 2 + hc + hp - result.zpl / 2;
        result.brasLevier = d;
        
        // Moment résistant (kN.m)
        result.MplRd = forces.Napl * d / 1000;
    } else {
        // ANP dans le profilé
        result.positionANP = 'profilé';
        
        // Vérifier si dans semelle ou âme
        const deltaF = forces.Napl - forces.Ncf;
        const Nf = 2 * profilData.bf * profilData.tf * forces.fyd * 1e-3; // Force semelle
        
        if (deltaF <= Nf) {
            // ANP dans la semelle supérieure
            result.positionANP = 'semelle supérieure';
            result.zpl = deltaF / (2 * profilData.bf * forces.fyd * 1e-3);
            
            // Moment acier seul
            const MaplRd = profilData.Wply * forces.fyd * 1e-3; // kN.m
            
            // Distance centre dalle - centre profilé
            const d1 = profilData.ha / 2 + hp + hc / 2;
            
            // Moment résistant
            result.MplRd = MaplRd + forces.Ncf * d1 / 1000 - 
                           Math.pow(deltaF / 2, 2) / (2 * profilData.bf * forces.fyd * 1e-3) / 1000;
        } else {
            // ANP dans l'âme
            result.positionANP = 'âme';
            const deltaW = deltaF - Nf;
            result.zpl = profilData.tf + deltaW / (2 * profilData.tw * forces.fyd * 1e-3);
            
            // Calcul simplifié
            const MaplRd = profilData.Wply * forces.fyd * 1e-3;
            const d1 = profilData.ha / 2 + hp + hc / 2;
            result.MplRd = MaplRd + forces.Ncf * d1 / 1000;
        }
        
        result.brasLevier = result.MplRd * 1000 / forces.Napl;
    }
    
    return result;
}

/**
 * Calcule la résistance d'un goujon
 */
function calculerResistanceGoujon(diametre, hauteur, fu, beton) {
    const betonData = MATERIAUX.betons[beton];
    const d = diametre;
    const hsc = hauteur;
    
    // Coefficient alpha
    let alpha;
    const ratio = hsc / d;
    if (ratio >= 4) {
        alpha = 1.0;
    } else if (ratio >= 3) {
        alpha = 0.2 * (ratio + 1);
    } else {
        alpha = 0.8; // minimum
    }
    
    // Résistance acier (kN)
    const PRd1 = (0.8 * fu * Math.PI * Math.pow(d, 2) / 4) / (COEFFICIENTS.gammaV * 1000);
    
    // Résistance béton (kN)
    const PRd2 = (0.29 * alpha * Math.pow(d, 2) * Math.sqrt(betonData.fck * betonData.Ecm)) / 
                 (COEFFICIENTS.gammaV * 1000);
    
    return {
        PRd1: PRd1,
        PRd2: PRd2,
        PRd: Math.min(PRd1, PRd2),
        alpha: alpha,
        modeRupture: PRd1 < PRd2 ? 'acier' : 'béton'
    };
}

/**
 * Calcule le nombre de goujons requis
 */
function calculerNombreGoujons(Vl, PRd, connexionPartielle = false, eta = 1.0) {
    let n;
    if (connexionPartielle) {
        n = Math.ceil((eta * Vl) / PRd);
    } else {
        n = Math.ceil(Vl / PRd);
    }
    
    return {
        n: n,
        nTotal: 2 * n, // Pour toute la poutre
        entraxeMax: 800 // mm, selon EC4
    };
}

/**
 * Calcule les caractéristiques de la section mixte homogénéisée
 */
function calculerSectionMixte(profil, beton, beff, hc, hp = 0) {
    const profilData = MATERIAUX.profils[profil];
    const coefEq = calculerCoefficientEquivalence(beton);
    const n = coefEq.n0;
    
    // Aires
    const Aa = profilData.Aa; // cm²
    const Aceq = (beff * hc) / (n * 100); // cm²
    const Atot = Aa + Aceq;
    
    // Positions des centres de gravité (depuis base profilé)
    const ya = profilData.ha / 2; // mm
    const yc = profilData.ha + hp + hc / 2; // mm
    
    // Position CG section mixte
    const yG = (Aa * ya + Aceq * yc) / Atot;
    
    // Moment d'inertie mixte (cm⁴)
    const Ia = profilData.Iy;
    const Ic = (beff * Math.pow(hc, 3)) / (12 * n) / 10000; // conversion mm⁴ -> cm⁴
    
    const Ieq = Ia + Aa * Math.pow((yG - ya) / 10, 2) +
                Ic + Aceq * Math.pow((yc - yG) / 10, 2);
    
    return {
        n: n,
        Aa: Aa,
        Aceq: Aceq,
        Atot: Atot,
        yG: yG,
        Ieq: Ieq,
        ya: ya,
        yc: yc
    };
}

/**
 * Calcule la flèche d'une poutre uniformément chargée
 */
function calculerFleche(q, L, Ieq, fluage = 0) {
    // Flèche instantanée (mm)
    const delta_inst = (5 * q * Math.pow(L, 4)) / (384 * COEFFICIENTS.Ea * Ieq * 1e4);
    
    // Flèche avec fluage (approximation)
    const delta_fluage = delta_inst * (1 + 0.5 * fluage);
    
    return {
        instantanee: delta_inst,
        avecFluage: delta_fluage,
        limite_L250: L / 250,
        limite_L300: L / 300,
        limite_L350: L / 350
    };
}

/**
 * Calcule l'effort tranchant résistant
 */
function calculerEffortTranchant(profil, acier) {
    const profilData = MATERIAUX.profils[profil];
    const acierData = MATERIAUX.aciers[acier];
    const fyd = acierData.fy / COEFFICIENTS.gammaM0;
    
    // Aire de cisaillement (simplifiée)
    const hw = profilData.ha - 2 * profilData.tf;
    const Av = hw * profilData.tw; // mm²
    
    // Résistance plastique (kN)
    const VplRd = (Av * fyd / Math.sqrt(3)) / 1000;
    
    return {
        Av: Av,
        VplRd: VplRd,
        hw: hw
    };
}

// ============================================
// INTERFACE UTILISATEUR
// ============================================

/**
 * Initialise les sélecteurs de matériaux
 */
function initMateriauxSelectors() {
    // Remplir les sélecteurs de profilés
    const profilSelects = document.querySelectorAll('.profil-select');
    profilSelects.forEach(select => {
        for (const profil in MATERIAUX.profils) {
            const option = document.createElement('option');
            option.value = profil;
            option.textContent = profil;
            if (profil === 'IPE 360') option.selected = true;
            select.appendChild(option);
        }
    });
    
    // Remplir les sélecteurs d'acier
    const acierSelects = document.querySelectorAll('.acier-select');
    acierSelects.forEach(select => {
        for (const acier in MATERIAUX.aciers) {
            const option = document.createElement('option');
            option.value = acier;
            option.textContent = `${acier} (fy = ${MATERIAUX.aciers[acier].fy} MPa)`;
            if (acier === 'S355') option.selected = true;
            select.appendChild(option);
        }
    });
    
    // Remplir les sélecteurs de béton
    const betonSelects = document.querySelectorAll('.beton-select');
    betonSelects.forEach(select => {
        for (const beton in MATERIAUX.betons) {
            const option = document.createElement('option');
            option.value = beton;
            option.textContent = `${beton} (fck = ${MATERIAUX.betons[beton].fck} MPa)`;
            if (beton === 'C30/37') option.selected = true;
            select.appendChild(option);
        }
    });
}

/**
 * Formate un nombre pour l'affichage
 */
function formatNumber(value, decimals = 2) {
    return value.toFixed(decimals).replace('.', ',');
}

/**
 * Affiche les résultats du moment résistant
 */
function afficherResultatsMoment(result) {
    const container = document.getElementById('results-moment');
    if (!container) return;
    
    const verification = result.MplRd > 0;
    
    container.innerHTML = `
        <h4>📊 Résultats du calcul</h4>
        <div class="result-item">
            <span class="result-label">Force plastique acier N<sub>a,pl</sub></span>
            <span class="result-value">${formatNumber(result.Napl)} kN</span>
        </div>
        <div class="result-item">
            <span class="result-label">Force de compression béton N<sub>c,f</sub></span>
            <span class="result-value">${formatNumber(result.Ncf)} kN</span>
        </div>
        <div class="result-item">
            <span class="result-label">Position de l'ANP</span>
            <span class="result-value">${result.positionANP}</span>
        </div>
        <div class="result-item">
            <span class="result-label">Hauteur comprimée z<sub>pl</sub></span>
            <span class="result-value">${formatNumber(result.zpl)} mm</span>
        </div>
        <div class="result-item">
            <span class="result-label">Bras de levier d</span>
            <span class="result-value">${formatNumber(result.brasLevier)} mm</span>
        </div>
        <div class="result-item" style="border-top: 2px solid rgba(255,255,255,0.3); padding-top: 1rem;">
            <span class="result-label" style="font-size: 1.125rem;">Moment résistant M<sub>pl,Rd</sub></span>
            <span class="result-value" style="font-size: 1.5rem; color: #f39c12;">${formatNumber(result.MplRd)} kN.m</span>
        </div>
    `;
    container.style.display = 'block';
}

/**
 * Affiche les résultats des goujons
 */
function afficherResultatsGoujons(goujon, nbGoujons, Vl) {
    const container = document.getElementById('results-goujons');
    if (!container) return;
    
    container.innerHTML = `
        <h4>📊 Résultats du calcul</h4>
        <div class="result-item">
            <span class="result-label">Coefficient α</span>
            <span class="result-value">${formatNumber(goujon.alpha)}</span>
        </div>
        <div class="result-item">
            <span class="result-label">Résistance (rupture acier) P<sub>Rd,1</sub></span>
            <span class="result-value">${formatNumber(goujon.PRd1)} kN</span>
        </div>
        <div class="result-item">
            <span class="result-label">Résistance (écrasement béton) P<sub>Rd,2</sub></span>
            <span class="result-value">${formatNumber(goujon.PRd2)} kN</span>
        </div>
        <div class="result-item">
            <span class="result-label">Mode de rupture dimensionnant</span>
            <span class="result-value">${goujon.modeRupture}</span>
        </div>
        <div class="result-item" style="border-top: 2px solid rgba(255,255,255,0.3); padding-top: 1rem;">
            <span class="result-label" style="font-size: 1.125rem;">Résistance P<sub>Rd</sub></span>
            <span class="result-value" style="font-size: 1.25rem; color: #f39c12;">${formatNumber(goujon.PRd)} kN</span>
        </div>
        <div class="result-item">
            <span class="result-label">Effort à transférer V<sub>l</sub></span>
            <span class="result-value">${formatNumber(Vl)} kN</span>
        </div>
        <div class="result-item">
            <span class="result-label">Nombre par demi-travée</span>
            <span class="result-value" style="font-size: 1.25rem;">${nbGoujons.n}</span>
        </div>
        <div class="result-item">
            <span class="result-label" style="font-size: 1.125rem;">Nombre total sur la poutre</span>
            <span class="result-value" style="font-size: 1.5rem; color: #f39c12;">${nbGoujons.nTotal}</span>
        </div>
    `;
    container.style.display = 'block';
}

/**
 * Affiche les résultats de flèche
 */
function afficherResultatsFleche(result, L) {
    const container = document.getElementById('results-fleche');
    if (!container) return;
    
    const okInst = result.instantanee <= result.limite_L350;
    const okTotal = result.avecFluage <= result.limite_L250;
    
    container.innerHTML = `
        <h4>📊 Résultats du calcul</h4>
        <div class="result-item">
            <span class="result-label">Flèche instantanée</span>
            <span class="result-value ${okInst ? 'success' : 'error'}">${formatNumber(result.instantanee)} mm</span>
        </div>
        <div class="result-item">
            <span class="result-label">Limite L/350</span>
            <span class="result-value">${formatNumber(result.limite_L350)} mm</span>
        </div>
        <div class="result-item">
            <span class="result-label">Vérification instantanée</span>
            <span class="verification-badge ${okInst ? 'ok' : 'fail'}">${okInst ? '✓ OK' : '✗ Non vérifié'}</span>
        </div>
        <div class="result-item" style="border-top: 2px solid rgba(255,255,255,0.3); padding-top: 1rem;">
            <span class="result-label">Flèche avec fluage</span>
            <span class="result-value ${okTotal ? 'success' : 'error'}">${formatNumber(result.avecFluage)} mm</span>
        </div>
        <div class="result-item">
            <span class="result-label">Limite L/250</span>
            <span class="result-value">${formatNumber(result.limite_L250)} mm</span>
        </div>
        <div class="result-item">
            <span class="result-label">Vérification globale</span>
            <span class="verification-badge ${okTotal ? 'ok' : 'fail'}">${okTotal ? '✓ OK' : '✗ Non vérifié'}</span>
        </div>
    `;
    container.style.display = 'block';
}

// ============================================
// GESTIONNAIRES D'ÉVÉNEMENTS
// ============================================

function handleCalculMoment() {
    const profil = document.getElementById('profil-moment').value;
    const acier = document.getElementById('acier-moment').value;
    const beton = document.getElementById('beton-moment').value;
    const beff = parseFloat(document.getElementById('beff-moment').value);
    const hc = parseFloat(document.getElementById('hc-moment').value);
    const hp = parseFloat(document.getElementById('hp-moment').value) || 0;
    
    if (!profil || !acier || !beton || isNaN(beff) || isNaN(hc)) {
        alert('Veuillez remplir tous les champs obligatoires.');
        return;
    }
    
    const result = calculerMomentResistant(profil, acier, beton, beff, hc, hp);
    afficherResultatsMoment(result);
}

function handleCalculGoujons() {
    const diametre = parseFloat(document.getElementById('diametre-goujon').value);
    const hauteur = parseFloat(document.getElementById('hauteur-goujon').value);
    const fu = parseFloat(document.getElementById('fu-goujon').value);
    const beton = document.getElementById('beton-goujon').value;
    const Vl = parseFloat(document.getElementById('vl-goujon').value);
    
    if (isNaN(diametre) || isNaN(hauteur) || isNaN(fu) || !beton || isNaN(Vl)) {
        alert('Veuillez remplir tous les champs.');
        return;
    }
    
    const goujon = calculerResistanceGoujon(diametre, hauteur, fu, beton);
    const nbGoujons = calculerNombreGoujons(Vl, goujon.PRd);
    afficherResultatsGoujons(goujon, nbGoujons, Vl);
}

function handleCalculFleche() {
    const profil = document.getElementById('profil-fleche').value;
    const beton = document.getElementById('beton-fleche').value;
    const beff = parseFloat(document.getElementById('beff-fleche').value);
    const hc = parseFloat(document.getElementById('hc-fleche').value);
    const hp = parseFloat(document.getElementById('hp-fleche').value) || 0;
    const L = parseFloat(document.getElementById('portee-fleche').value);
    const q = parseFloat(document.getElementById('charge-fleche').value);
    const fluage = parseFloat(document.getElementById('fluage-fleche').value) || 0;
    
    if (!profil || !beton || isNaN(beff) || isNaN(hc) || isNaN(L) || isNaN(q)) {
        alert('Veuillez remplir tous les champs obligatoires.');
        return;
    }
    
    const section = calculerSectionMixte(profil, beton, beff, hc, hp);
    const result = calculerFleche(q, L, section.Ieq, fluage);
    afficherResultatsFleche(result, L);
}

// ============================================
// INITIALISATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialiser les sélecteurs
    initMateriauxSelectors();
    
    // Attacher les gestionnaires de calcul
    const btnMoment = document.getElementById('btn-calc-moment');
    if (btnMoment) btnMoment.addEventListener('click', handleCalculMoment);
    
    const btnGoujons = document.getElementById('btn-calc-goujons');
    if (btnGoujons) btnGoujons.addEventListener('click', handleCalculGoujons);
    
    const btnFleche = document.getElementById('btn-calc-fleche');
    if (btnFleche) btnFleche.addEventListener('click', handleCalculFleche);
    
    // Toggle solutions exercices
    document.querySelectorAll('.solution-toggle').forEach(btn => {
        btn.addEventListener('click', function() {
            const solution = this.nextElementSibling;
            solution.classList.toggle('active');
            this.textContent = solution.classList.contains('active') ? 
                'Masquer la solution' : 'Voir la solution';
        });
    });
});

// Export pour utilisation dans d'autres scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        calculerLargeurParticipante,
        calculerCoefficientEquivalence,
        calculerMomentResistant,
        calculerResistanceGoujon,
        calculerNombreGoujons,
        calculerSectionMixte,
        calculerFleche,
        calculerEffortTranchant,
        MATERIAUX,
        COEFFICIENTS
    };
}
