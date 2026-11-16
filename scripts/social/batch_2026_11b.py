"""Deuxième série d'images fixes (validée le 16 nov. 2026) : 6 statistiques + 2 citations pour la semaine du 17 novembre.

Les valeurs viennent de la base Statlas (copie du 11 nov. 2026), recopiées ici ou dans data/ pour un rendu reproductible.
usage : python3 scripts/social/batch_2026_11b.py <dossier de sortie> <countries-110m.json de world-atlas>
"""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import bars, race
from bars import render
from cards import keyfigure, quote, worldmap

out, topo = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
data = lambda name: json.load(open(os.path.join(HERE, "data", name)))["values"]
_fmt = race.fmt

# 1. Femmes au parlement, % des sièges, 2025 — Banque mondiale (Union interparlementaire)
WOMEN = [("RW", 63.75), ("CU", 55.74), ("NI", 54.95), ("BO", 50.77), ("MX", 50.2), ("AE", 50.0), ("AD", 50.0), ("CR", 49.12), ("IS", 46.03), ("AU", 46.0)]
bars.fmt = lambda v, unit, integer=False: f"{v:.1f}%"
render([(c, v, "") for c, v in WOMEN], "Women in parliament", "Share of seats held by women in the national parliament, 2025",
       "World Bank (Inter-Parliamentary Union)", f"{out}/women-parliament-top10.png", note="Lower or single chamber · 184 countries with data")

# 2. Les pays les plus jeunes : âge médian 2023 — ONU (estimations), pays de plus d'un million d'habitants
YOUNG = [("CF", 14.3199), ("NE", 15.2495), ("TD", 15.4007), ("SO", 15.4468), ("ML", 15.4665), ("CD", 15.7677), ("BI", 15.9017), ("MZ", 16.323), ("AO", 16.4524), ("UG", 16.514)]
bars.fmt = lambda v, unit, integer=False: f"{v:.1f}"
render([(c, v, "") for c, v in YOUNG], "The youngest countries", "Lowest median age in years, 2023",
       "United Nations, World Population Prospects 2024", f"{out}/youngest-top10.png",
       note="Countries of over one million people · half the population is younger than this age")
bars.fmt = _fmt

# 3. Fécondité en Corée du Sud — Banque mondiale, World Development Indicators
keyfigure("Fewer than one child per woman", "South Korea, total fertility rate (average number of children per woman)",
          (1960, 5.994), (2024, 0.748), "children per woman", "World Bank, World Development Indicators",
          f"{out}/korea-fertility.png", note="Lowest rate among countries of over one million people (2024)", big="{:.2f}", small="{:.2f}")

# 4. Indice de développement humain 2023 — PNUD
worldmap(data("human-development-index-2023.json"), "Human development", "Human Development Index, 2023 (0 to 1: health, education, income)",
         "UNDP, Human Development Report", f"{out}/hdi-map.png", topo, note="193 countries with data", unit="", vmin=0.4, vmax=1.0, val="{:.2f}", more=False, topval="{:.3f}")

# 5. Utilisateurs d'internet, % de la population, 2024 — Banque mondiale (UIT)
worldmap(data("internet-users-2024.json"), "Who is online?", "Internet users, % of population, 2024",
         "World Bank (International Telecommunication Union)", f"{out}/internet-map.png", topo, note="182 countries with data", vmax=100, more=False, rank="lowest")

# 6. Énergie renouvelable, % de la consommation finale d'énergie, 2021 — Banque mondiale
worldmap(data("renewable-energy-share-2021.json"), "Renewable energy", "Renewable share of final energy consumption, %, 2021",
         "World Bank, World Development Indicators", f"{out}/renewable-map.png", topo,
         note="Includes traditional biomass such as firewood and charcoal · 196 countries with data", vmax=100, more=False)

# 7 et 8. Citations — attribution vérifiée, textes du domaine public
quote("It is a capital mistake to theorise before one has data.", "Sherlock Holmes", "Arthur Conan Doyle, A Scandal in Bohemia, 1891", f"{out}/quote-holmes.png")
quote("Some people hate the very name of statistics, but I find them full of beauty and interest.", "Francis Galton", "Natural Inheritance, 1889", f"{out}/quote-galton.png")
print("ok")
