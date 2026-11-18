"""Course de barres : médailles olympiques d'été cumulées, top 10, 1896-2024.

  python3 scripts/social/olympics_race.py sortie.mp4
Données : data/seeds/sport/olympics-summer-medals.psv (convention des États successeurs, voir scripts/build_sports.py).
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from barrace import render

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..")
CITIES = {1896: "Athens", 1900: "Paris", 1904: "St. Louis", 1908: "London", 1912: "Stockholm", 1920: "Antwerp", 1924: "Paris",
          1928: "Amsterdam", 1932: "Los Angeles", 1936: "Berlin", 1948: "London", 1952: "Helsinki", 1956: "Melbourne", 1960: "Rome",
          1964: "Tokyo", 1968: "Mexico City", 1972: "Munich", 1976: "Montreal", 1980: "Moscow", 1984: "Los Angeles", 1988: "Seoul",
          1992: "Barcelona", 1996: "Atlanta", 2000: "Sydney", 2004: "Athens", 2008: "Beijing", 2012: "London", 2016: "Rio de Janeiro",
          2020: "Tokyo", 2024: "Paris"}

data = {}
for line in open(os.path.join(ROOT, "data/seeds/sport/olympics-summer-medals.psv"), encoding="utf-8"):
    if line.startswith("#") or not line.strip(): continue
    iso, year, value = line.strip().split("|")[:3]
    data.setdefault(iso, {})[int(year)] = int(float(value))

table, events, cur = {}, {}, {}
for y in range(1896, 2025):
    for iso, series in data.items():
        if y in series: cur[iso] = series[y]
    table[y] = dict(cur)
    if y in CITIES: events[y] = CITIES[y]

render(table, events, "Who wins the Summer Olympics?", "Medals won at the Summer Games since 1896, cumulative",
       "Statlas Research", sys.argv[1], note="USSR counted with Russia · East and West Germany with Germany")
print("ok")
