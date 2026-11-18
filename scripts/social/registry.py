"""Registre des visuels déjà produits (vidéos et images), pour ne pas refaire deux fois le même graphique.

Règle (Clem, 18 nov. 2026) : ne jamais reproduire un graphique existant. Le même indicateur peut resservir,
mais avec d'autres pays ou un autre angle (autre format, autre période).

  python3 scripts/social/registry.py list
  python3 scripts/social/registry.py check --indicator fertility-rate --countries KR,CN,IN,US,NG --format lines
  python3 scripts/social/registry.py check --indicator population-un-wpp --selection "top 5 in 2100" --format lines

`check` sort avec le code 1 si un visuel identique existe (même indicateur, même format, mêmes pays ou même
sélection) et liste dans tous les cas ce qui existe déjà sur cet indicateur. Après avoir produit un visuel,
ajouter son entrée dans registry.json (même commit que le visuel).
"""
import argparse, json, os, sys

PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "registry.json")


def load():
    return json.load(open(PATH, encoding="utf-8"))["visuals"]


def key(v):
    return (",".join(sorted(v["countries"])) if v.get("countries") else (v.get("selection") or "").strip().lower())


def main():
    p = argparse.ArgumentParser(); sub = p.add_subparsers(dest="cmd", required=True)
    sub.add_parser("list")
    c = sub.add_parser("check")
    c.add_argument("--indicator", required=True); c.add_argument("--countries", default=""); c.add_argument("--selection", default="")
    c.add_argument("--format", required=True, choices=["lines", "bars", "ranking", "map", "key_figure"])
    a = p.parse_args(); rows = load()
    if a.cmd == "list":
        for v in sorted(rows, key=lambda v: (v["indicator"], v["made"])):
            print(f'{v["indicator"]:38} {v["format"]:10} {v["kind"]:5} {key(v):32} {v.get("period", ""):11} {v["slug"]}')
        print(len(rows), "visuals"); return
    want = dict(countries=[x for x in a.countries.upper().split(",") if x], selection=a.selection)
    same = [v for v in rows if v["indicator"] == a.indicator]
    dup = [v for v in same if v["format"] == a.format and key(v) == key(want)]
    for v in same:
        print(("DUPLICATE  " if v in dup else "same data  ") + f'{v["slug"]} — {v["format"]}, {key(v)}, {v.get("period", "")} ({v["channel"]})')
    if not same: print("nothing yet on this indicator")
    sys.exit(1 if dup else 0)


if __name__ == "__main__":
    main()
