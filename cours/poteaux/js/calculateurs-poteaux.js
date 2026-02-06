// Calculateurs pour Poteaux Mixtes
// Selon Eurocode 4 (EN 1994-1-1)

// Données des profilés HEB/HEM
const PROFILS = {
    HEB200: { Aa: 78.1, Ia: 5696, h: 200, b: 200 },
    HEB240: { Aa: 106, Ia: 11260, h: 240, b: 240 },
    HEB280: { Aa: 131, Ia: 19270, h: 280, b: 280 },
    HEB300: { Aa: 149, Ia: 25170, h: 300, b: 300 },
    HEB340: { Aa: 171, Ia: 36660, h: 340, b: 300 },
    HEM300: { Aa: 303, Ia: 59200, h: 340, b: 310 }
};

// Données des bétons
const BETONS = {
    C25: { fck: 25, Ecm: 31000 },
    C30: { fck: 30, Ecm: 33000 },
    C35: { fck: 35, Ecm: 34000 },
    C40: { fck: 40, Ecm: 35000 }
};

// Nuances d'acier
const ACIERS = {
    S235: { fy: 235 },
    S355: { fy: 355 },
    S460: { fy: 460 }
};

// Coefficients partiels
const GAMMA = {
    M0: 1.0,  // Acier
    C: 1.5,   // Béton
    S: 1.15   // Armatures
};

// Calculateur 1: Résistance Plastique
function calculerResistance() {
    // Récupérer les entrées
    const profilKey = document.getElementById('profil1').value;
    const b = parseFloat(document.getElementById('b1').value) / 10; // cm
    const h = parseFloat(document.getElementById('h1').value) / 10; // cm
    const betonKey = document.getElementById('beton1').value;
    const acierKey = document.getElementById('acier1').value;
    const As = parseFloat(document.getElementById('As1').value);

    const profil = PROFILS[profilKey];
    const beton = BETONS[betonKey];
    const acier = ACIERS[acierKey];

    // Calculs
    const Aa = profil.Aa;
    const Ac = b * h - Aa - As;

    const fyd = acier.fy / GAMMA.M0;
    const fcd = beton.fck / GAMMA.C;
    const fsd = 500 / GAMMA.S; // B500

    // Résistance plastique (kN)
    const Na = Aa * fyd / 10; // kN
    const Nc = 0.85 * Ac * fcd / 10; // kN
    const Ns = As * fsd / 10; // kN
    const NplRd = Na + Nc + Ns;

    // Coefficient de contribution
    const delta = Na / NplRd;
    const deltaOk = delta >= 0.2 && delta <= 0.9;

    // Afficher résultats
    const resultsDiv = document.getElementById('results1');
    resultsDiv.innerHTML = `
        <h4>Résultats</h4>
        <div class="result-item">
            <span>Section béton Ac :</span>
            <strong>${Ac.toFixed(1)} cm²</strong>
        </div>
        <div class="result-item">
            <span>Contribution acier Na :</span>
            <strong>${Na.toFixed(0)} kN</strong>
        </div>
        <div class="result-item">
            <span>Contribution béton Nc :</span>
            <strong>${Nc.toFixed(0)} kN</strong>
        </div>
        <div class="result-item">
            <span>Contribution armatures Ns :</span>
            <strong>${Ns.toFixed(0)} kN</strong>
        </div>
        <div class="result-item highlight">
            <span>Résistance plastique N<sub>pl,Rd</sub> :</span>
            <strong>${NplRd.toFixed(0)} kN</strong>
        </div>
        <div class="result-item">
            <span>Coefficient δ :</span>
            <strong>${delta.toFixed(2)}</strong>
            <span class="badge ${deltaOk ? 'ok' : 'fail'}">${deltaOk ? '✓ OK' : '✗ Hors limites'}</span>
        </div>
        ${!deltaOk ? '<p class="warning-text">⚠️ Le coefficient δ doit être entre 0.2 et 0.9</p>' : ''}
    `;
}

// Calculateur 2: Flambement
function calculerFlambement() {
    const NplRd = parseFloat(document.getElementById('NplRd2').value);
    const EIeff = parseFloat(document.getElementById('EIeff2').value);
    const L = parseFloat(document.getElementById('L2').value);
    const beta = parseFloat(document.getElementById('appui2').value);
    const alpha = parseFloat(document.getElementById('courbe2').value);
    const NEd = parseFloat(document.getElementById('NEd2').value);

    // Longueur de flambement
    const Lcr = beta * L;

    // Charge critique (kN)
    const Ncr = Math.PI * Math.PI * EIeff / (Lcr * Lcr);

    // Résistance caractéristique (approximation)
    const NplRk = NplRd * 1.1; // Approximation

    // Élancement réduit
    const lambdaBar = Math.sqrt(NplRk / Ncr);

    // Coefficient Φ et χ
    const Phi = 0.5 * (1 + alpha * (lambdaBar - 0.2) + lambdaBar * lambdaBar);
    const chi = 1 / (Phi + Math.sqrt(Phi * Phi - lambdaBar * lambdaBar));

    // Résistance au flambement
    const NbRd = chi * NplRd;

    // Vérification
    const taux = NEd / NbRd;
    const ok = taux <= 1.0;

    // Afficher résultats
    const resultsDiv = document.getElementById('results2');
    resultsDiv.innerHTML = `
        <h4>Résultats</h4>
        <div class="result-item">
            <span>Longueur de flambement L<sub>cr</sub> :</span>
            <strong>${Lcr.toFixed(2)} m</strong>
        </div>
        <div class="result-item">
            <span>Charge critique N<sub>cr</sub> :</span>
            <strong>${Ncr.toFixed(0)} kN</strong>
        </div>
        <div class="result-item">
            <span>Élancement réduit λ̄ :</span>
            <strong>${lambdaBar.toFixed(2)}</strong>
            <span class="badge ${lambdaBar <= 2.0 ? 'ok' : 'fail'}">${lambdaBar <= 2.0 ? '≤ 2.0' : '> 2.0'}</span>
        </div>
        <div class="result-item">
            <span>Coefficient χ :</span>
            <strong>${chi.toFixed(3)}</strong>
        </div>
        <div class="result-item highlight">
            <span>Résistance flambement N<sub>b,Rd</sub> :</span>
            <strong>${NbRd.toFixed(0)} kN</strong>
        </div>
        <div class="result-item">
            <span>Taux d'utilisation :</span>
            <strong>${(taux * 100).toFixed(1)}%</strong>
            <span class="badge ${ok ? 'ok' : 'fail'}">${ok ? '✓ OK' : '✗ NON VÉRIFIÉ'}</span>
        </div>
    `;
}

// Calculateur 3: Flexion Composée
function calculerFlexionComposee() {
    const NplRd = parseFloat(document.getElementById('NplRd3').value);
    const MplRd = parseFloat(document.getElementById('MplRd3').value);
    const NEd = parseFloat(document.getElementById('NEd3').value);
    const MEd = parseFloat(document.getElementById('MEd3').value);
    const alphaM = parseFloat(document.getElementById('alphaM3').value);

    // Résistance du béton seul (approximation)
    const NpmRd = 0.35 * NplRd; // Approximation typique

    // Moment résistant réduit
    const ratio = (1 - NEd / NplRd) / (1 - NpmRd / (2 * NplRd));
    const MplNRd = MplRd * Math.min(ratio, 1.0);

    // Vérification
    const taux = MEd / (alphaM * MplNRd);
    const ok = taux <= 1.0;

    // Afficher résultats
    const resultsDiv = document.getElementById('results3');
    resultsDiv.innerHTML = `
        <h4>Résultats</h4>
        <div class="result-item">
            <span>Résistance béton N<sub>pm,Rd</sub> :</span>
            <strong>${NpmRd.toFixed(0)} kN</strong>
        </div>
        <div class="result-item">
            <span>Ratio N<sub>Ed</sub>/N<sub>pl,Rd</sub> :</span>
            <strong>${(NEd / NplRd * 100).toFixed(1)}%</strong>
        </div>
        <div class="result-item highlight">
            <span>Moment réduit M<sub>pl,N,Rd</sub> :</span>
            <strong>${MplNRd.toFixed(1)} kN.m</strong>
        </div>
        <div class="result-item">
            <span>Moment admissible α<sub>M</sub>·M<sub>pl,N,Rd</sub> :</span>
            <strong>${(alphaM * MplNRd).toFixed(1)} kN.m</strong>
        </div>
        <div class="result-item">
            <span>Taux d'utilisation :</span>
            <strong>${(taux * 100).toFixed(1)}%</strong>
            <span class="badge ${ok ? 'ok' : 'fail'}">${ok ? '✓ OK' : '✗ NON VÉRIFIÉ'}</span>
        </div>
    `;
}

// Calculateur 4: Résistance au Feu
function calculerFeu() {
    const type = document.getElementById('type4').value;
    const dim = parseFloat(document.getElementById('dim4').value);
    const enrob = parseFloat(document.getElementById('enrob4').value);
    const mu = parseFloat(document.getElementById('mu4').value);

    // Dimensions minimales selon le type
    let requirements;
    if (type === 'tube_circ') {
        requirements = {
            R30: 140, R60: 200, R90: 260, R120: 320
        };
    } else if (type === 'tube_rect') {
        requirements = {
            R30: 100, R60: 160, R90: 200, R120: 260
        };
    } else { // enrobée
        requirements = {
            R30: 200, R60: 250, R90: 300, R120: 350
        };
    }

    // Enrobages minimaux (pour sections enrobées)
    const enrobMin = {
        R30: 25, R60: 40, R90: 50, R120: 60
    };

    // Déterminer la résistance atteinte
    let resistance = 'R0';
    for (const [r, minDim] of Object.entries(requirements)) {
        if (dim >= minDim) {
            if (type === 'enrobee') {
                if (enrob >= enrobMin[r]) {
                    resistance = r;
                }
            } else {
                resistance = r;
            }
        }
    }

    // Niveau de chargement acceptable
    let muAcceptable = mu <= 0.5 ? '✓ OK (μ ≤ 0.5)' : '⚠️ Vérification détaillée requise';

    // Afficher résultats
    const resultsDiv = document.getElementById('results4');
    resultsDiv.innerHTML = `
        <h4>Résultats</h4>
        <div class="result-item">
            <span>Type de section :</span>
            <strong>${type === 'enrobee' ? 'Profilé enrobé' : type === 'tube_circ' ? 'Tube circulaire' : 'Tube rectangulaire'}</strong>
        </div>
        <div class="result-item">
            <span>Dimension principale :</span>
            <strong>${dim} mm</strong>
        </div>
        ${type === 'enrobee' ? `
        <div class="result-item">
            <span>Enrobage :</span>
            <strong>${enrob} mm</strong>
        </div>
        ` : ''}
        <div class="result-item highlight">
            <span>Résistance au feu atteinte :</span>
            <strong class="fire-rating">${resistance}</strong>
        </div>
        <div class="result-item">
            <span>Niveau de chargement μ<sub>fi</sub> :</span>
            <strong>${mu}</strong>
            <span class="badge ${mu <= 0.5 ? 'ok' : 'warn'}">${muAcceptable}</span>
        </div>
        <div class="requirements-table">
            <h5>Dimensions minimales requises :</h5>
            <table>
                <tr><th>R30</th><th>R60</th><th>R90</th><th>R120</th></tr>
                <tr>
                    <td class="${dim >= requirements.R30 ? 'ok' : ''}">${requirements.R30} mm</td>
                    <td class="${dim >= requirements.R60 ? 'ok' : ''}">${requirements.R60} mm</td>
                    <td class="${dim >= requirements.R90 ? 'ok' : ''}">${requirements.R90} mm</td>
                    <td class="${dim >= requirements.R120 ? 'ok' : ''}">${requirements.R120} mm</td>
                </tr>
            </table>
        </div>
    `;
}
