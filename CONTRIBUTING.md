# Contribuer au site des Cas Cliniques de Microbiologie

Merci de votre intérêt ! Ce site publie les 218 cas cliniques de microbiologie du livre
du Dr Wail NAMOUNE (Résidanat en Algérie) et peut accueillir de **nouveaux cas**.

## Ajouter un cas en 4 étapes

1. Copier le modèle [`templates/cas-clinique-template.md`](templates/cas-clinique-template.md)
   dans le dossier du chapitre concerné sous
   `docs/cases/<partie>/<chapitre>/cas-X-Y.md` (numéro sur 2 chiffres).
2. Remplir : contexte clinique, résultats, questions, corrigé, compléments.
3. Placer les images dans le sous-dossier `images/` du chapitre.
4. `git commit` + `git push` → le site se reconstruit tout seul (GitHub Actions),
   navigation et recherche incluses.

Le guide détaillé et l'état d'avancement de chaque chapitre sont dans
[`CHAPTERS.md`](CHAPTERS.md) : dernier cas ajouté, nom du prochain fichier
à créer, dossiers d'images, etc.

## Corriger un cas existant

Les fichiers sources sont dans `docs/cases/…`. Le bouton ✏️ « *Éditer sur GitHub* »
en haut de chaque page ouvre directement le bon fichier.

## Construire le site en local

```bash
pip install -r requirements.txt
mkdocs serve     # http://127.0.0.1:8000
```

## Règles de fond

- Ne pas inventer de données microbiologiques ; citer les sources (DEMS, CONEM…).
- Respecter la structure des cas existants pour rester cohérent.
- Français médical, abréviations usuelles admises (CMI, BHRe, SHA…).

## Règles techniques

- Markdown standard + extensions Material (admonitions, exposants `^…^`).
- Ne pas modifier `mkdocs.yml` pour ajouter un cas : la navigation est automatique.
- Un fichier `.pages` par dossier définit son titre dans le menu.
