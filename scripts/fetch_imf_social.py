"""IMF World Economic Outlook (DataMapper) → .psv pour les vidéos. Projections marquées p=1 (années > dernière année réalisée).

usage : python scripts/fetch_imf_social.py GGXWDG_NGDP=gross-debt-imf 2025
        (le dernier argument = première année de projection)
"""
import json, os, sys, time, urllib.request
import pycountry

OUT = "data/seeds/social"
proj_from = int(sys.argv[-1])
os.makedirs(OUT, exist_ok=True)
for item in sys.argv[1:-1]:
    code, name = item.split("=")
    req = urllib.request.Request(f"https://www.imf.org/external/datamapper/api/v1/{code}", headers={"User-Agent": "statlas-seeds/1.0"})
    with urllib.request.urlopen(req, timeout=120) as r:
        js = json.load(r)
    rows = []
    for iso3, ser in js["values"][code].items():
        c = pycountry.countries.get(alpha_3=iso3)
        if not c: continue
        for y, v in ser.items():
            if v is not None:
                rows.append((c.alpha_2, int(y), v, 1 if int(y) >= proj_from else 0))
    rows.sort()
    with open(f"{OUT}/{name}.psv", "w") as f:
        f.write(f"# {code} — IMF World Economic Outlook (DataMapper)\n# Retrieved {time.strftime('%Y-%m-%d')}; years >= {proj_from} are IMF projections\n")
        for r in rows: f.write("|".join(map(str, r)) + "\n")
    print(name, len(rows))
