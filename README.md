# Cas Cliniques de Microbiologie — Résidanat en Algérie

Site web statique publishant les **218 cas cliniques** du livre
*« Les Cas Cliniques de Microbiologie – Résidanat en Algérie »* du **Dr Wail NAMOUNE**,
avec corrigés, recherche plein texte et navigation par chapitre.

🔗 **Site en ligne** : https://wa1l.github.io/Cas-Clinique-Microbio/

## Structure

```text
docs/
├── index.md                        # accueil
├── avant-propos.md
├── guide/ajouter-un-cas.md         # guide d'ajout d'un cas
└── cases/
    ├── 01-resistance-aux-antibiotiques/   (70 cas)
    ├── 02-virologie/                      (39 cas)
    ├── 03-bacteriologie/                  (94 cas)
    └── 04-mix/                            (15 cas)
```

- **Un cas = un fichier Markdown** dans le dossier de son chapitre.
- La navigation, le classement et la recherche sont **automatiques**.
- Le déploiement sur GitHub Pages est déclenché par GitHub Actions à chaque push sur `main`.

## Ajouter un cas

Voir [CONTRIBUTING.md](CONTRIBUTING.md) et le modèle [`templates/cas-clinique-template.md`](templates/cas-clinique-template.md).

En résumé : créer `docs/cases/<partie>/<chapitre>/cas-X-Y.md`, puis `git push`.

## Développement local

```bash
pip install -r requirements.txt
mkdocs serve
```

## Crédits

Contenu d'après le livre du Dr Wail NAMOUNE. Ce dépôt a pour but l'entraînement
des résidents ; toute contribution (corrections, nouveaux cas) est bienvenue.
