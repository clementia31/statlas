# -*- coding: utf-8 -*-
"""
Téléchargement des jeux de données ouverts pour Statlas, convertis au format des seeds :
  data/seeds/<lot>/<slug>.psv   iso2|year|value|projection   (en-tête : source, document, date de récupération)
  data/seeds/<lot>/report.json  ce qui a été récupéré ou non

Sources : Our World in Data (qui redistribue V-Dem avec la citation d'origine),
et l'API officielle de la Fondation Nobel.

Ne sont PLUS collectés ici (règle : charger depuis l'organisme d'origine, licence vérifiée) :
- gdp-per-capita-maddison, conflict-deaths, population-un-wpp et median-age : fichiers construits depuis les fichiers officiels
  (Maddison Project Database 2023, UCDP Country-Year 26.1, ONU World Population Prospects 2024). Ce script ne doit pas les écraser.
- military-expenditure-gdp-sipri : la licence SIPRI interdit l'import. Les agrégats (continents, monde, groupes de revenus) sont exclus :
seuls les pays avec un code ISO sont gardés.
"""
import datetime as dt
import io
import json
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

import pandas as pd
import pycountry

OUT = Path(__file__).resolve().parent.parent / "data" / "seeds" / "history"
UA = "Statlas-seeds/1.0 (open data import)"
TODAY = dt.date.today().isoformat()

# Médaille Fields : Wikidata (lauréats, année, lieu de naissance)
# slug Statlas : (graphiques OWID candidats, nom, catégorie, unité, higher_is_better, définition, éditeur d'origine, jeu d'origine)
SETS = {
    "electoral-democracy-index": (["electoral-democracy-index"],
        "Electoral democracy index (V-Dem)", "politics", "index 0-1", True,
        "Extent to which the ideal of electoral democracy is achieved: free and fair elections, freedom of expression and association, suffrage.",
        "V-Dem Institute (University of Gothenburg)", "Varieties of Democracy (V-Dem) dataset"),
    "liberal-democracy-index": (["liberal-democracy-index"],
        "Liberal democracy index (V-Dem)", "politics", "index 0-1", True,
        "Electoral democracy combined with protection of individual and minority rights, rule of law and checks on the executive.",
        "V-Dem Institute (University of Gothenburg)", "Varieties of Democracy (V-Dem) dataset"),
}


def get(url, accept=None):
    h = {"User-Agent": UA}
    if accept:
        h["Accept"] = accept
    for k in range(3):
        try:
            return urllib.request.urlopen(urllib.request.Request(url, headers=h), timeout=120).read()
        except Exception as exc:
            last = exc
            time.sleep(5 * (k + 1))
    raise last


def iso2(code):
    c = pycountry.countries.get(alpha_3=str(code))
    if c:
        return c.alpha_2
    return {"XKX": "XK", "OWID_KOS": "XK"}.get(str(code))


def write(slug, header, rows):
    p = OUT / f"{slug}.psv"
    p.parent.mkdir(parents=True, exist_ok=True)
    with open(p, "w") as f:
        f.write("".join(f"# {h}\n" for h in header))
        f.write("# iso2|year|value|projection\n")
        for r in rows:
            f.write("|".join(str(x) for x in r) + "\n")


def owid(slug, spec, report):
    charts, name, cat, unit, hib, defin, publisher, dataset = spec
    for ch in charts:
        try:
            df = pd.read_csv(io.BytesIO(get(f"https://ourworldindata.org/grapher/{ch}.csv?v=1&csvType=full&useColumnShortNames=false")))
        except Exception as exc:
            report[slug] = {"chart": ch, "error": repr(exc)}
            continue
        vals = [c for c in df.columns if c not in ("Entity", "Code", "Year", "Day")]
        rows = []
        proj_cols = [c for c in vals if "project" in c.lower() or "medium" in c.lower()]
        vals = [c for c in vals if "annotation" not in c.lower() and "region" not in c.lower()]
        proj_cols = [c for c in proj_cols if c in vals]
        main = [c for c in vals if c not in proj_cols]
        for _, r in df.iterrows():
            i2 = iso2(r["Code"]) if isinstance(r["Code"], str) else None
            if not i2:
                continue
            y = int(r["Year"])
            v = r[main[0]] if main else float("nan")
            proj = 0
            if (v != v) and proj_cols:
                v, proj = r[proj_cols[0]], 1
            if v == v:
                rows.append((i2, y, round(float(v), 6), proj))
        try:
            meta = json.loads(get(f"https://ourworldindata.org/grapher/{ch}.metadata.json"))
            cite = (meta.get("chart", {}).get("citation") or "")[:400]
        except Exception:
            cite = ""
        write(slug, [f"{name} — {publisher}, {dataset}", f"Retrieved {TODAY} via Our World in Data (grapher/{ch})",
                     f"Citation: {cite}" if cite else "Citation: see original publisher",
                     f"Unit: {unit}; category: {cat}; higher_is_better: {hib}", f"Definition: {defin}"], rows)
        report[slug] = {"chart": ch, "rows": len(rows), "countries": len({r[0] for r in rows}),
                        "years": [min(r[1] for r in rows), max(r[1] for r in rows)] if rows else None,
                        "projections": sum(r[3] for r in rows), "columns": vals}
        return
    print(f"[{slug}] aucun graphique trouvé")


def nobel(report):
    js = json.loads(get("https://api.nobelprize.org/2.1/laureates?limit=1500&format=json", accept="application/json"))
    rows = []
    for l in js.get("laureates", []):
        birth = (l.get("birth") or {}).get("place") or {}
        cn = (birth.get("countryNow") or {}).get("en")
        for p in l.get("nobelPrizes", []):
            rows.append({"laureate": (l.get("knownName") or l.get("orgName") or {}).get("en"), "year": int(p["awardYear"]),
                         "category": (p.get("category") or {}).get("en"), "birth_country_now": cn,
                         "kind": "organization" if "orgName" in l else "person"})
    df = pd.DataFrame(rows)
    names = {c.name: c.alpha_2 for c in pycountry.countries}
    names.update({"USA": "US", "United Kingdom": "GB", "Russia": "RU", "the Netherlands": "NL", "South Korea": "KR",
                  "Iran": "IR", "Czech Republic": "CZ", "Taiwan": "TW", "Vietnam": "VN", "Bosnia and Herzegovina": "BA",
                  "Venezuela": "VE", "Bolivia": "BO", "Tanzania": "TZ", "Syria": "SY", "Moldova": "MD", "North Macedonia": "MK",
                  "Scotland": "GB", "Northern Ireland": "GB", "Faroe Islands (Denmark)": "DK", "Guadeloupe Island": "FR", "Guadeloupe, France": "FR",
                  "Democratic Republic of the Congo": "CD", "Republic of Macedonia": "MK", "East Timor": "TL", "Turkey": "TR"})
    df["iso2"] = df["birth_country_now"].map(lambda x: names.get(x) if isinstance(x, str) else None)
    # territoires rattachés à leur pays (nationalité) : Guadeloupe -> France, îles Féroé -> Danemark
    p = OUT / "nobel-laureates.csv"
    df.to_csv(p, index=False)
    per = df[df["kind"] == "person"].dropna(subset=["iso2"])
    cum = []
    for c, g in per.groupby("iso2"):
        counts = g.groupby("year").size().sort_index().cumsum()
        counts = counts.reindex(range(int(counts.index.min()), dt.date.today().year + 1)).ffill()   # une valeur chaque année
        cum += [(c, int(y), int(v), 0) for y, v in counts.items()]
    write("nobel-laureates-cumulative", ["Nobel laureates born in the country (current borders), cumulative — Nobel Foundation",
                                         f"Retrieved {TODAY} from api.nobelprize.org (v2.1); count computed by Statlas Research",
                                         "Unit: laureates; category: science; higher_is_better: None",
                                         "Definition: Number of individual Nobel Prize laureates born in the territory of today's country, cumulated up to the given year (organisations excluded)."], cum)
    report["nobel"] = {"laureates_rows": len(df), "unmatched_countries": sorted(set(df.loc[df["iso2"].isna() & df["birth_country_now"].notna(), "birth_country_now"]))}


def fields(report):
    """Médaille Fields : lauréats, année et pays de naissance (frontières actuelles), via Wikidata."""
    q = """SELECT ?p ?pLabel ?year ?cc WHERE {
      ?p p:P166 ?st . ?st ps:P166 wd:Q28835 . OPTIONAL { ?st pq:P585 ?t . BIND(YEAR(?t) AS ?year) }
      OPTIONAL { ?p wdt:P19 ?place . ?place wdt:P17 ?c . ?c wdt:P297 ?cc . }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en". } }"""
    url = "https://query.wikidata.org/sparql?format=json&query=" + urllib.parse.quote(q)
    js = json.loads(get(url, accept="application/sparql-results+json"))
    rows = {}
    for b in js["results"]["bindings"]:
        key = b["p"]["value"]
        r = rows.setdefault(key, {"medalist": b["pLabel"]["value"], "year": None, "iso2": set()})
        if "year" in b:
            r["year"] = int(b["year"]["value"])
        if "cc" in b:
            r["iso2"].add(b["cc"]["value"])
    df = pd.DataFrame([{"medalist": r["medalist"], "year": r["year"], "iso2": "/".join(sorted(r["iso2"])) or None} for r in rows.values()])
    # pays de naissance ambigu dans Wikidata : on suit l'Union mathématique internationale (note de méthode)
    IMU = {"Elon Lindenstrauss": "IL"}
    df["iso2"] = [IMU.get(m, c) for m, c in zip(df["medalist"], df["iso2"])]
    df.sort_values("year").to_csv(OUT / "fields-medalists.csv", index=False)
    ok = df[df["iso2"].notna() & df["year"].notna() & ~df["iso2"].fillna("").str.contains("/")]   # pays de naissance ambigu : écarté
    cum = []
    for c, g in ok.groupby("iso2"):
        counts = g.groupby("year").size().sort_index().cumsum()
        counts.index = counts.index.astype(int)
        counts = counts.reindex(range(int(counts.index.min()), dt.date.today().year + 1)).ffill()
        cum += [(c, int(y), int(v), 0) for y, v in counts.items()]
    write("fields-medalists-cumulative", ["Fields Medal laureates born in the country (current borders), cumulative — International Mathematical Union",
                                          f"Retrieved {TODAY} from Wikidata (award received: Fields Medal, place of birth); count computed by Statlas Research",
                                          "Unit: laureates; category: science; higher_is_better: None",
                                          "Definition: Number of Fields Medal laureates born in the territory of today's country, cumulated up to the given year."], cum)
    report["fields"] = {"medalists": int(len(df)), "counted": int(len(ok)),
                        "excluded_unclear_birthplace": df.loc[~df.index.isin(ok.index), "medalist"].tolist()}


def main():
    report = {}
    for slug, spec in SETS.items():
        owid(slug, spec, report)
    for fn, key in ((nobel, "nobel"), (fields, "fields")):
        try:
            fn(report)
        except Exception as exc:
            report[key] = {"error": repr(exc)}
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "report.json").write_text(json.dumps(report, indent=1, ensure_ascii=False))
    print(json.dumps(report, indent=1, ensure_ascii=False))


if __name__ == "__main__":
    main()
