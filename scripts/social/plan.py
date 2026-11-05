"""Programme des figures de la semaine (sujets validés le 5 nov. 2026).

usage : python3 scripts/social/plan.py still|video <dossier_sortie> [slug ...]
"""
import os, subprocess, sys

H = "data/seeds/history/"; S = "data/seeds/social/"
PLAN = [
    dict(slug="debt", data=S + "gross-debt-imf.psv", countries="JP,IT,US,FR,GB", start=2001, end=2030, unit="%",
         title="The weight of debt", subtitle="Government gross debt, % of GDP (2025–2030: IMF projections)", source="IMF, World Economic Outlook"),
    dict(slug="wealth-200y", data=H + "gdp-per-capita-maddison.psv", countries="US,GB,FR,JP,CN", start=1820, end=2022, unit="$", ymin_top=1000,
         title="200 years of wealth", subtitle="GDP per capita, international dollars at 2011 prices", source="Maddison Project Database 2023"),
    dict(slug="oldest", data=H + "median-age.psv", top=5, rank_year=2025, minpop=1e6, start=1950, end=2100,
         title="The oldest countries on Earth", subtitle="Median age in years — countries over 1 million people (2024–2100: UN projections)", source="United Nations, World Population Prospects 2024"),
    dict(slug="fields", data=H + "fields-medalists-cumulative.psv", top=5, start=1936, end=2026, fill0=True,
         title="Who wins the Fields Medal?", subtitle="Fields medalists born in each country (current borders), since 1936", source="International Mathematical Union"),
    dict(slug="military", data=H + "military-expenditure-gdp-sipri.psv", top=5, rank_year=2025, minpop=1e6, start=1949, end=2025, unit="%",
         title="The price of war", subtitle="Military expenditure, % of GDP — top 5 in 2025", source="SIPRI Military Expenditure Database"),
    dict(slug="nobel-top10", data=H + "nobel-laureates-cumulative.psv", top=10, start=1901, end=2025, fill0=True,
         title="Who wins the Nobel Prize?", subtitle="Top 10 countries by laureates born there (current borders), since 1901", source="Nobel Foundation"),
    dict(slug="births", data=S + "birth-rate.psv", countries="KR,CN,JP,IT,FR", start=1960, end=2024,
         title="The end of babies?", subtitle="Births per 1,000 people per year", source="World Bank, World Development Indicators"),
    dict(slug="rd", data=S + "rd-expenditure-gdp.psv", top=5, rank_year=2021, minpop=1e6, start=1996, end=2023, unit="%",
         title="Who invents the future?", subtitle="Research & development spending, % of GDP", source="World Bank (UNESCO Institute for Statistics)"),
    dict(slug="industry", data=S + "industry-share-gdp.psv", countries="CN,DE,US,GB,FR", start=1970, end=2024, unit="%",
         title="Factories vs services", subtitle="Industry, % of GDP — the rest is mostly services", source="World Bank, World Development Indicators"),
    dict(slug="co2", data=S + "co2-emissions-total.psv", top=5, start=1970, end=2024,
         title="Who emits the most CO2?", subtitle="CO2 emissions, million tonnes per year", source="World Bank (EDGAR)"),
    dict(slug="world-2100", data=H + "population-un-wpp.psv", top=5, rank_year=2100, start=1950, end=2100,
         title="The world in 2100", subtitle="Population — top 5 in 2100 (2024–2100: UN projections)", source="United Nations, World Population Prospects 2024"),
    dict(slug="satellites", data=S + "satellites-in-orbit.psv", top=5, start=1957, end=2026,
         title="Who owns the sky?", subtitle="Satellites in Earth orbit by owner country, active or not (end of year)", source="CelesTrak satellite catalog · count by Statlas Research"),
    dict(slug="richest-top10", data=H + "gdp-per-capita-maddison.psv", top=10, rank_year=2022, minpop=1e6, start=1950, end=2022, unit="$", ymin_top=1000,
         title="The richest countries", subtitle="GDP per capita, 2011 international dollars — countries over 1 million people", source="Maddison Project Database 2023"),
]


def args(c, out, still):
    a = ["python3", "scripts/social/race.py", "--theme", c.get("theme", "statlas"), "--out", out]
    for k in ("data", "countries", "top", "start", "end", "unit", "title", "subtitle", "source", "rank_year", "minpop", "proj_from", "ymin_top", "exclude"):
        if k in c:
            a += ["--" + k.replace("_", "-"), str(c[k])]
    if c.get("fill0"): a.append("--fill0")
    if still: a.append("--still")
    return a


if __name__ == "__main__":
    mode, outdir, only = sys.argv[1], sys.argv[2], sys.argv[3:]
    os.makedirs(outdir, exist_ok=True)
    for c in PLAN:
        if only and c["slug"] not in only: continue
        out = f"{outdir}/{c['slug']}." + ("png" if mode == "still" else "mp4")
        r = subprocess.run(args(c, out, mode == "still"), capture_output=True, text=True)
        print(c["slug"], "ok" if r.returncode == 0 else "ERREUR\n" + r.stderr[-800:], flush=True)
