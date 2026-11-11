# Guide : ajouter un nouveau cas clinique

Le site est reconstruit **automatiquement** à chaque `git push`. Ajouter un cas ne demande
que la création d'un fichier Markdown.

## 1. Choisir l'emplacement

Chaque cas vit dans le dossier du chapitre correspondant :

```text
docs/cases/
├── 01-resistance-aux-antibiotiques/
│   └── 01-phenotypes-de-resistance/    ← dossier du chapitre
├── 02-virologie/
│   ├── 02-infections-respiratoires-virales/
│   ├── 05-les-hepatites-virales/
│   └── …
├── 03-bacteriologie/
│   └── …
└── 04-mix/
    └── 01-mix/
```

## 2. Créer le fichier

1. Copiez le modèle [`templates/cas-clinique-template.md`](https://github.com/Wa1L/Cas-Clinique-Microbio/blob/main/templates/cas-clinique-template.md).
2. Nommez le fichier selon la convention **`cas-<partie>-<numéro>.md`** en conservant le
   numéro du livre, par exemple :

   ```text
   cas-1-71.md      → Cas 1.71 (Résistance aux antibiotiques)
   cas-6-16.md      → Cas 6.16 (Hépatites virales)
   cas-26-16.md     → Cas 26.16 (Mix)
   ```

   !!! warning "Important"
       Les numéros sont sur 2 chiffres (`cas-1-05.md`, pas `cas-1-5.md`) pour que
       le classement et la navigation restent dans l'ordre.

3. Pour un **nouveau chapitre**, créez un dossier `NN-nom-du-chapitre/` (avec `NN` =
   numéro suivant le dernier chapitre existant de la partie) et ajoutez-y un fichier
   `.pages` contenant son titre :

   ```text
   title: Infections Oculaires
   ```

## 3. Remplir le contenu

Structure attendue (identique aux cas du livre) :

| Section | Contenu |
|---|---|
| Contexte clinique | Patient, terrain, prélèvements |
| Résultats | Identification, antibiogramme (tableau), sérologies… |
| Questions | Numérotées `1.` `2.` … |
| Corrigé | Réponses point par point |
| Compléments | Points de cours, pièges d'examen |

Les images (antibiogrammes, microscopie…) se placent dans le sous-dossier `images/`
du chapitre et s'insèrent ainsi :

```markdown
![Antibiogramme](images/mon-image.jpg)
```

## 4. Publier

```bash
git add docs/cases/<partie>/<chapitre>/cas-X-Y.md
git commit -m "Ajout cas X.Y"
git push
```

Environ **2 minutes** plus tard, le cas est en ligne : la navigation se met à jour
automatiquement (grâce au plugin *awesome-pages*), la recherche aussi.

## Astuces de mise en forme

- Écrire un germe en italique : `*Escherichia coli*`
- Exposant : `10^3^ UFC/ml` → 10^3^ UFC/ml
- Encadrer une remarque : `!!! warning "Attention"` puis le texte indenté
- Tableaux : barres verticales `|` comme dans le modèle
