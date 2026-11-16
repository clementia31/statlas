"""Premières images fixes du calendrier (validées le 16 nov. 2026) : 4 statistiques + 4 citations.

Les valeurs viennent de la base Statlas (copie du 11 nov. 2026) et sont recopiées ici pour que le rendu soit reproductible.
usage : python3 scripts/social/batch_2026_11.py <dossier de sortie> <countries-110m.json de world-atlas>
"""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bars import render
from cards import keyfigure, quote, worldmap

out, topo = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)

# 1. Population en 2100 — ONU, World Population Prospects 2024, variante moyenne (projection)
POP_2100 = [("IN", 1505251761), ("CN", 633368113), ("PK", 511000618), ("NG", 476747781), ("CD", 430709445),
            ("US", 421278889), ("ET", 367289596), ("ID", 295511061), ("TZ", 262834721), ("BD", 208596516)]
render([(c, v, "") for c, v in POP_2100], "The world in 2100", "The ten most populous countries in 2100, projected population",
       "United Nations, World Population Prospects 2024", f"{out}/world-2100-top10.png",
       note="Projection: UN medium variant, not an observed figure")

# 2. Recherche et développement, % du PIB, 2023 — Banque mondiale (Institut de statistique de l'UNESCO)
RD_2023 = [("IL", 6.34589), ("LI", 6.00984), ("KR", 4.94352), ("SE", 3.59978), ("US", 3.44716),
           ("JP", 3.44125), ("BE", 3.27235), ("AT", 3.25517), ("CH", 3.22178), ("DE", 3.1539)]
import bars, race
_fmt = race.fmt
bars.fmt = lambda v, unit, integer=False: f"{v:.1f}%"
render([(c, v, "") for c, v in RD_2023], "Who invests in research?", "Research and development spending, % of GDP, 2023",
       "World Bank (UNESCO Institute for Statistics)", f"{out}/rd-top10.png",
       note="2023, the latest year with broad coverage · 84 countries with data")
bars.fmt = _fmt

# 3. Dette publique, % du PIB, 2025 — FMI, World Economic Outlook (octobre 2026)
debt = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "debt-2025.json")))["values"]
if True:
    worldmap(debt, "The weight of debt", "General government gross debt, % of GDP, 2025",
             "IMF, World Economic Outlook (October 2026)", f"{out}/debt-map.png", topo,
             note=f"{len(debt)} countries with data", vmax=150)

# 4. Âge médian du Japon — ONU, World Population Prospects 2024 (estimations, pas de projection)
keyfigure("Japan, the oldest large country", "Median age: half the population is older, half is younger",
          (1950, 21.3113), (2023, 48.9585), "years old", "United Nations, World Population Prospects 2024",
          f"{out}/japan-median-age.png", note="Highest median age among countries of over one million people (2023)")

# 5 à 8. Citations — attribution vérifiée, référence affichée
quote("All models are wrong, but some are useful.", "George E. P. Box", "Robustness in the Strategy of Scientific Model Building, 1979", f"{out}/quote-box.png")
quote("The first principle is that you must not fool yourself, and you are the easiest person to fool.", "Richard Feynman", "Caltech commencement address, 1974", f"{out}/quote-feynman.png")
quote("When you can measure what you are speaking about, and express it in numbers, you know something about it.", "Lord Kelvin", "Lecture, Institution of Civil Engineers, 3 May 1883", f"{out}/quote-kelvin.png")
quote("The theory of probabilities is at bottom nothing but common sense reduced to calculus.", "Pierre-Simon Laplace", "A Philosophical Essay on Probabilities, 1814", f"{out}/quote-laplace.png")
print("ok")
