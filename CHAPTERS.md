# 📚 État d'avancement — chapitres & cas

> Document de travail (non publié sur le site). Généré par `scripts/gen_chapters_md.py`.
> Pour ajouter un cas : copier `templates/cas-clinique-template.md` dans le dossier du chapitre,
> avec le **nom du prochain fichier** indiqué ci-dessous, puis `git push` — le site se reconstruit seul.

## 🧪 Partie I — Résistance aux antibiotiques

**106 cas** · dossier `src/content/cases/01-resistance-aux-antibiotiques/`

| Chapitre | Cas | Dernier fichier | Prochain fichier | Images |
|---|---|---|---|---|
| Phénotypes de Résistance | 106 | `cas-1-106` | `cas-1-107.md` | — |

## 🦠 Partie II — Virologie

**45 cas** · dossier `src/content/cases/02-virologie/`

| Chapitre | Cas | Dernier fichier | Prochain fichier | Images |
|---|---|---|---|---|
| Infections Respiratoires Virales | 3 | `cas-3-03` | `cas-3-04.md` | — |
| Infections virales cutanées | 3 | `cas-5-03` | `cas-5-04.md` | — |
| Les Hépatites virales | 18 | `cas-6-18` | `cas-6-19.md` | — |
| Zoonoses Virales | 2 | `cas-7-02` | `cas-7-03.md` | — |
| Infections chez l'immunodéprimé et le greffé | 2 | `cas-9-02` | `cas-9-03.md` | — |
| Infections Virales du fœtus et Nné | 16 | `cas-10-16` | `cas-10-17.md` | — |
| Infections Oculaires | 1 | `cas-11-01` | `cas-11-02.md` | — |

## 🧫 Partie III — Bactériologie

**120 cas** · dossier `src/content/cases/03-bacteriologie/`

| Chapitre | Cas | Dernier fichier | Prochain fichier | Images |
|---|---|---|---|---|
| Fondamentale Bactérienne | 2 | `cas-14-02` | `cas-14-03.md` | — |
| Infections GastroEntériques Bactériennes | 10 | `cas-15-10` | `cas-15-11.md` | — |
| Infections Cutanées Bactériennes | 1 | `cas-16-01` | `cas-16-02.md` | — |
| Infections Cardiaques et Bactériémies | 15 | `cas-17-15` | `cas-17-16.md` | — |
| Infections Respiratoires Bactériennes | 9 | `cas-18-09` | `cas-18-10.md` | — |
| Zoonoses Bactériennes | 7 | `cas-19-07` | `cas-19-08.md` | — |
| BK et antituberculeux | 10 | `cas-20-10` | `cas-20-11.md` | — |
| Infections osseuses | 2 | `cas-21-02` | `cas-21-03.md` | — |
| IST et Autres Infections Générales | 19 | `cas-22-19` | `cas-22-20.md` | — |
| Infections Bactériennes Materno-foetale | 3 | `cas-23-03` | `cas-23-04.md` | — |
| Infections Bactériennes du SNC | 18 | `cas-24-18` | `cas-24-19.md` | — |
| Infections Urinaires | 24 | `cas-25-24` | `cas-25-25.md` | — |

## 🔀 Partie IV — Mix

**15 cas** · dossier `src/content/cases/04-mix/`

| Chapitre | Cas | Dernier fichier | Prochain fichier | Images |
|---|---|---|---|---|
| Mix | 15 | `cas-26-15` | `cas-26-16.md` | — |

## 🎯 Chapitres à compléter en priorité

Chapitres contenant **moins de 5 cas** :

- **Infections Cutanées Bactériennes** (Bactériologie) — 1 cas seulement
- **Infections Oculaires** (Virologie) — 1 cas seulement
- **Fondamentale Bactérienne** (Bactériologie) — 2 cas seulement
- **Infections osseuses** (Bactériologie) — 2 cas seulement
- **Infections chez l'immunodéprimé et le greffé** (Virologie) — 2 cas seulement
- **Zoonoses Virales** (Virologie) — 2 cas seulement
- **Infections Bactériennes Materno-foetale** (Bactériologie) — 3 cas seulement
- **Infections Respiratoires Virales** (Virologie) — 3 cas seulement
- **Infections virales cutanées** (Virologie) — 3 cas seulement

**Total : 286 cas publiés.**

## 🗂️ Fiches de systématique

Section du site : **/fiches/** — résumés d'une page A4 par genre microbien.

| Fiche | Statut |
|---|---|
| `src/content/fiches/neisseria.md` | ✅ publié |

**Ajouter une fiche** : `python3 scripts/new_fiche.py "Nom du genre" --part Bactériologie`,
remplir le contenu, puis `git push`. Guide : [FICHES.md](FICHES.md) · template : `templates/fiche-template.md`.

## 🚀 Migration Astro (novembre 2026)

- Site migré de MkDocs vers **Astro** (build ~3 s, design « Aurora », thème clair/sombre, animations).
- Contenu : `src/content/cases/` · images : `public/cases/` · design : `src/styles/global.css` · logique : `src/scripts/app.js`.
- Ajouter un cas ou une fiche ne demande **aucune connaissance Astro** : créer le fichier, `git push`.
- Permaliens ¶ supprimés (titres propres).

## 🔁 Déploiement — état actuel

- **Le site est en ligne et à jour** (design Astro, fiches, recherche corrigée).
- Pages est réglé sur **« Deploy from a branch » → `gh-pages`** (build Astro poussé sur cette branche).
**Pour retrouver le déploiement automatique** à chaque `git push` sur `main` (le token actuel ne peut pas modifier les workflows) :
  1. sur GitHub : éditer `.github/workflows/deploy.yml` et coller le contenu de `templates/deploy-astro.yml` ;
  2. Settings → Pages → Source : **GitHub Actions**.
- En attendant : `npm run build` puis pousser le contenu de `dist/` sur `gh-pages` après chaque ajout.

