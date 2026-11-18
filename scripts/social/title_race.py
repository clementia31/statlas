"""Course de barres générique pour un fichier de totaux cumulés (titres, victoires…).

  python3 scripts/social/title_race.py --data data/seeds/sport/football-champions-league-clubs-titles.psv \
      --start 1956 --end 2026 --top 9 --title "..." --subtitle "..." --source "Statlas Research" --note "..." --out x.mp4
"""
import argparse, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from barrace import render

p = argparse.ArgumentParser()
for k in ("data", "title", "subtitle", "source", "out"): p.add_argument("--" + k, required=True)
p.add_argument("--note", default=""); p.add_argument("--start", type=int, required=True); p.add_argument("--end", type=int, required=True)
p.add_argument("--top", type=int, default=10)
a = p.parse_args()

data = {}
for line in open(a.data, encoding="utf-8"):
    if line.startswith("#") or not line.strip(): continue
    iso, year, value = line.strip().split("|")[:3]
    data.setdefault(iso, {})[int(year)] = int(float(value))
table, cur = {}, {}
for y in range(a.start, a.end + 1):
    for iso, series in data.items():
        if y in series: cur[iso] = series[y]
    table[y] = dict(cur)
render(table, {}, a.title, a.subtitle, a.source, a.out, top=a.top, note=a.note)
print("ok")
