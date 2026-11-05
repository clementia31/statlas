"""IMF World Economic Outlook (DataMapper) → .psv pour les vidéos. Projections marquées p=1 (années > dernière année réalisée).

usage : python scripts/fetch_imf_social.py GGXWDG_NGDP=gross-debt-imf 2025
        (le dernier argument = première année de projection)
"""
import json, os, sys, time, urllib.parse, urllib.request
import pycountry

OUT = "data/seeds/social"
proj_from = int(sys.argv[-1])
os.makedirs(OUT, exist_ok=True)
for item in sys.argv[1:-1]:
    code, name = item.split("=")
    rows = []
    try:   # 1) DataMapper du FMI
        req = urllib.request.Request(f"https://www.imf.org/external/datamapper/api/v1/{code}",
                                     headers={"User-Agent": "Mozilla/5.0 (X11; Linux x86_64)", "Accept": "application/json"})
        with urllib.request.urlopen(req, timeout=120) as r:
            js = json.load(r)
        for iso3, ser in js["values"][code].items():
            c = pycountry.countries.get(alpha_3=iso3)
            if c:
                rows += [(c.alpha_2, int(y), v, 1 if int(y) >= proj_from else 0) for y, v in ser.items() if v is not None]
    except Exception as e:   # 2) miroir DBnomics du WEO
        print("DataMapper indisponible :", e, "-> DBnomics")
        dims = urllib.parse.quote(json.dumps({"weo-subject": [code]}))
        url = f"https://api.db.nomics.world/v22/series/IMF/WEO:latest?dimensions={dims}&observations=1&limit=1000"
        with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "statlas-seeds/1.0"}), timeout=120) as r:
            js = json.load(r)
        for doc in js["series"]["docs"]:
            c = pycountry.countries.get(alpha_3=doc["dimensions"].get("weo-country", ""))
            if not c: continue
            for y, v in zip(doc["period"], doc["value"]):
                if isinstance(v, (int, float)):
                    rows.append((c.alpha_2, int(str(y)[:4]), v, 1 if int(str(y)[:4]) >= proj_from else 0))
    rows.sort()
    with open(f"{OUT}/{name}.psv", "w") as f:
        f.write(f"# {code} — IMF World Economic Outlook (DataMapper)\n# Retrieved {time.strftime('%Y-%m-%d')}; years >= {proj_from} are IMF projections\n")
        for r in rows: f.write("|".join(map(str, r)) + "\n")
    print(name, len(rows))
