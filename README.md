# Cas Cliniques de Microbiologie — Résidanat en Algérie

Site web **Astro** publiant les **219 cas cliniques** du livre
*« Les Cas Cliniques de Microbiologie – Résidanat en Algérie »* du **Dr. Wail NAMOUNE**,
avec corrigés masqués, recherche plein texte, fiches de systématique, suivi de
progression et impression PDF propre.

🔗 **Site en ligne** : https://wa1l.github.io/Cas-Clinique-Microbio/

## Structure

```text
src/
├── content/
│   ├── cases/                     # les 219 cas (un cas = un .md)
│   │   ├── 01-resistance-aux-antibiotiques/
│   │   ├── 02-virologie/
│   │   ├── 03-bacteriologie/
│   │   └── 04-mix/
│   └── fiches/                    # fiches de systématique (1 page A4 / genre)
├── pages/                         # accueil, cas, fiches, recherche, progrès, impression
├── layouts/ · components/
├── styles/global.css              # design system « Aurora »
└── scripts/app.js                 # corrigés, favoris, notes, streak, radar, impression
public/
├── cases/                         # images des cas
└── data/                          # index de recherche (générés à chaque build)
```

- **Un cas = un fichier Markdown** dans le dossier de son chapitre — navigation,
  classement et recherche **automatiques**.
- Déploiement **GitHub Pages** automatique à chaque push sur `main` (GitHub Actions).

## Ajouter un cas

Voir [CONTRIBUTING.md](CONTRIBUTING.md) et le modèle [`templates/cas-clinique-template.md`](templates/cas-clinique-template.md).
En résumé : créer `src/content/cases/<partie>/<chapitre>/cas-X-Y.md`, puis `git push`.

## Ajouter une fiche de systématique

```bash
python3 scripts/new_fiche.py "Neisseria"            # ou --part Virologie
```

Puis remplir le contenu (tout est pré-mis en forme) et `git push`.
Guide complet : [FICHES.md](FICHES.md) · template : [`templates/fiche-template.md`](templates/fiche-template.md).

## Développement local

```bash
npm install
npm run indexes        # régénère les index de recherche (public/data/)
npm run dev            # http://localhost:4321/Cas-Clinique-Microbio/
```

État d'avancement chapitre par chapitre : [CHAPTERS.md](CHAPTERS.md).

## Crédits

D'après le livre *« Les Cas Cliniques de Microbiologie — Résidanat en Algérie »*
du **Dr. Wail NAMOUNE**. Site construit avec [Astro](https://astro.build).
