#!/usr/bin/env python3
"""Génère public/data/search-index.json et public/data/cases.json pour le site Astro.

Utilisation :  python3 scripts/gen_astro_indexes.py
(ne dépend d'aucune bibliothèque externe ; exécuté avant `astro build` en CI)
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))
from gen_search_index import VARIANTS, clean_text, norm  # noqa: E402

STRUCTURE = json.loads((ROOT / "src" / "lib" / "structure.json").read_text(encoding="utf-8"))
CONTENT = ROOT / "src" / "content" / "cases"
OUT = ROOT / "public" / "data"


def main():
    parts_out, cases_out, chapters_out = [], [], []
    tag_counts = {}
    for part in STRUCTURE:
        pslug = part["slug"]
        parts_out.append({
            "slug": pslug, "title": part["title"], "roman": part["roman"],
            "icon": part["icon"], "count": part["count"],
            "sections": [{"slug": c["slug"], "title": c["title"], "count": c["count"],
                          "cases": ["cases/{}/{}/{}".format(pslug, c["slug"], f) for f in c["cases"]]}
                         for c in part["chapters"]],
        })
        for chap in part["chapters"]:
            chapters_out.append({
                "p": pslug, "s": chap["slug"], "t": chap["title"],
                "c": ["cases/{}/{}/{}".format(pslug, chap["slug"], f) for f in chap["cases"]],
            })
            for fname in chap["cases"]:
                rel = "cases/{}/{}/{}".format(pslug, chap["slug"], fname)
                path = CONTENT / pslug / chap["slug"] / (fname + ".md")
                if not path.exists():
                    print("!! manquant :", rel, file=sys.stderr)
                    continue
                raw = path.read_text(encoding="utf-8")
                import re
                m = re.match(r"^---\ntitle:\s*[\"']?(.+?)[\"']?\s*\n", raw)
                label = m.group(1) if m else fname
                clean = clean_text(raw)
                ntext = " " + norm(clean)[:4000] + " "
                tags = []
                for tag, variants in VARIANTS.items():
                    cnt = sum(len(rx.findall(ntext)) for _, rx in variants)
                    if cnt:
                        tags.append((tag, cnt))
                        tag_counts[tag] = tag_counts.get(tag, 0) + 1
                tags.sort(key=lambda t: -t[1])
                cases_out.append({
                    "p": pslug, "s": chap["slug"], "f": rel, "l": label,
                    "g": [t for t, _ in tags[:12]],
                    "t": clean[:3500],
                })
    tags_out = sorted(tag_counts.items(), key=lambda t: -t[1])
    search = {"parts": parts_out, "cases": cases_out, "tags": [{"n": n, "c": c} for n, c in tags_out]}
    listing = {"parts": parts_out, "chapters": chapters_out, "total": len(cases_out)}

    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "search-index.json").write_text(json.dumps(search, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    (OUT / "cases.json").write_text(json.dumps(listing, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print("OK : {} cas, {} tags -> public/data/ ({:.0f} Ko)".format(
        len(cases_out), len(tags_out),
        (OUT / "search-index.json").stat().st_size / 1024))


if __name__ == "__main__":
    main()
