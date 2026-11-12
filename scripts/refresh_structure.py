#!/usr/bin/env python3
"""Rafraîchit src/lib/structure.json en scannant src/content/cases/.

À exécuter après chaque ajout de cas (fait automatiquement par `npm run build`).
Les métadonnées (titres, romains, icônes) des parties et chapitres déjà
présents dans structure.json sont conservées ; seuls les cas et compteurs
sont recalculés. Les nouveaux chapitres reçoivent un titre dérivé du slug.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "src" / "content" / "cases"
STRUCT = ROOT / "src" / "lib" / "structure.json"

ROMANS = {
    "01-resistance-aux-antibiotiques": "I",
    "02-virologie": "II",
    "03-bacteriologie": "III",
    "04-mix": "IV",
}
ICONS = {
    "01-resistance-aux-antibiotiques": "🧪",
    "02-virologie": "🧬",
    "03-bacteriologie": "🔬",
    "04-mix": "🧩",
}

# Titres d'affichage pour les nouveaux chapitres (slug -> titre).
# Sans entrée ici, le titre est dérivé du slug ; ajoute une ligne
# "partie/chapitre": "Titre complet" après avoir créé un chapitre.
CHAPTER_TITLES = {
    "02-virologie/08-infections-chez-id-et-le-greffe": "Infections chez l'immunodéprimé et le greffé",
}


def case_stem_order(stem: str):
    """Tri naturel : cas-3-12 avant cas-3-14, etc."""
    m = re.match(r"^cas-(\d+)-(\d+)$", stem)
    if m:
        return (int(m.group(1)), int(m.group(2)))
    return (10 ** 6, 0)


def main():
    old = json.loads(STRUCT.read_text(encoding="utf-8")) if STRUCT.exists() else []
    old_parts = {p["slug"]: p for p in old}
    old_chaps = {
        p["slug"]: {c["slug"]: c for c in p["chapters"]} for p in old
    }

    structure = []
    total = 0
    for part_dir in sorted(p for p in CONTENT.iterdir() if p.is_dir()):
        pslug = part_dir.name
        opart = old_parts.get(pslug, {})
        chapters = []
        for chap_dir in sorted(c for c in part_dir.iterdir() if c.is_dir()):
            cslug = chap_dir.name
            ochap = old_chaps.get(pslug, {}).get(cslug, {})
            stems = sorted(
                (f.stem for f in chap_dir.glob("cas-*.md")),
                key=case_stem_order,
            )
            chapters.append({
                "slug": cslug,
                "title": ochap.get("title",
                                   CHAPTER_TITLES.get(f"{pslug}/{cslug}",
                                                      cslug.replace("-", " ").capitalize())),
                "cases": stems,
                "count": len(stems),
            })
        count = sum(c["count"] for c in chapters)
        total += count
        structure.append({
            "slug": pslug,
            "title": opart.get("title", pslug.replace("-", " ").capitalize()),
            "roman": opart.get("roman", ROMANS.get(pslug, "")),
            "icon": opart.get("icon", ICONS.get(pslug, "📁")),
            "chapters": chapters,
            "count": count,
        })

    STRUCT.write_text(json.dumps(structure, ensure_ascii=False, indent=1), encoding="utf-8")
    nch = sum(len(p["chapters"]) for p in structure)
    print(f"OK : {total} cas, {nch} chapitres, {len(structure)} parties -> {STRUCT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
