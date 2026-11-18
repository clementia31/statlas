"""Image : prix Nobel par million d'habitants, top 10 des pays de plus d'un million d'habitants.

  python3 scripts/social/nobel_per_million.py sortie.png
Lauréats par pays de naissance (frontières actuelles), 1901-2026, rapportés à la population estimée de 2023 (ONU, dernière
année observée). Le ratio est calculé par nous : crédit « Statlas Research ».
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bars
from bars import render

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..")


def last(path, year=None):
    out = {}
    for line in open(os.path.join(ROOT, path), encoding="utf-8"):
        if line.startswith("#") or not line.strip(): continue
        iso, y, v = line.strip().split("|")[:3]
        if year is None or int(y) == year: out[iso] = (int(y), float(v)) if year is None and (iso not in out or int(y) > out[iso][0]) else out.get(iso, (int(y), float(v)))
    return {k: v[1] for k, v in out.items()}


nobel = last("data/seeds/history/nobel-laureates-cumulative.psv")
pop = last("data/seeds/history/population-un-wpp.psv", 2023)
rows = sorted(((nobel[c] / pop[c] * 1e6, c, int(nobel[c])) for c in nobel if pop.get(c, 0) >= 1e6), reverse=True)
for rank, (v, c, n) in enumerate(rows[:20], 1): print(rank, c, round(v, 2), n)
print("US rank:", [c for _, c, _ in rows].index("US") + 1, "of", len(rows))
bars.fmt = lambda v, unit, integer=False: f"{v:.2f}"
from race import country_name
render([(c, v, "") for v, c, n in rows[:10]], "Nobel Prizes per million people",
       "Laureates born in each country, 1901–2026, per million inhabitants", "Statlas Research · Nobel Foundation, UN World Population Prospects 2024",
       sys.argv[1], names={c: f"{country_name(c)} · {n} laureates" for v, c, n in rows[:10]}, note="Countries of more than one million people · current borders · 2023 population")
