#!/usr/bin/env python3
"""Crée une nouvelle fiche de systématique à partir du template.

Utilisation :
    python3 scripts/new_fiche.py "Neisseria"                    -> part=Bactériologie (défaut)
    python3 scripts/new_fiche.py "Herpès simplex" --part Virologie
    python3 scripts/new_fiche.py "Candida" --part Mycologie --order 5

Le fichier est créé dans src/content/fiches/<slug>.md, prêt à remplir.
Astro le publie automatiquement au prochain `git push` (build GitHub Pages).
"""
import argparse
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TPL = ROOT / "templates" / "fiche-template.md"
OUT = ROOT / "src" / "content" / "fiches"
PARTS = ["Bactériologie", "Virologie", "Mycologie", "Parasitologie", "Autre"]


def slugify(s: str) -> str:
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = re.sub(r"[^a-zA-Z0-9]+", "-", s).strip("-").lower()
    return s or "fiche"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("genre", help="Nom du genre, ex. « Neisseria »")
    ap.add_argument("--part", default="Bactériologie", choices=PARTS)
    ap.add_argument("--order", type=int, default=50)
    ap.add_argument("--type", default="bactérienne", help="bactérienne | virale | fongique | parasitaire")
    args = ap.parse_args()

    genre = args.genre.strip()
    slug = slugify(genre)
    dest = OUT / f"{slug}.md"
    if dest.exists():
        raise SystemExit(f"!! {dest} existe déjà")

    tpl = TPL.read_text(encoding="utf-8")
    out = tpl.replace('title: "Genre [Genre]"', f'title: "Genre {genre}"')
    out = out.replace('part: "Bactériologie"', f'part: "{args.part}"')
    out = out.replace("order: 10", f"order: {args.order}")
    out = out.replace("[bactérienne / virale]", args.type)
    # dans le corps : remplace les [Genre] visibles
    out = out.replace("[Genre]", genre)
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(out, encoding="utf-8")
    print(f"OK : fiche créée -> {dest.relative_to(ROOT)}")
    print("     Remplissez le contenu, puis : git add/commit/push — le site se met à jour tout seul.")


if __name__ == "__main__":
    main()
