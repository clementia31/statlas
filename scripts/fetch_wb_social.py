"""Télécharge des séries Banque mondiale (pays seulement, sans agrégats) au format .psv pour les vidéos.

usage : python scripts/fetch_wb_social.py SP.DYN.CBRT.IN=birth-rate NV.IND.TOTL.ZS=industry-share-gdp ...
Sortie : data/seeds/social/<nom>.psv  (iso2|year|value|0)
"""
import json, os, sys, time, urllib.request

OUT = "data/seeds/social"
API = "https://api.worldbank.org/v2"


def get(url):
    for k in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "statlas-seeds/1.0"}), timeout=60) as r:
                return json.load(r)
        except Exception as e:
            print("retry", url, e); time.sleep(5 * (k + 1))
    raise SystemExit(f"failed {url}")


def countries():
    meta = get(f"{API}/country?format=json&per_page=400")[1]
    return {c["iso2Code"] for c in meta if c["region"]["id"] != "NA"}   # NA = agrégat


def main():
    os.makedirs(OUT, exist_ok=True)
    ok = countries()
    for item in sys.argv[1:]:
        code, name = item.split("=")
        page, rows, info = 1, [], None
        while True:
            res = get(f"{API}/country/all/indicator/{code}?format=json&per_page=20000&page={page}")
            info, data = res[0], res[1] or []
            rows += [(d["country"]["id"], int(d["date"]), d["value"]) for d in data if d["value"] is not None and d["country"]["id"] in ok]
            if page >= info["pages"]: break
            page += 1
        title = data[0]["indicator"]["value"] if data else code
        rows.sort()
        with open(f"{OUT}/{name}.psv", "w") as f:
            f.write(f"# {title} — World Bank, World Development Indicators ({code})\n")
            f.write(f"# Retrieved {time.strftime('%Y-%m-%d')} from api.worldbank.org\n")
            for iso, y, v in rows:
                f.write(f"{iso}|{y}|{v}|0\n")
        print(name, len(rows), "rows")


if __name__ == "__main__":
    main()
