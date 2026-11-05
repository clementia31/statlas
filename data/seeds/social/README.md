# Séries pour les vidéos réseaux sociaux

| Fichier | Source | Remarque |
|---|---|---|
| birth-rate, co2-emissions-total, gdp-per-capita-usd, industry-share-gdp, services-share-gdp, rd-expenditure-gdp, population-wb | Banque mondiale (WDI) | `scripts/fetch_wb_social.py` |
| gross-debt-imf | FMI, World Economic Outlook | `scripts/fetch_imf_social.py` ; États-Unis à partir de 2001 |
| satellites-in-orbit, satellites-active | CelesTrak SATCAT (`data/seeds/raw/satcat.csv`) | `scripts/build_satellites.py` ; organisations multinationales exclues |

## À récupérer
- **WRCES — World Ranking of Countries in Elite Sports** (sportsrankings.world, Nadim Nassif, NDU Liban) :
  seul le classement provisoire 2026 est consultable en ligne, pas d'historique téléchargeable.
  Classement final 2026 attendu fin 2026 / début 2027 : le récupérer à ce moment-là
  (`Fetch raw` sur https://sportsrankings.world/rankings/elite-sport) ; demander l'historique 2014–2025 aux auteurs si besoin.
