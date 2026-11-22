---
title: "Courbe de croissance bactérienne"
subtitle: "Fiche de révision – DEMS Microbiologie"
part: "Fondamentale Bactérienne"
order: 58
---

<div class="banner">
  <div class="l1">
    <div class="t">Courbe de croissance bactérienne</div>
    <div class="s">Fiche de révision – DEMS Microbiologie</div>
  </div>
  <div class="au">Dr. Wail NAMOUNE</div>
  <div class="l2"><b>Module</b> Bactériologie générale · <b>Thème</b> Physiologie et dynamique de croissance · <b>Mots-clés</b> phases, temps de génération G, µmax, UFC/DO, McFarland</div>
</div>

<div class="box fig pu"><div class="bt">Schéma — Croissance en système fermé (batch) : log₁₀ UFC/mL en fonction du temps</div><div class="bb">
<svg viewBox="0 0 760 254" xmlns="http://www.w3.org/2000/svg" font-family="Liberation Sans, Arial, sans-serif">
<defs>
  <marker id="ar" markerWidth="8" markerHeight="8" refX="6.5" refY="2.6" orient="auto"><path d="M0,0 L6.5,2.6 L0,5.2 z" fill="#444"/></marker>
</defs>

<rect x="68"  y="20" width="107" height="185" fill="#1d4f9a" opacity="0.07"/>
<rect x="175" y="20" width="35"  height="185" fill="#d9731a" opacity="0.10"/>
<rect x="210" y="20" width="175" height="185" fill="#2b8a4c" opacity="0.10"/>
<rect x="385" y="20" width="43"  height="185" fill="#d9731a" opacity="0.10"/>
<rect x="428" y="20" width="182" height="185" fill="#6b2a78" opacity="0.08"/>
<rect x="610" y="20" width="110" height="185" fill="#b3262c" opacity="0.08"/>

<g text-anchor="middle" font-weight="700">
  <text x="121" y="14" font-size="8" fill="#1d4f9a">1. Latence (lag)</text>
  <text x="192" y="14" font-size="7" fill="#8a5a1c">2. Accél.</text>
  <text x="297" y="14" font-size="8" fill="#2b8a4c">3. Exponentielle (log)</text>
  <text x="406" y="14" font-size="7" fill="#8a5a1c">4. Ralent.</text>
  <text x="519" y="14" font-size="8" fill="#6b2a78">5. Stationnaire</text>
  <text x="665" y="14" font-size="8" fill="#b3262c">6. Déclin / mort</text>
</g>

<path d="M68,208 L68,16" stroke="#444" stroke-width="1" fill="none" marker-end="url(#ar)"/>
<path d="M64,205 L732,205" stroke="#444" stroke-width="1" fill="none" marker-end="url(#ar)"/>
<g font-size="7.2" fill="#444" text-anchor="end">
  <text x="60" y="207">10³</text><text x="60" y="177">10⁴</text><text x="60" y="147">10⁵</text>
  <text x="60" y="117">10⁶</text><text x="60" y="87">10⁷</text><text x="60" y="57">10⁸</text><text x="60" y="27">10⁹</text>
</g>
<g stroke="#999" stroke-width="0.5">
  <path d="M64,205 L68,205"/><path d="M64,175 L68,175"/><path d="M64,145 L68,145"/><path d="M64,115 L68,115"/>
  <path d="M64,85 L68,85"/><path d="M64,55 L68,55"/><path d="M64,25 L68,25"/>
</g>
<text transform="rotate(-90 15 112)" x="15" y="112" font-size="7.5" font-weight="700" fill="#444" text-anchor="middle">log₁₀ UFC / mL</text>
<text x="700" y="219" font-size="7.5" font-weight="700" fill="#444">Temps</text>

<path d="M68,85 L452,85" stroke="#777" stroke-width="0.7" stroke-dasharray="3,2" fill="none"/>
<text x="72" y="82" font-size="7" fill="#555">Trouble visible à l'œil / DO exploitable ≈ 10⁷–10⁸ UFC/mL</text>

<path d="M68,175 L175,175 C190,175 197,170 210,164 L385,66 C398,58 409,40 428,40 L610,40 C634,40 648,52 668,66 L720,100"
      stroke="#111" stroke-width="1.8" fill="none" stroke-linecap="round"/>

<rect x="74" y="28" width="188" height="44" rx="3" fill="#fff" fill-opacity="0.9" stroke="#1d4f9a" stroke-width="0.6"/>
<g font-size="8" fill="#0b2a55">
  <text x="81" y="41" font-weight="700">N = N₀ × 2ⁿ      ·      G = t / n</text>
  <text x="81" y="54">n = (log N – log N₀) / log 2 = 3,32 × Δlog</text>
  <text x="81" y="66">µ = ln 2 / G  (h⁻¹)  ·  pente = µ / 2,303</text>
</g>

<g font-size="7.6" fill="#1b5a30" font-weight="700">
  <text x="216" y="182">µ = µmax, constant ; croissance équilibrée</text>
  <text x="216" y="194">Population homogène, cellules « typiques »</text>
</g>

<rect x="432" y="108" width="284" height="74" rx="3" fill="#fff" fill-opacity="0.9" stroke="#6b2a78" stroke-width="0.6"/>
<text x="440" y="121" font-size="8" font-weight="700" fill="#6b2a78">Pourquoi un plateau ?</text>
<g font-size="7.6" fill="#333">
  <text x="440" y="134">• Épuisement du substrat limitant (C, N, P, O₂)</text>
  <text x="440" y="146">• Accumulation de déchets, ↓ pH, ↓ activité de l'eau</text>
  <text x="440" y="158">• Réponse stringente (ppGpp), σS → persisters</text>
  <text x="440" y="170">• Divisions ≈ morts → N total apparemment constant</text>
</g>

<g stroke="#ccc" stroke-width="0.6" stroke-dasharray="2,2">
  <path d="M210,209 L210,250"/><path d="M428,209 L428,250"/><path d="M610,209 L610,250"/>
</g>
<g font-size="7.4" fill="#333" text-anchor="middle">
  <text x="130" y="224">Pas de division : N constant,</text>
  <text x="130" y="235">taille ↑, synthèse d'enzymes,</text>
  <text x="130" y="246">ARN et ribosomes ↑</text>
  <text x="319" y="224">Morphologie et coloration de Gram fiables ;</text>
  <text x="319" y="235">sensibilité maximale aux ATB agissant sur la</text>
  <text x="319" y="246">paroi (β-lactamines, glycopeptides)</text>
  <text x="519" y="224">Biomasse maximale (≈ 10⁹ UFC/mL</text>
  <text x="519" y="235">en bouillon) ; sporulation, toxines,</text>
  <text x="519" y="246">pigments, tolérance aux ATB</text>
  <text x="665" y="224">Mortalité exponentielle,</text>
  <text x="665" y="235">autolyse, formes non</text>
  <text x="665" y="246">cultivables (VBNC)</text>
</g>
</svg>
<div class="cap">Échelle semi-logarithmique : la phase exponentielle est une <b>droite</b> de pente µ/2,303. Bandes colorées = phases successives. <b style="color:#2b8a4c">Vert</b> : croissance active · <b style="color:#6b2a78">violet</b> : équilibre divisions/morts · <b style="color:#b3262c">rouge</b> : mortalité. Courbe des <b>UFC viables</b> ; la courbe de DO, elle, ne redescend pas (sauf autolyse massive).</div>
</div></div>

<div class="cols">

<div class="col">

<div class="box bl"><div class="bt">Définitions et paramètres</div><div class="bb">
<p><span class="h">Croissance</span> : augmentation coordonnée des constituants → division binaire. Étudiée en <b>système fermé (batch)</b>, milieu non renouvelé → les 6 phases. En <b>système ouvert (chémostat)</b>, la phase exponentielle est maintenue : à l'équilibre µ = D (taux de dilution).</p>
<p><span class="h">Temps de génération G</span> = temps de doublement : N = N₀ × 2ⁿ ; n = 3,32 × (log N – log N₀) [1/log 2] ; <b>G = t/n</b> ; taux de croissance <b>µ = ln2/G</b> (h⁻¹).</p>
<p><span class="h">Monod</span> : µ = µmax × S/(Ks + S), S = substrat limitant → µ dépend du milieu.</p>
<p><span class="h">Diauxie</span> : 2 substrats → 2 cycles expo. séparés par une latence (répression catabolique, opéron lactose).</p>
<table class="mt">
  <tr><th>Espèce</th><th class="c">G (conditions optimales)</th><th>Conséquence pratique</th></tr>
  <tr><td><i>E. coli</i></td><td class="c">≈ 20 min</td><td>Culture lue à 18–24 h</td></tr>
  <tr><td><i>S. aureus</i></td><td class="c">≈ 30 min</td><td>Idem</td></tr>
  <tr><td><i>P. aeruginosa</i></td><td class="c">≈ 30 min</td><td>Idem</td></tr>
  <tr><td><i>M. tuberculosis</i></td><td class="c">15–20 h</td><td>Solide 3–6 sem. ; MGIT liquide 1–3 sem.</td></tr>
  <tr><td><i>T. pallidum</i></td><td class="c">≈ 30 h</td><td>Non cultivable en routine</td></tr>
</table>
</div></div>

<div class="box br"><div class="bt">Facteurs conditionnant µ et G</div><div class="bb"><ul>
<li><b>Température</b> : psychrophiles/psychrotrophes (<i>Listeria</i>, <i>Yersinia</i> : poussent à +4 °C → enrichissement au froid) · mésophiles (opt. 30–37 °C) · thermophiles (> 45 °C) ; <i>Campylobacter</i> thermotolérant : <b>42 °C</b>.</li>
<li><b>pH</b> : neutrophiles (6–8) ; <i>V. cholerae</i> alcalinophile → eau peptonée alcaline pH 8,6 ; lactobacilles acidophiles.</li>
<li><b>O₂</b> : aérobie strict · anaérobie strict · aéro-anaérobie facultatif · microaérophile (<i>Campylobacter</i> : ≈ 5 % O₂ + 10 % CO₂) · capnophile (<i>Neisseria</i>, <i>Haemophilus</i> : 5–10 % CO₂).</li>
<li><b>Nutriments / facteurs de croissance</b> : X (hémine) et V (NAD) pour <i>Haemophilus</i> → satellitisme autour de <i>S. aureus</i>.</li>
</ul></div></div>

<div class="box rd"><div class="bt">Ce qui allonge la phase de latence</div><div class="bb"><ul>
<li><b>Âge de l'inoculum</b> : culture vieillie → latence longue ; <b>nulle</b> si repiquage d'une culture en phase expo. dans le <b>même</b> milieu.</li>
<li><b>Changement de milieu</b> : synthèse d'enzymes d'adaptation → diauxie.</li>
<li><b>Lésions sublétales</b> (froid, chaleur, désinfectant, ATB sous-inhibiteur) → réparation avant division : <b>milieux de revivification</b> (microbiologie alimentaire, contrôle de stérilité).</li>
</ul></div></div>

<div class="box or"><div class="bt">Portée clinique</div><div class="bb"><ul>
<li><b>Inoculum élevé in vivo</b> (abcès, endocardite, matériel étranger) : bactéries majoritairement en phase stationnaire → <span class="r">échec des β-lactamines malgré un ATBg « S »</span> → drainage / ablation du matériel.</li>
<li><b>Biofilm</b> : croissance ralentie + matrice → tolérance très supérieure aux formes planctoniques ; la CMI ne la prédit pas.</li>
<li><b>Bactériostatique</b> (courbe plate) vs <b>bactéricide</b> (↓ ≥ 3 log₁₀) → relais par les défenses de l'hôte, d'où le choix d'un bactéricide chez le neutropénique.</li>
</ul></div></div>

</div>

<div class="col">

<div class="box db"><div class="bt">Mesurer la croissance</div><div class="bb">
<table class="mt">
  <tr><th>Méthode</th><th>Ce qui est mesuré</th><th>Limites / repères</th></tr>
  <tr><td>Turbidimétrie DO 600–625 nm</td><td>Biomasse totale (vivantes + mortes)</td><td>Seuil ≈ 10⁷/mL ; linéaire pour DO 0,1–0,4</td></tr>
  <tr><td>Numération UFC (dilutions + étalement)</td><td>Bactéries viables cultivables</td><td>Compter 30–300 colonies/boîte ; 18–48 h ; un amas = 1 UFC</td></tr>
  <tr><td>Cellule de Thoma / Malassez</td><td>Cellules totales (vivantes + mortes)</td><td>Seuil ≈ 10⁶/mL</td></tr>
  <tr><td>Cytométrie en flux (automates urinaires)</td><td>Cellules totales ± marqueur de viabilité</td><td>Seuil ≈ 10³–10⁴/mL</td></tr>
  <tr><td>Poids sec, ATP, impédance / CO₂ (automates)</td><td>Biomasse ou activité métabolique</td><td>Indirect, nécessite un étalonnage</td></tr>
</table>
<p><span class="h">Étalon</span> : <b>0,5 McFarland = 1,5 × 10⁸ UFC/mL</b> (DO₆₂₅ 0,08–0,13) pour les bactéries ; <span class="r">pour les levures (<i>Candida</i>), 0,5 McF ≈ 1–5 × 10⁶ UFC/mL</span> (cellules bien plus volumineuses).</p>
<p><span class="h">Pièges</span> : dilutions en série = erreurs cumulatives (homogénéiser à chaque étape) ; amas et chaînettes → 1 UFC = plusieurs cellules (<b>sous-estimation</b>) ; formes <b>VBNC</b> : PCR positive / culture négative.</p>
</div></div>

<div class="box gr"><div class="bt">Applications au laboratoire</div><div class="bb"><ul>
<li><b>Antibiogramme (CA-SFM/EUCAST)</b> : suspension à 0,5 McF, règle des <b>15-15-15</b> (ensemencement de la gélose Mueller-Hinton ≤ 15 min après la suspension, dépôt des disques ≤ 15 min, étuve ≤ 15 min), 35 ± 1 °C, lecture à <b>16–20 h</b> → <span class="r">inoculum trop lourd = faux « résistant », trop léger = faux « sensible »</span>.</li>
<li><b>CMI en microdilution</b> : inoculum final <b>5 × 10⁵ UFC/mL</b> ; <span class="r">effet inoculum</span> (céfépime vs BLSE, oxacilline vs pénicillinase).</li>
<li><b>Cinétique de bactéricidie (time-kill)</b> : bactéricidie = réduction <b>≥ 3 log₁₀</b> UFC/mL à 24 h.</li>
<li><b>RAST (EUCAST)</b> : antibiogramme rapide directement sur hémoculture positive, lecture à <b>4, 6 ou 8 h</b> → application directe de la phase exponentielle.</li>
<li><b>Hémocultures</b> : les automates détectent le CO₂ produit en phase exponentielle → le <b>délai de positivité</b> reflète l'inoculum et le G de l'espèce.</li>
</ul></div></div>

<div class="box key"><div class="bt">À retenir / pièges d'examen</div><div class="bb"><ul>
<li><span class="r">DO ≠ UFC</span> : la DO compte aussi les cellules mortes et les débris → les deux courbes divergent dès la phase stationnaire ; la DO ne redescend pas en phase de déclin, <span class="r">sauf autolyse massive</span> (pneumocoque/LytA, lyse par β-lactamine ou phage).</li>
<li>β-lactamines et glycopeptides n'agissent que sur des bactéries <b>en division</b> → <b>tolérance</b> = bactéricidie ralentie pour <i>toute</i> la population (phase stationnaire) ; <b>persistance</b> = survie d'une sous-population dormante (courbe de bactéricidie biphasique) — <span class="r">dans les deux cas la CMI est inchangée : ce n'est pas une résistance</span>. Aminosides inactifs en anaérobiose (pénétration dépendante du potentiel de membrane).</li>
<li>Gram et morphologie à interpréter sur <b>culture jeune</b> (< 24 h) : <span class="r">les Gram + vieillis se décolorent</span> → faux Gram –.</li>
<li>G n'est pas une constante absolue de l'espèce : il dépend du milieu, de la température et de l'oxygénation.</li>
</ul></div></div>

</div>
</div>
