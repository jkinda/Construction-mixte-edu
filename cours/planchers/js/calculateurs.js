/**
 * Calculateurs interactifs pour planchers mixtes
 * Selon Eurocode 4 (EN 1994-1-1)
 */

// ===== DONNÉES DE RÉFÉRENCE =====

const BACS_ACIER = {
    'cofraplus60_075': {
        nom: 'Cofraplus 60 (0.75mm)',
        hp: 60,      // mm - hauteur nervure
        br: 207,     // mm - entraxe nervures
        b0: 62,      // mm - largeur fond nervure
        Ap: 1095,    // mm²/m - section acier
        Ip: 4.5e5,   // mm⁴/m - inertie
        Weff: 21000, // mm³/m - module effectif
        Mpa: 6.7,    // kN.m/m - moment résistant
        poids: 9.8   // kg/m²
    },
    'cofraplus60_088': {
        nom: 'Cofraplus 60 (0.88mm)',
        hp: 60,
        br: 207,
        b0: 62,
        Ap: 1284,
        Ip: 5.3e5,
        Weff: 26000,
        Mpa: 8.5,
        poids: 11.5
    },
    'cofraplus60_100': {
        nom: 'Cofraplus 60 (1.00mm)',
        hp: 60,
        br: 207,
        b0: 62,
        Ap: 1460,
        Ip: 6.1e5,
        Weff: 30000,
        Mpa: 10.2,
        poids: 13.0
    },
    'cofrastra70_088': {
        nom: 'Cofrastra 70 (0.88mm)',
        hp: 73,
        br: 150,
        b0: 92,
        Ap: 1350,
        Ip: 7.2e5,
        Weff: 33000,
        Mpa: 10.9,
        poids: 11.9
    }
};

const BETONS = {
    'C20': { fck: 20, fcd: 13.3, Ecm: 30000, fctm: 2.2 },
    'C25': { fck: 25, fcd: 16.7, Ecm: 31500, fctm: 2.6 },
    'C30': { fck: 30, fcd: 20.0, Ecm: 33000, fctm: 2.9 },
    'C35': { fck: 35, fcd: 23.3, Ecm: 34000, fctm: 3.2 },
    'C40': { fck: 40, fcd: 26.7, Ecm: 35000, fctm: 3.5 }
};

const ACIER_BAC = {
    fyp: 320,  // MPa - limite élastique
    Ea: 210000 // MPa - module élasticité
};

// ===== CALCULATEUR 1: PHASE CONSTRUCTION =====

function calculerPhaseConstruction() {
    // Récupération des entrées
    const bacType = document.getElementById('bac-type').value;
    const portee = parseFloat(document.getElementById('portee-tole').value) || 0;
    const hc = parseFloat(document.getElementById('hc-construction').value) || 0;
    const qChantier = parseFloat(document.getElementById('q-chantier').value) || 1.5;

    if (!bacType || portee <= 0 || hc <= 0) {
        alert('Veuillez remplir tous les champs correctement.');
        return;
    }

    const bac = BACS_ACIER[bacType];
    const ht = bac.hp + hc; // Épaisseur totale

    // Charges
    const gBac = bac.poids / 100; // kN/m²
    const gBeton = 25 * ht / 1000; // kN/m²
    const gTotal = gBac + gBeton;

    // Combinaison ELU
    const pELU = 1.35 * gTotal + 1.5 * qChantier;

    // Moment sollicitant (sur 1m de largeur)
    const L = portee / 1000; // en m
    const MEd = pELU * L * L / 8;

    // Résistance
    const MRd = bac.Mpa;

    // Taux de travail
    const taux = MEd / MRd;
    const ok = taux <= 1.0;

    // Flèche ELS
    const qELS = gTotal; // Béton frais + bac
    const delta = 5 * qELS * Math.pow(L * 1000, 4) / (384 * ACIER_BAC.Ea * bac.Ip);
    const deltaLim = Math.min(L * 1000 / 180, L * 1000 / 150 + 10);
    const deltaOk = delta <= deltaLim;

    // Affichage des résultats
    document.getElementById('result-g-total').textContent = gTotal.toFixed(2) + ' kN/m²';
    document.getElementById('result-p-elu').textContent = pELU.toFixed(2) + ' kN/m²';
    document.getElementById('result-m-ed-const').textContent = MEd.toFixed(2) + ' kN.m/m';
    document.getElementById('result-m-rd-const').textContent = MRd.toFixed(2) + ' kN.m/m';
    document.getElementById('result-taux-const').textContent = (taux * 100).toFixed(1) + '%';
    document.getElementById('result-delta-const').textContent = delta.toFixed(1) + ' mm';
    document.getElementById('result-delta-lim-const').textContent = deltaLim.toFixed(1) + ' mm';

    // Badge de vérification
    const badge = document.getElementById('verif-construction');
    if (ok && deltaOk) {
        badge.className = 'verification-badge ok';
        badge.innerHTML = '✓ Vérifié';
    } else if (!ok) {
        badge.className = 'verification-badge fail';
        badge.innerHTML = '✗ Étaiement requis';
    } else {
        badge.className = 'verification-badge fail';
        badge.innerHTML = '✗ Flèche excessive';
    }

    document.getElementById('results-construction').style.display = 'block';
}

// ===== CALCULATEUR 2: MOMENT RÉSISTANT MIXTE =====

function calculerMomentMixte() {
    const bacType = document.getElementById('bac-type-mixte').value;
    const betonClass = document.getElementById('beton-classe').value;
    const hc = parseFloat(document.getElementById('hc-mixte').value) || 0;
    const MEd = parseFloat(document.getElementById('m-ed-mixte').value) || 0;

    if (!bacType || !betonClass || hc <= 0) {
        alert('Veuillez remplir tous les champs correctement.');
        return;
    }

    const bac = BACS_ACIER[bacType];
    const beton = BETONS[betonClass];
    const ht = bac.hp + hc;
    const b = 1000; // largeur de calcul en mm

    // Force de traction dans le bac
    const Npa = bac.Ap * ACIER_BAC.fyp / 1000; // kN/m

    // Force de compression max dans le béton
    const Ncf = 0.85 * beton.fcd * b * hc / 1000; // kN/m

    // Position de l'ANP
    let xpl, z, MplRd;
    let anpDans = '';

    if (Ncf >= Npa) {
        // ANP dans le béton
        anpDans = 'béton';
        xpl = Npa * 1000 / (0.85 * beton.fcd * b);
        const ep = 30; // distance CG bac à fibre inf (approximation)
        z = ht - xpl / 2 - ep;
        MplRd = Npa * z / 1000;
    } else {
        // ANP dans le bac (calcul simplifié)
        anpDans = 'bac acier';
        z = ht - hc / 2 - 30;
        MplRd = Ncf * z / 1000;
    }

    // Taux de travail
    const taux = MEd > 0 ? MEd / MplRd : 0;
    const ok = taux <= 1.0;

    // Affichage
    document.getElementById('result-npa').textContent = Npa.toFixed(1) + ' kN/m';
    document.getElementById('result-ncf').textContent = Ncf.toFixed(1) + ' kN/m';
    document.getElementById('result-anp').textContent = anpDans + ' (' + xpl.toFixed(1) + ' mm)';
    document.getElementById('result-z').textContent = z.toFixed(1) + ' mm';
    document.getElementById('result-mpl-rd').textContent = MplRd.toFixed(1) + ' kN.m/m';
    document.getElementById('result-taux-mixte').textContent = (taux * 100).toFixed(1) + '%';

    const badge = document.getElementById('verif-moment');
    if (MEd > 0) {
        badge.className = ok ? 'verification-badge ok' : 'verification-badge fail';
        badge.innerHTML = ok ? '✓ Vérifié' : '✗ Non vérifié';
    } else {
        badge.className = 'verification-badge ok';
        badge.innerHTML = '—';
    }

    document.getElementById('results-moment').style.display = 'block';
}

// ===== CALCULATEUR 3: CISAILLEMENT =====

function calculerCisaillement() {
    const bacType = document.getElementById('bac-type-cis').value;
    const betonClass = document.getElementById('beton-classe-cis').value;
    const hc = parseFloat(document.getElementById('hc-cis').value) || 0;
    const VEd = parseFloat(document.getElementById('v-ed').value) || 0;

    if (!bacType || !betonClass || hc <= 0) {
        alert('Veuillez remplir tous les champs correctement.');
        return;
    }

    const bac = BACS_ACIER[bacType];
    const beton = BETONS[betonClass];
    const ht = bac.hp + hc;
    const dp = ht - 20; // hauteur utile

    // Résistance au cisaillement vertical (EC4 §9.7.5)
    const kv = 0.042; // = 0.0525 / 1.25
    const b0 = bac.b0; // largeur moyenne nervures
    const nr = 1000 / bac.br; // nombre de nervures par mètre
    const VRd = nr * b0 * dp * kv * Math.sqrt(beton.fck) / 1000;

    // Taux
    const taux = VEd > 0 ? VEd / VRd : 0;
    const ok = taux <= 1.0;

    // Affichage
    document.getElementById('result-dp').textContent = dp.toFixed(0) + ' mm';
    document.getElementById('result-v-rd').textContent = VRd.toFixed(1) + ' kN/m';
    document.getElementById('result-taux-cis').textContent = (taux * 100).toFixed(1) + '%';

    const badge = document.getElementById('verif-cisaillement');
    if (VEd > 0) {
        badge.className = ok ? 'verification-badge ok' : 'verification-badge fail';
        badge.innerHTML = ok ? '✓ Vérifié' : '✗ Non vérifié';
    } else {
        badge.className = 'verification-badge ok';
        badge.innerHTML = '—';
    }

    document.getElementById('results-cisaillement').style.display = 'block';
}

// ===== CALCULATEUR 4: FLÈCHE ELS =====

function calculerFleche() {
    const bacType = document.getElementById('bac-type-fleche').value;
    const betonClass = document.getElementById('beton-classe-fleche').value;
    const hc = parseFloat(document.getElementById('hc-fleche').value) || 0;
    const portee = parseFloat(document.getElementById('portee-fleche').value) || 0;
    const gExtra = parseFloat(document.getElementById('g-extra').value) || 0;
    const q = parseFloat(document.getElementById('q-fleche').value) || 0;

    if (!bacType || !betonClass || hc <= 0 || portee <= 0) {
        alert('Veuillez remplir tous les champs correctement.');
        return;
    }

    const bac = BACS_ACIER[bacType];
    const beton = BETONS[betonClass];
    const ht = bac.hp + hc;
    const L = portee / 1000; // m

    // Coefficient d'équivalence
    const n0 = ACIER_BAC.Ea / beton.Ecm;

    // Inertie mixte simplifiée (approximation)
    const Ic = 1000 * Math.pow(hc, 3) / 12; // béton
    const Ieq = bac.Ip + Ic / n0 + bac.Ap * Math.pow(ht / 2, 2) / n0;

    // Charges
    const gBac = bac.poids / 100;
    const gBeton = 25 * ht / 1000;
    const gTot = gBac + gBeton + gExtra;
    const qTot = gTot + q;

    // Flèche instantanée
    const delta = 5 * qTot * Math.pow(L * 1000, 4) / (384 * ACIER_BAC.Ea * Ieq);

    // Limite
    const deltaLim = L * 1000 / 250;
    const ok = delta <= deltaLim;

    // Fréquence propre (approximation)
    const m = gTot * 100 / 9.81; // masse linéique approx kg/m
    const f1 = Math.PI / (2 * L * L) * Math.sqrt(ACIER_BAC.Ea * Ieq / (m * 1e6));
    const freqOk = f1 >= 3;

    // Affichage
    document.getElementById('result-n0').textContent = n0.toFixed(2);
    document.getElementById('result-ieq').textContent = (Ieq / 1e6).toFixed(2) + ' ×10⁶ mm⁴/m';
    document.getElementById('result-delta').textContent = delta.toFixed(1) + ' mm';
    document.getElementById('result-delta-lim').textContent = deltaLim.toFixed(1) + ' mm';
    document.getElementById('result-freq').textContent = f1.toFixed(2) + ' Hz';

    const badge = document.getElementById('verif-fleche');
    if (ok && freqOk) {
        badge.className = 'verification-badge ok';
        badge.innerHTML = '✓ Vérifié';
    } else {
        badge.className = 'verification-badge fail';
        badge.innerHTML = ok ? '✗ Vibrations' : '✗ Flèche excessive';
    }

    document.getElementById('results-fleche').style.display = 'block';
}

// ===== CALCULATEUR 5: RÉSISTANCE AU FEU =====

function calculerFeu() {
    const dureeFeu = document.getElementById('duree-feu').value;
    const hc = parseFloat(document.getElementById('hc-feu').value) || 0;
    const portee = parseFloat(document.getElementById('portee-feu').value) || 0;
    const g = parseFloat(document.getElementById('g-feu').value) || 0;
    const q = parseFloat(document.getElementById('q-feu').value) || 0;

    if (!dureeFeu || hc <= 0 || portee <= 0) {
        alert('Veuillez remplir tous les champs correctement.');
        return;
    }

    // Exigences selon durée
    const exigences = {
        'R30': { hcMin: 60, psi1: 0.5 },
        'R60': { hcMin: 70, psi1: 0.5 },
        'R90': { hcMin: 80, psi1: 0.5 },
        'R120': { hcMin: 90, psi1: 0.5 }
    };

    const req = exigences[dureeFeu];
    const L = portee / 1000;

    // Charge en situation de feu
    const qFi = g + req.psi1 * q;

    // Moment en situation de feu
    const MFiEd = qFi * L * L / 8;

    // Hauteur utile des armatures (dans les nervures)
    const ds = hc + 60 - 20; // approximation position armatures

    // Résistance de calcul en feu (pas de gamma)
    const fyk = 500; // MPa HA
    const fsdFi = fyk;

    // Section d'armatures requise (par mètre)
    const AsReq = MFiEd * 1e6 / (0.9 * ds * fsdFi);

    // Vérification épaisseur béton
    const hcOk = hc >= req.hcMin;

    // Choix armatures
    let diaChosen, nbrParNervure;
    if (AsReq <= 50) {
        diaChosen = 6; nbrParNervure = 1;
    } else if (AsReq <= 100) {
        diaChosen = 8; nbrParNervure = 1;
    } else if (AsReq <= 200) {
        diaChosen = 10; nbrParNervure = 1;
    } else if (AsReq <= 300) {
        diaChosen = 12; nbrParNervure = 1;
    } else {
        diaChosen = 12; nbrParNervure = 2;
    }

    const AsChosen = nbrParNervure * Math.PI * Math.pow(diaChosen, 2) / 4 * 5; // 5 nervures/m approx

    // Affichage
    document.getElementById('result-q-fi').textContent = qFi.toFixed(2) + ' kN/m²';
    document.getElementById('result-m-fi').textContent = MFiEd.toFixed(2) + ' kN.m/m';
    document.getElementById('result-as-req').textContent = AsReq.toFixed(0) + ' mm²/m';
    document.getElementById('result-hc-min').textContent = req.hcMin + ' mm';
    document.getElementById('result-armatures').textContent = nbrParNervure + ' HA ' + diaChosen + '/nervure (' + AsChosen.toFixed(0) + ' mm²/m)';

    const badge = document.getElementById('verif-feu');
    if (hcOk && AsChosen >= AsReq) {
        badge.className = 'verification-badge ok';
        badge.innerHTML = '✓ ' + dureeFeu + ' vérifié';
    } else {
        badge.className = 'verification-badge fail';
        badge.innerHTML = hcOk ? '✗ Armatures insuffisantes' : '✗ hc insuffisant';
    }

    document.getElementById('results-feu').style.display = 'block';
}
