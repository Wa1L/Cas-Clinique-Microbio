#!/usr/bin/env python3
"""Génère docs/assets/search-index.json :
 - liste des parties (pour les filtres)
 - chaque cas : chemin, libellé, texte intégral (recherche), tags germes/antibiotiques
 - fréquence globale des tags (pour les chips de la page Recherche)

Utilisation :  python3 scripts/gen_search_index.py
"""
import json
import re
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DOCS = ROOT / "docs"
MANIFEST = ROOT / "scripts" / "manifest.json"
if not MANIFEST.exists():  # environnement de travail local
    MANIFEST = Path("/home/z/my-project/scripts/manifest.json")

ICONS = {
    "01-resistance-aux-antibiotiques": "🧪",
    "02-virologie": "🦠",
    "03-bacteriologie": "🧫",
    "04-mix": "🔀",
}

# ------------------------------------------------------------- vocabulaire
# tag -> variantes (normalisées sans accents, en minuscules)
VOCAB = {
    # ---- bactéries
    "Staphylococcus aureus": ["staphylococcus aureus", "s. aureus", "sarm", "saureus"],
    "Staphylococcus epidermidis": ["staphylococcus epidermidis", "s. epidermidis", "epidermidis"],
    "Staphylococcus saprophyticus": ["saprophyticus"],
    "Streptococcus pyogenes": ["streptococcus pyogenes", "s. pyogenes", "pyogenes", "streptocoque du groupe a"],
    "Streptococcus agalactiae": ["streptococcus agalactiae", "agalactiae", "streptocoque du groupe b"],
    "Streptococcus pneumoniae": ["streptococcus pneumoniae", "pneumocoque", "s. pneumoniae", "pneumoniae"],
    "Enterococcus faecalis": ["enterococcus faecalis", "e. faecalis", "faecalis"],
    "Enterococcus faecium": ["enterococcus faecium", "e. faecium", "faecium"],
    "Escherichia coli": ["escherichia coli", "e. coli", "ecoli"],
    "Klebsiella pneumoniae": ["klebsiella pneumoniae", "klebsiella"],
    "Klebsiella oxytoca": ["klebsiella oxytoca", "oxytoca"],
    "Proteus mirabilis": ["proteus mirabilis", "mirabilis"],
    "Proteus vulgaris": ["proteus vulgaris", "vulgaris"],
    "Enterobacter cloacae": ["enterobacter cloacae", "enterobacter"],
    "Serratia marcescens": ["serratia marcescens", "serratia"],
    "Citrobacter": ["citrobacter"],
    "Morganella morganii": ["morganella"],
    "Providencia": ["providencia"],
    "Salmonella typhi": ["salmonella typhi", "s. typhi", "typhi", "fievre typhoide"],
    "Salmonella paratyphi": ["paratyphi"],
    "Salmonella (autres sérotypes)": ["salmonella enterica", "salmonelle"],
    "Shigella": ["shigella", "shigellose"],
    "Yersinia pestis": ["yersinia pestis", "peste"],
    "Yersinia enterocolitica": ["yersinia enterocolitica"],
    "Vibrio cholerae": ["vibrio cholerae", "cholera"],
    "Campylobacter": ["campylobacter"],
    "Helicobacter pylori": ["helicobacter pylori", "h. pylori"],
    "Pseudomonas aeruginosa": ["pseudomonas aeruginosa", "p. aeruginosa", "pyocyanique", "pyocyanea"],
    "Acinetobacter baumannii": ["acinetobacter baumannii", "acinetobacter"],
    "Stenotrophomonas maltophilia": ["stenotrophomonas"],
    "Burkholderia cepacia": ["burkholderia"],
    "Haemophilus influenzae": ["haemophilus influenzae", "h. influenzae"],
    "Bordetella pertussis": ["bordetella pertussis", "coqueluche", "pertussis"],
    "Legionella pneumophila": ["legionella", "legionellose"],
    "Neisseria meningitidis": ["neisseria meningitidis", "meningocoque", "meningitidis"],
    "Neisseria gonorrhoeae": ["neisseria gonorrhoeae", "gonocoque", "gonorrhoeae"],
    "Moraxella catarrhalis": ["moraxella", "catarrhalis"],
    "Listeria monocytogenes": ["listeria", "listeriose"],
    "Corynebacterium diphtheriae": ["corynebacterium diphtheriae", "diphterie", "diphtheriae"],
    "Bacillus anthracis": ["bacillus anthracis", "charbon"],
    "Clostridium tetani": ["clostridium tetani", "tetanos"],
    "Clostridium perfringens": ["clostridium perfringens", "perfringens", "gangrene gazeuse"],
    "Clostridium botulinum": ["clostridium botulinum", "botulisme"],
    "Clostridioides difficile": ["clostridium difficile", "clostridioides difficile"],
    "Mycobacterium tuberculosis": ["mycobacterium tuberculosis", "tuberculose"],
    "Mycobacterium leprae": ["mycobacterium leprae", "lepre"],
    "Mycobactéries atypiques": ["mycobacterie atypique", "mycobacteries atypiques", "mott"],
    "Nocardia": ["nocardia", "nocardiose"],
    "Actinomyces": ["actinomyces", "actinomycose"],
    "Mycoplasma pneumoniae": ["mycoplasma pneumoniae", "mycoplasme"],
    "Ureaplasma": ["ureaplasma"],
    "Chlamydia trachomatis": ["chlamydia trachomatis", "chlamydiae", "chlamydia"],
    "Chlamydophila psittaci": ["psittaci", "ornithose"],
    "Rickettsia": ["rickettsia", "rickettsiose"],
    "Coxiella burnetii": ["coxiella burnetii", "fievre q"],
    "Bartonella": ["bartonella"],
    "Brucella": ["brucella", "brucellose", "fievre de malte"],
    "Francisella tularensis": ["francisella", "tularemie"],
    "Pasteurella multocida": ["pasteurella"],
    "Leptospira": ["leptospira", "leptospirose"],
    "Borrelia burgdorferi": ["borrelia", "lyme"],
    "Treponema pallidum": ["treponema pallidum", "syphilis"],
    "Bactéries anaérobies": ["anaerobie", "anaerobies", "bacteroides"],
    "Gardnerella vaginalis": ["gardnerella"],
    "Candida albicans": ["candida albicans", "candidose", "candida"],
    "Aspergillus": ["aspergillus", "aspergillose"],
    "Cryptococcus neoformans": ["cryptococcus", "cryptococcose"],
    # ---- virus
    "VIH / SIDA": ["vih", "sida"],
    "Virus de l'hépatite B": ["hepatite b", "vhb", "hbsag", "hbv"],
    "Virus de l'hépatite C": ["hepatite c", "vhc", "hcv"],
    "Virus de l'hépatite A": ["hepatite a", "vha", "hav"],
    "Virus de l'hépatite E": ["hepatite e", "vhe", "hev"],
    "Herpès simplex (HSV)": ["herpes", "hsv-1", "hsv-2", "hsv1", "hsv2", "vhs"],
    "Varicelle / VZV": ["varicelle", "vzv", "zona"],
    "CMV": ["cmv", "cytomegalovirus", "cytomegalie"],
    "EBV": ["ebv", "epstein-barr", "mononucleose"],
    "Virus de la grippe": ["grippe", "influenza", "h1n1", "h3n2", "h5n1"],
    "Rougeole": ["rougeole"],
    "Rubéole": ["rubeole"],
    "Oreillons": ["oreillons"],
    "Rotavirus": ["rotavirus"],
    "Norovirus": ["norovirus", "norwalk"],
    "Adénovirus": ["adenovirus"],
    "VRS (bronchiolite)": ["vrs", "virus respiratoire syncytial", "bronchiolite"],
    "SARS-CoV-2 / COVID-19": ["sars-cov-2", "covid"],
    "Coronavirus": ["coronavirus"],
    "Rhinovirus": ["rhinovirus"],
    "Enterovirus": ["enterovirus", "coxsackie", "echovirus"],
    "HPV (papillomavirus)": ["hpv", "papillomavirus", "condylome"],
    "Parvovirus B19": ["parvovirus", "b19"],
    "Virus de la rage": ["rage", "rhabdovirus", "lyssavirus"],
    "Dengue": ["dengue"],
    "Chikungunya": ["chikungunya"],
    "Zika": ["zika"],
    "Fièvre jaune": ["fievre jaune"],
    "West Nile": ["west nile"],
    "Ebola": ["ebola", "filovirus"],
    "Hantavirus": ["hantavirus"],
    "MPXV (variole du singe)": ["mpox", "monkeypox", "variole du singe"],
    "HTLV": ["htlv"],
    "HHV-8": ["hhv-8", "hhv8"],
    # ---- parasites
    "Plasmodium / paludisme": ["paludisme", "plasmodium", "falciparum"],
    "Toxoplasma": ["toxoplasm", "toxoplasmose"],
    "Entamoeba histolytica": ["entamoeba", "amibiase", "histolytica"],
    "Giardia": ["giardia", "giardiose", "lamblia"],
    "Leishmania": ["leishmani", "leishmaniose"],
    "Trypanosoma": ["trypanosom"],
    "Echinococcus": ["echinococc", "kyste hydatique", "hydatid"],
    "Ascaris": ["ascaris", "ascariose"],
    "Taenia": ["taenia", "tenia"],
    "Toxocara": ["toxocara"],
    # ---- antibiotiques
    "Amoxicilline": ["amoxicilline"],
    "Amoxicilline + clavulanate": ["amoxicilline-acide clavulanique", "amoxicilline + acide clavulanique", "augmentin", "clavulanate"],
    "Pipéracilline-tazobactam": ["piperacilline-tazobactam", "tazocilline"],
    "Oxacilline / Meticilline": ["oxacilline", "meticilline", "methicilline"],
    "Céphalosporines (C1G-C5G)": ["cephalosporine", "cephalosporines", "cephalosporinique"],
    "Céfotaxime": ["cefotaxime"],
    "Ceftriaxone": ["ceftriaxone"],
    "Ceftazidime": ["ceftazidime"],
    "Céfépime": ["cefepime"],
    "Carbapénèmes": ["carbapeneme", "carbapenemes", "imipeneme", "meropeneme", "ertapeneme"],
    "Gentamicine": ["gentamicine"],
    "Amikacine": ["amikacine"],
    "Tobramycine": ["tobramycine"],
    "Vancomycine": ["vancomycine"],
    "Teicoplanine": ["teicoplanine"],
    "Linézolide": ["linezolide"],
    "Daptomycine": ["daptomycine"],
    "Tigécycline": ["tigecycline"],
    "Pristinamycine": ["pristinamycine"],
    "Macrolides": ["macrolide", "erythromycine", "azithromycine", "clarithromycine", "spiramycine"],
    "Clindamycine": ["clindamycine"],
    "Fluoroquinolones": ["fluoroquinolone", "quinolone", "ciprofloxacine", "levofloxacine", "ofloxacine", "moxifloxacine", "norfloxacine"],
    "Cotrimoxazole": ["cotrimoxazole", "trimethoprime", "bactrim", "sulfamethoxazole"],
    "Tétracyclines / doxycycline": ["doxycycline", "tetracycline", "minocycline"],
    "Colistine": ["colistine"],
    "Fosfomycine": ["fosfomycine"],
    "Nitrofurantoïne": ["nitrofurantoine", "furadantine"],
    "Rifampicine": ["rifampicine"],
    "Antituberculeux": ["isoniazide", "pyrazinamide", "ethambutol", "antituberculeux"],
    "Métronidazole": ["metronidazole", "flagyl"],
    "Aciclovir": ["aciclovir", "valaciclovir"],
    "Antirétroviraux (ARV)": ["antiretroviral", "antiretroviraux", "tritherapie", "zidovudine", "tenofovir", "efavirenz"],
    "Oseltamivir": ["oseltamivir", "tamiflu"],
    "Antifongiques": ["fluconazole", "amphotericine b", "caspofungine", "voriconazole", "antifongique"],
    # ---- phénotypes / mécanismes / outils diagnostiques
    "BLSE": ["blse"],
    "Carbapénèmases (NDM, OXA-48…)": ["carbapenemase", "ndm", "oxa-48", "kpc", "vim", "imp"],
    "BHRe / BHR": ["bhre", "bhr "],
    "PBP / mecA": ["pbp2a", "pbp2", "pbp5", "meca"],
    "Gènes van (vanA/vanB)": ["vana", "vanb", "pcr van"],
    "CMI / antibiogramme": ["cmi", "antibiogramme", "concentration minimale inhibitrice"],
    "PCR / test rapide": ["pcr", "geneexpert", "tdr "],
    "Sérologie": ["serologie", "serologique", "elisa", "western blot"],
    "Hémoculture": ["hemoculture", "hemocultures"],
    "ECBU": ["ecbu", "examen cytobacteriologique des urines"],
    "Coproculture": ["coproculture"],
    "Isolement / précautions": ["isolement ", "precautions complementaires", "precautions contact"],
}

# ------------------------------------------------------------- utilitaires
def norm(s):
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if not unicodedata.combining(c))
    return s.lower()

VARIANTS = {}
for tag, variants in VOCAB.items():
    VARIANTS[tag] = [(v, re.compile(r"(?<![a-z0-9])" + re.escape(norm(v)) + r"(?![a-z0-9])"))
                     for v in variants]

FRONT = re.compile(r"^---\n.*?\n---\n", re.S)
IMG = re.compile(r"!\[[^\]]*\]\([^)]*\)|<img[^>]*>")
HTML = re.compile(r"<[^>]+>")
MDCH = re.compile(r"[#>*`|\[\](){}]")


def clean_text(md):
    md = FRONT.sub("", md)
    md = IMG.sub(" ", md)
    md = HTML.sub(" ", md)
    md = MDCH.sub(" ", md)
    md = md.replace("\\", " ")
    md = re.sub(r"\s+", " ", md)
    return md.strip()


def main():
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    parts_out, cases_out = [], []
    tag_counts = {}
    for part in manifest["parts"]:
        pslug, ptitle = part["folder"], part["title"]
        parts_out.append({"slug": pslug, "title": ptitle, "icon": ICONS.get(pslug, "📁")})
        for sec in part["sections"]:
            sslug, stitle = sec["folder"], sec["title"]
            for fname in sec["cases"]:
                rel = "cases/{}/{}/{}".format(pslug, sslug, fname)
                path = DOCS / rel
                if not path.exists():
                    print("!! manquant :", rel, file=sys.stderr)
                    continue
                raw = path.read_text(encoding="utf-8")
                m = re.match(r"^---\ntitle:\s*[\"']?(.+?)[\"']?\s*\n", raw)
                label = m.group(1) if m else fname.replace(".md", "")
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
                    "p": pslug, "s": sslug, "f": rel, "l": label,
                    "g": [t for t, _ in tags[:12]],
                    "t": clean[:3500],
                })
    tags_out = sorted(tag_counts.items(), key=lambda t: -t[1])
    out = {
        "parts": parts_out,
        "cases": cases_out,
        "tags": [{"n": n, "c": c} for n, c in tags_out],
    }
    dest = DOCS / "assets" / "search-index.json"
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print("OK {} cas, {} tags -> {}".format(len(cases_out), len(tags_out), dest))
    print("taille : {:.0f} Ko".format(dest.stat().st_size / 1024))


if __name__ == "__main__":
    main()
