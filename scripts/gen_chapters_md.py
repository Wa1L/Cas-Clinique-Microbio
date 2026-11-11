#!/usr/bin/env python3
"""Génère CHAPTERS.md : état d'avancement de chaque chapitre (dernier cas,
prochain fichier à créer, images). Régénérable à tout moment :
    python3 scripts/gen_chapters_md.py
"""
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCS = os.path.join(ROOT, "docs")
CASES = os.path.join(DOCS, "cases")
DATA = os.path.join(DOCS, "assets", "cases.json")

ROMAN = {"01": "I", "02": "II", "03": "III", "04": "IV"}


def images_count(chap_dir):
    img = os.path.join(CASES, chap_dir, "images")
    if not os.path.isdir(img):
        return 0
    return len([f for f in os.listdir(img) if not f.startswith(".")])


def main():
    data = json.load(open(DATA, encoding="utf-8"))
    total = 0
    lines = []
    lines.append("# 📚 État d'avancement — chapitres & cas")
    lines.append("")
    lines.append("> Document de travail (non publié sur le site). Généré par `scripts/gen_chapters_md.py`.")
    lines.append("> Pour ajouter un cas : copier `templates/cas-clinique-template.md` dans le dossier du chapitre,")
    lines.append("> avec le **nom du prochain fichier** indiqué ci-dessous, puis `git push` — le site se reconstruit seul.")
    lines.append("")

    for p in data["parts"]:
        pnum = p["slug"].split("-")[0]
        pcount = sum(len(s["cases"]) for s in p["sections"])
        total += pcount
        lines.append(f"## {p['icon']} Partie {ROMAN.get(pnum, pnum)} — {p['title'].replace(ROMAN.get(pnum, pnum) + ' · ', '')}")
        lines.append("")
        lines.append(f"**{pcount} cas** · dossier `docs/cases/{p['slug']}/`")
        lines.append("")
        lines.append("| Chapitre | Cas | Dernier fichier | Prochain fichier | Images |")
        lines.append("|---|---|---|---|---|")
        for s in p["sections"]:
            last = s["cases"][-1]
            m = re.match(r"cas-(\d+)-(\d+)\.md$", os.path.basename(last))
            if m:
                nxt = f"cas-{m.group(1)}-{int(m.group(2)) + 1:02d}.md"
                lastf = os.path.basename(last)
            else:
                nxt, lastf = "?", os.path.basename(last)
            chap_dir = os.path.dirname(last)
            imgs = images_count(chap_dir)
            imgtxt = f"{imgs}" if imgs else "—"
            lines.append(f"| {s['title']} | {len(s['cases'])} | `{lastf}` | `{nxt}` | {imgtxt} |")
        lines.append("")

    # priorités : chapitres avec peu de cas
    thin = []
    for p in data["parts"]:
        for s in p["sections"]:
            if len(s["cases"]) < 5:
                thin.append((len(s["cases"]), p["title"], s["title"]))
    thin.sort()
    lines.append("## 🎯 Chapitres à compléter en priorité")
    lines.append("")
    lines.append("Chapitres contenant **moins de 5 cas** :")
    lines.append("")
    for n, pt, st in thin:
        lines.append(f"- **{st}** ({pt}) — {n} cas seulement")
    lines.append("")
    lines.append(f"**Total : {total} cas publiés.**")
    lines.append("")

    out = os.path.join(ROOT, "CHAPTERS.md")
    with open(out, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"OK → {out} ({total} cas)")


if __name__ == "__main__":
    main()
