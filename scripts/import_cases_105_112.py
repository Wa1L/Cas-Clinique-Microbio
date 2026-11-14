#!/usr/bin/env python3
"""Importe les cas 1-105 → 1-112 dans « 01-phenotypes-de-resistance ».

Renumérotation pour garder une suite continue (le chapitre s'arrête à 1-98) :
  105→99  106→100  107→101  108→102  109→103  110→104  111→105  112→106
- fichiers .md renommés, titres frontmatter / H1 / mentions « CAS 1.x » / refs
  d'images mis à jour ;
- images copiées depuis upload/ avec le nouveau nom ;
- « } » parasite en fin de cas-1-105 supprimé.
"""
import re
import shutil
from pathlib import Path

ROOT = Path("/home/z/my-project/Cas-Clinique-Microbio")
UP = Path("/home/z/my-project/upload")
CHAP = ROOT / "src/content/cases/01-resistance-aux-antibiotiques/01-phenotypes-de-resistance"
IMG = CHAP / "images"
MAPPING = [(105, 99), (106, 100), (107, 101), (108, 102), (109, 103), (110, 104), (111, 105), (112, 106)]


def git(*args):
    import subprocess
    subprocess.run(["git", *args], check=True, cwd=ROOT)


for old, new in MAPPING:
    src = UP / f"cas-1-{old}.md"
    if not src.exists():
        print(f"SKIP cas-1-{old} : fichier absent")
        continue

    txt = src.read_text(encoding="utf-8")
    # référence d'image et mentions du numéro
    txt = txt.replace(f"cas-1-{old}", f"cas-1-{new}")
    txt = re.sub(rf"Cas 1\.{old}\b", f"Cas 1.{new}", txt)

    # « } » parasite en toute fin de fichier
    txt = txt.rstrip()
    if txt.endswith("}") and txt.count("{") < txt.count("}"):
        txt = txt[:-1].rstrip() + "\n"

    dst = CHAP / f"cas-1-{new}.md"
    dst.write_text(txt, encoding="utf-8")
    git("add", str(dst.relative_to(ROOT)))

    # images associées
    for img in sorted(UP.glob(f"cas-1-{old}-*")):
        target = IMG / img.name.replace(f"cas-1-{old}-", f"cas-1-{new}-")
        shutil.copy2(img, target)
        git("add", str(target.relative_to(ROOT)))
        print(f"IMG  {img.name} -> {target.name}")

    print(f"MD   cas-1-{old}.md -> cas-1-{new}.md")

stems = sorted(int(re.match(r"cas-1-(\d+)", f.stem).group(1)) for f in CHAP.glob("cas-*.md"))
gaps = [n for n in range(1, max(stems) + 1) if n not in stems]
print(f"Total {len(stems)} cas, max {max(stems)}, trous restants : {gaps or 'aucun'}")
