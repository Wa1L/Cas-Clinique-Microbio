# Ajouter une Fiche de systématique

Les fiches sont des résumés d'une page A4 par genre microbien, publiées dans la
section **« 🗂️ Fiches »** du site (<https://wa1l.github.io/Cas-Clinique-Microbio/fiches/>).

## Méthode rapide (recommandée)

```bash
python3 scripts/new_fiche.py "Neisseria"
python3 scripts/new_fiche.py "Herpès simplex" --part Virologie --type virale
```

Le fichier `src/content/fiches/<slug>.md` est créé à partir du template
`templates/fiche-template.md`. Il ne reste qu'à **remplir les textes entre les
balises** (tout est déjà mis en forme : bandeau violet, tableau d'espèces, boîtes
colorées, filigrane).

Ensuite :

```bash
git add src/content/fiches/
git commit -m "Fiche Neisseria"
git push          # le site se reconstruit et publie la fiche automatiquement
```

## Méthode manuelle

1. Copiez `templates/fiche-template.md` vers `src/content/fiches/<slug>.md`
   (`<slug>` : nom en minuscules sans accents, ex. `neisseria.md`).
2. Mettez à jour le **frontmatter** en tête de fichier :

   ```yaml
   ---
   title: "Genre Neisseria"        # titre affiché (italique possible avec <i>)
   subtitle: "Fiche de systématique bactérienne — DEMS Microbiologie"
   part: "Bactériologie"           # Bactériologie | Virologie | Mycologie | Parasitologie | Autre
   order: 10                       # position dans la liste (petit = en haut)
   ---
   ```

3. Remplissez le corps HTML **sans toucher aux balises ni aux classes**
   (`banner`, `sp`, `box bl/br/rd/or/db/dr/gr`, `r` = rouge piège, `h` = bleu tête).
4. Vérifiez en local si besoin : `npm run dev` puis <http://localhost:4321/fiches/>.
5. `git push` — c'est en ligne.

## Bon à savoir

- Le filigrane « Dr. Wail NAMOUNE » et l'habillage A4 sont ajoutés
  automatiquement par le site : ne les mettez pas dans la fiche.
- Le bouton **« 🖨️ Imprimer / PDF (A4) »** de chaque fiche produit exactement
  la mise en page du template (1 page A4, fond violet, boîtes colorées).
- Pour une fiche **virale**, remplacez la boîte « Résistance aux antibiotiques »
  par « Antiviraux » (ou supprimez-la) et adaptez les colonnes du tableau
  d'espèces (génome, enveloppe, réservoir/vecteur, tropisme, sérotypes).
