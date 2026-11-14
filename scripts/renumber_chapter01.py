#!/usr/bin/env python3
"""Renumérote les cas de « 01-phenotypes-de-resistance » pour supprimer les trous.

Mapping (ordre croissant, sans collision) :
  93→91  96→92  98→93  99→94  100→95  102→96  103→97  104→98
Renomme fichiers .md + images, et met à jour titres frontmatter, H1,
références d'images dans le texte.
"""
import re
import subprocess
from pathlib import Path

CHAP = Path("/home/z/my-project/Cas-Clinique-Microbio/src/content/cases/"
            "01-resistance-aux-antibiotiques/01-phenotypes-de-resistance")
MAPPING = [(93, 91), (96, 92), (98, 93), (99, 94), (100, 95), (102, 96), (103, 97), (104, 98)]


def git(*args):
    subprocess.run(["git", *args], check=True, cwd=CHAP)


for old, new in MAPPING:
    src = CHAP / f"cas-1-{old}.md"
    dst = CHAP / f"cas-1-{new}.md"
    if not src.exists():
        print(f"SKIP cas-1-{old} (absent)")
        continue

    # images du cas
    for img in sorted(CHAP.glob(f"cas-1-{old}-*")):
        git("mv", img.name, img.name.replace(f"cas-1-{old}-", f"cas-1-{new}-"))
        print(f"IMG  {img.name} -> {img.name.replace(f'cas-1-{old}-', f'cas-1-{new}-')}")

    txt = src.read_text(encoding="utf-8")
    txt = txt.replace(f"cas-1-{old}", f"cas-1-{new}")
    txt = re.sub(rf"Cas 1\.{old}\b", f"Cas 1.{new}", txt)
    git("mv", src.name, dst.name)
    dst.write_text(txt, encoding="utf-8")
    print(f"MD   cas-1-{old}.md -> cas-1-{new}.md")

# vérification : suite continue 1..N
stems = sorted(int(re.match(r"cas-1-(\d+)", f.stem).group(1)) for f in CHAP.glob("cas-*.md"))
gaps = [n for n in range(1, max(stems) + 1) if n not in stems]
print(f"Total {len(stems)} cas, max {max(stems)}, trous restants : {gaps or 'aucun'}")
