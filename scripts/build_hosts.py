"""Pays hôtes des grands événements sportifs — statistiques Statlas Research.

Règles :
- Pays = territoire actuel du lieu (Sarajevo 1984 → Bosnie-Herzégovine, Moscou 1980 → Russie, Berlin 1936 / Munich 1972 → Allemagne).
- Co-organisation : chaque pays co-hôte compte 1 (Corée du Sud + Japon 2002 ; États-Unis + Canada + Mexique 2026 ;
  Maroc + Espagne + Portugal 2030 — les trois matchs du centenaire en Uruguay, Argentine et Paraguay ne sont pas comptés).
- Seules les éditions réellement disputées comptent ; Jeux annulés (1916, 1940, 1944) exclus ; Jeux intercalaires 1906 exclus ;
  Tokyo 2020 (disputés en 2021) comptés en 2020 ; équitation de Melbourne 1956 à Stockholm non comptée.
- Éditions déjà attribuées mais pas encore disputées : marquées « projection » (p = 1) et tracées en pointillés.
"""
import os
OUT = "data/seeds/sport"
FOOT = {1930: "UY", 1934: "IT", 1938: "FR", 1950: "BR", 1954: "CH", 1958: "SE", 1962: "CL", 1966: "GB", 1970: "MX", 1974: "DE",
        1978: "AR", 1982: "ES", 1986: "MX", 1990: "IT", 1994: "US", 1998: "FR", 2002: "KR JP", 2006: "DE", 2010: "ZA", 2014: "BR",
        2018: "RU", 2022: "QA", 2026: "US CA MX", 2030: "MA ES PT", 2034: "SA"}
SUMMER = {1896: "GR", 1900: "FR", 1904: "US", 1908: "GB", 1912: "SE", 1920: "BE", 1924: "FR", 1928: "NL", 1932: "US", 1936: "DE",
          1948: "GB", 1952: "FI", 1956: "AU", 1960: "IT", 1964: "JP", 1968: "MX", 1972: "DE", 1976: "CA", 1980: "RU", 1984: "US",
          1988: "KR", 1992: "ES", 1996: "US", 2000: "AU", 2004: "GR", 2008: "CN", 2012: "GB", 2016: "BR", 2020: "JP", 2024: "FR",
          2028: "US", 2032: "AU"}
WINTER = {1924: "FR", 1928: "CH", 1932: "US", 1936: "DE", 1948: "CH", 1952: "NO", 1956: "IT", 1960: "US", 1964: "AT", 1968: "FR",
          1972: "JP", 1976: "AT", 1980: "US", 1984: "BA", 1988: "CA", 1992: "FR", 1994: "NO", 1998: "JP", 2002: "US", 2006: "IT",
          2010: "CA", 2014: "RU", 2018: "KR", 2022: "CN", 2026: "IT", 2030: "FR", 2034: "US"}
LAST_HELD = 2026   # dernière édition disputée (Coupe du monde 2026, JO d'hiver 2026)


def series(events):
    """Total cumulé par pays pour chaque année de 1896 à 2034 (une valeur par an, pour une animation fluide)."""
    cum, rows = {}, []
    for y in range(1896, 2035):
        for ev in events:
            for c in ev.get(y, "").split():
                cum[c] = cum.get(c, 0) + 1
        for c, n in cum.items():
            rows.append((c, y, n, 1 if y > LAST_HELD else 0))
    return rows


def write(name, title, events):
    rows = series(events)
    with open(f"{OUT}/{name}.psv", "w") as f:
        f.write(f"# {title} — cumulative number of editions hosted, by country (count by Statlas Research)\n")
        f.write("# Rules in scripts/build_hosts.py; editions awarded but not yet played are flagged as projections (4th column = 1)\n")
        for r in sorted(rows): f.write("|".join(map(str, r)) + "\n")
    last = {}
    for c, y, n, p in rows:
        if y == LAST_HELD: last[c] = n
    print(name, sorted(last.items(), key=lambda x: -x[1])[:8])


os.makedirs(OUT, exist_ok=True)
write("hosts-football-world-cup", "FIFA World Cup (men), host countries", [FOOT])
write("hosts-olympics-summer", "Summer Olympic Games, host countries", [SUMMER])
write("hosts-olympics-winter", "Winter Olympic Games, host countries", [WINTER])
write("hosts-olympics-all", "Olympic Games (summer + winter), host countries", [SUMMER, WINTER])
write("hosts-mega-events", "World Cup + Summer and Winter Olympics, host countries", [FOOT, SUMMER, WINTER])
