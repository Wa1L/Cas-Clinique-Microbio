#!/usr/bin/env python3
"""Migre le contenu MkDocs (docs/) vers Astro (src/content + public).

 - docs/cases/**/*.md  -> src/content/cases/**  (sup ^sup^, admonitions, images en chemins absolus)
 - docs/cases/**/images -> public/cases/**
 - .pages               -> src/lib/structure.json (parties, chapitres, icônes, compteurs)
"""
import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "docs" / "cases"
DST = ROOT / "src" / "content" / "cases"
PUB = ROOT / "public" / "cases"
BASE = "/Cas-Clinique-Microbio"

ICONS = {
    "01-resistance-aux-antibiotiques": "🧪",
    "02-virologie": "🦠",
    "03-bacteriologie": "🧫",
    "04-mix": "🔀",
}
ROMANS = {
    "01-resistance-aux-antibiotiques": "I",
    "02-virologie": "II",
    "03-bacteriologie": "III",
    "04-mix": "IV",
}

# ------------------------------------------------------------ helpers
def read_pages(d: Path) -> dict:
    p = d / ".pages"
    if not p.exists():
        return {}
    out = {}
    for line in p.read_text(encoding="utf-8").splitlines():
        m = re.match(r"^(title|nav):\s*(.*)$", line.strip())
        if m:
            out[m.group(1)] = m.group(2).strip()
    return out


SUP_RE = re.compile(r"\^([^\^\s][^\^]{0,80}?)\^")

def fix_superscript(text: str) -> str:
    return SUP_RE.sub(r"<sup>\1</sup>", text)

ADM_RE = re.compile(r"^!!!\s+(\w+)(?:\s+\"([^\"]*)\")?\s*$", re.M)

def fix_admonition(text: str) -> str:
    """!!! note "T" + bloc indenté  ->  div.admonition"""
    lines = text.splitlines()
    out, i = [], 0
    while i < len(lines):
        m = ADM_RE.match(lines[i])
        if not m:
            out.append(lines[i]); i += 1; continue
        kind, title = m.group(1), m.group(2) or kind.capitalize()
        i += 1
        block = []
        while i < len(lines) and (lines[i].startswith(("    ", "\t")) or lines[i].strip() == ""):
            block.append(lines[i][4:] if lines[i].startswith("    ") else lines[i])
            i += 1
        while block and block[-1].strip() == "":
            block.pop()
        body = "\n".join(block)
        out.append(f'<div class="adm adm-{kind}"><div class="adm-title">{title}</div><div class="adm-body">\n\n{body}\n\n</div></div>')
    return "\n".join(out)


def fix_images(text: str, part: str, chap: str) -> str:
    return re.sub(r"\]\((images/)", f"]({BASE}/cases/{part}/{chap}/\\1", text)


def case_label(stem: str) -> str:
    m = re.match(r"^cas-(\d+)-(\d+)$", stem)
    if m:
        return f"Cas {m.group(1)}.{int(m.group(2))}"
    return stem.replace("-", " ").capitalize()


# ------------------------------------------------------------ main
if DST.exists():
    shutil.rmtree(DST)
if (ROOT / "public" / "cases").exists():
    shutil.rmtree(ROOT / "public" / "cases")
DST.mkdir(parents=True)
PUB.mkdir(parents=True)

structure = []
for part_dir in sorted(p for p in SRC.iterdir() if p.is_dir()):
    pslug = part_dir.name
    pmeta = read_pages(part_dir)
    ptitle = pmeta.get("title", pslug).replace("·", "·")
    # nettoie le préfixe romain « I · »
    m = re.match(r"^([IVX]+)\s*·\s*(.+)$", ptitle)
    roman, ptitle_short = (m.group(1), m.group(2).strip()) if m else (ROMANS.get(pslug, ""), ptitle)

    chapters = []
    for chap_dir in sorted(c for c in part_dir.iterdir() if c.is_dir()):
        cslug = chap_dir.name
        cmeta = read_pages(chap_dir)
        ctitle = cmeta.get("title", cslug.replace("-", " ").capitalize())

        # --- images -> public/cases/...
        img_src = chap_dir / "images"
        if img_src.exists():
            shutil.copytree(img_src, PUB / pslug / cslug / "images", dirs_exist_ok=True)

        # --- cas -> src/content/cases/...
        cases = []
        for md in sorted(chap_dir.glob("*.md")):
            if md.name == "index.md" or md.name.startswith("00-introduction"):
                continue
            txt = md.read_text(encoding="utf-8")
            txt = fix_superscript(txt)
            txt = fix_admonition(txt)
            txt = fix_images(txt, pslug, cslug)
            (DST / pslug / cslug).mkdir(parents=True, exist_ok=True)
            (DST / pslug / cslug / md.name).write_text(txt, encoding="utf-8")
            cases.append(md.stem)
        chapters.append({"slug": cslug, "title": ctitle, "cases": cases, "count": len(cases)})

    structure.append({
        "slug": pslug, "title": ptitle_short, "roman": roman,
        "icon": ICONS.get(pslug, "📁"),
        "chapters": chapters,
        "count": sum(c["count"] for c in chapters),
    })

out = ROOT / "src" / "lib" / "structure.json"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps(structure, ensure_ascii=False, indent=1), encoding="utf-8")

total = sum(p["count"] for p in structure)
print(f"OK : {total} cas, {sum(len(p['chapters']) for p in structure)} chapitres, {len(structure)} parties -> {out}")
