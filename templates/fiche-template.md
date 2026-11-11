---
title: "Genre [Genre]"
subtitle: "Fiche de systématique [bactérienne / virale] — DEMS Microbiologie"
part: "Bactériologie"   # Bactériologie | Virologie | Mycologie | Parasitologie | Autre
order: 10                # ordre d'affichage dans la liste
---

<!-- TEMPLATE FICHE DE SYSTÉMATIQUE (DEMS Microbiologie) – 1 page A4.
     Ne modifier que le CONTENU (textes entre balises). Ne pas toucher au CSS.
     Conversion PDF : google-chrome --headless=new --no-sandbox --no-pdf-header-footer --print-to-pdf=fiche.pdf template_fiche.html
     Réglage de remplissage : ajuster uniquement "body { font-size }" (≈ 7.4pt si trop long, ≈ 8.5pt si trop vide). -->

<!-- 1. BANDEAU VIOLET -->
<div class="banner">
  <div class="l1">
    <div class="t">Genre <i>[Genre]</i></div>
    <div class="s">Fiche de systématique [bactérienne / virale] – DEMS Microbiologie</div>
  </div>
  <!-- Bactérie : Phylum · Classe · Ordre · Famille | Virus : Ordre · Famille · Genre + groupe de Baltimore -->
  <div class="l2"><b>Phylum</b> [..] · <b>Classe</b> [..] · <b>Ordre</b> [..] · <b>Famille</b> [..]</div>
</div>

<!-- 2. TABLEAU DES ESPÈCES (colonnes à adapter au genre ; virus : génome, enveloppe, réservoir/vecteur, tropisme, sérotypes) -->
<table class="sp">
  <tr>
    <th style="width:16%">Espèce</th><th>Test 1</th><th>Test 2</th><th>Test 3</th><th>Test 4</th><th style="width:42%">Intérêt clinique</th>
  </tr>
  <tr><td><b><i>[Espèce la plus pathogène]</i></b></td><td>+</td><td>–</td><td>var.</td><td>faible</td><td><b>Le plus pathogène</b> : [maladies]</td></tr>
  <tr><td><i>[Espèce 2]</i></td><td>+</td><td>–</td><td>–</td><td>+</td><td>Commensal ; <span class="r">piège : [..]</span></td></tr>
  <tr><td><i>[Espèce 3]</i></td><td>–</td><td>+</td><td>+</td><td>–</td><td>[..]</td></tr>
</table>

<div class="cols">

<!-- COLONNE GAUCHE -->
<div class="col">

<div class="box bl"><div class="bt">Caractères [bactériologiques / virologiques]</div><div class="bb">
<p><span class="h">Morphologie</span> : [..] ; <span class="r">[piège]</span>.</p>
<p><span class="h">Exigences</span> : [..]</p>
<p><span class="h">Culture</span> : [milieu, T °C, % CO₂, durée, aspect des colonies]</p>
<p><span class="h">Biochimie</span> : [oxydase, catalase, ..]</p>
<p><span class="h">Antigénie</span> : [..]</p>
<!-- Virus : Virion · Génome · Réplication · Culture/ECP · Antigénie · Sérotypes -->
</div></div>

<div class="box br"><div class="bt">Épidémiologie</div><div class="bb"><ul>
<li>Réservoir <b>[..]</b> ; transmission [..].</li>
<li>Terrain : [..]</li>
</ul></div></div>

<div class="box rd"><div class="bt">Physiopathologie</div><div class="bb"><ul>
<li><b>[Facteur de virulence]</b> : [..]</li>
<li>Voie : [..]</li>
</ul></div></div>

</div>

<!-- COLONNE DROITE -->
<div class="col">

<div class="box or"><div class="bt">Clinique</div><div class="bb"><ul>
<li><b>[Syndrome 1]</b> : [..] <span class="r">[séquelles / signes d'alerte]</span>.</li>
<li>[Syndrome 2] : [..]</li>
</ul></div></div>

<div class="box db"><div class="bt">Diagnostic</div><div class="bb"><ul>
<li><b>Prélèvement</b> : [..] <span class="r">[piège pré-analytique]</span>.</li>
<li><b>Direct</b> : [..] <b>Culture / PCR / sérologie</b> : [..]</li>
<li><b>Identification</b> : [..] <b>Typage</b> : [..]</li>
<li><b>ATBg</b> : [milieu, inoculum, T °C, CO₂, durée] ; contrôle ATCC [..].</li>
</ul></div></div>

<div class="box dr"><div class="bt">Résistance aux antibiotiques</div><div class="bb"><ul>
<!-- Virus : « Antiviraux » ou omettre cette boîte -->
<li><b>Naturelle</b> : [..]</li>
<li><b>Acquise</b> : [mécanisme] ; phénotype de lecture [..] ; effet des inhibiteurs [..].</li>
</ul></div></div>

<div class="box gr"><div class="bt">Traitement et prévention</div><div class="bb"><ul>
<li><b>[Situation]</b> : [molécule, dose, durée].</li>
<li><b>Vaccin</b> : [..] ; calendrier PEV algérien [..].</li>
<li><b>Prophylaxie de l'entourage</b> : [..] ; <b>déclaration</b> [..].</li>
</ul></div></div>

</div>
</div>
