"""Section sport de Statlas : séries par pays construites depuis les pages Wikipédia téléchargées (data/seeds/raw).

Convention pays : États successeurs (comme les frontières actuelles des Nobel / Fields) —
URSS, Équipe unifiée, ROC, OAR → Russie ; RDA, RFA, Équipe unifiée d'Allemagne → Allemagne ;
Tchécoslovaquie, Bohême → Tchéquie ; Yougoslavie, Serbie-et-Monténégro → Serbie ; Australasie → Australie.
Angleterre, Écosse, Pays de Galles (rugby, football) → Royaume-Uni pour les drapeaux ; voir la colonne d'origine dans les CSV.

Sorties (data/seeds/sport/) :
  olympics-summer-medals.psv / olympics-winter-medals.psv : total de médailles cumulé par pays, à chaque édition
  olympics-summer-gold.psv / olympics-winter-gold.psv     : médailles d'or cumulées
  <compétition>-titles.psv : titres cumulés par pays (une valeur par année, depuis la 1re édition)
  <compétition>-winners.csv : liste brute année / vainqueur (pour vérification)
"""
import glob, os, re, warnings
import pandas as pd
import pycountry

warnings.filterwarnings("ignore")
RAW = "data/seeds/raw"; OUT = "data/seeds/sport"
os.makedirs(OUT, exist_ok=True)

ALIAS = {
    "soviet union": "RU", "ussr": "RU", "unified team": "RU", "roc": "RU", "russian olympic committee": "RU",
    "olympic athletes from russia": "RU", "russia": "RU", "east germany": "DE", "west germany": "DE",
    "united team of germany": "DE", "germany": "DE", "czechoslovakia": "CZ", "bohemia": "CZ", "czech republic": "CZ",
    "yugoslavia": "RS", "serbia and montenegro": "RS", "independent olympic participants": None, "australasia": "AU",
    "great britain": "GB", "united kingdom": "GB", "england": "GB", "scotland": "GB", "wales": "GB",
    "united states": "US", "usa": "US", "south korea": "KR", "korea": "KR", "north korea": "KP", "iran": "IR",
    "chinese taipei": "TW", "taiwan": "TW", "hong kong": "HK", "turkey": "TR", "türkiye": "TR", "netherlands": "NL",
    "vietnam": "VN", "venezuela": "VE", "bolivia": "BO", "tanzania": "TZ", "syria": "SY", "moldova": "MD",
    "macedonia": "MK", "north macedonia": "MK", "ivory coast": "CI", "côte d'ivoire": "CI", "kosovo": "XK",
    "puerto rico": "PR", "bermuda": "BM", "virgin islands": "VI", "trinidad and tobago": "TT", "russia (rus)": "RU",
    "individual neutral athletes": None, "mixed team": None, "refugee olympic team": None, "independent": None,
    "fr yugoslavia": "RS", "united arab republic": "EG", "ceylon": "LK", "cape verde": "CV", "russian empire": "RU",
    "british west indies": None, "netherlands antilles": None, "independent olympic athletes": None,
    "united kingdom of great britain and ireland": "GB", "weimar republic": "DE", "nazi germany": "DE",
    "socialist federal republic of yugoslavia": "RS", "federal republic of yugoslavia": "RS", "kingdom of yugoslavia": "RS",
    "russian federation": "RU", "rhodesia": "ZW", "union of south africa": "ZA", "northern ireland": "GB",
    "west indies": None,   # équipe pluri-nationale des Caraïbes (cricket) : non attribuée à un pays
    "eun": "RU", "frg": "DE", "gdr": "DE", "ger": "DE", "fra": "FR", "ita": "IT", "esp": "ES", "aus": "AU",
}


def iso(name):
    n = re.sub(r"\[.*?\]|[*‡†^]|\(.*?\)", "", str(name)).strip().lower()
    n = re.sub(r"\s+", " ", n)
    if n in ALIAS: return ALIAS[n]
    try:
        return pycountry.countries.lookup(n).alpha_2
    except LookupError:
        try:
            return pycountry.countries.search_fuzzy(n)[0].alpha_2
        except LookupError:
            return "??"


def write_psv(path, title, rows):
    with open(path, "w") as f:
        f.write(f"# {title}\n# Built by Statlas Research from Wikipedia tables (successor-state convention, see scripts/build_sports.py)\n")
        for r in sorted(rows): f.write("|".join(map(str, r)) + "|0\n")


# ---------- Jeux olympiques
unknown = set()
for season in ("s", "w"):
    per = []
    for f in sorted(glob.glob(f"{RAW}/oly_{season}_*.html")):
        year = int(re.findall(r"(\d{4})", f)[-1])
        for t in pd.read_html(f):
            cols = [str(c) for c in (t.columns.get_level_values(-1) if isinstance(t.columns, pd.MultiIndex) else t.columns)]
            if "Gold" in cols and "Total" in cols:
                t.columns = cols
                nat = [c for c in cols if c in ("Nation", "NOC", "Country", "Team")][0]
                t = t[~t[nat].astype(str).str.contains("Totals|Total", case=False)]
                for _, r in t.iterrows():
                    i = iso(r[nat])
                    if i == "??": unknown.add(str(r[nat]))
                    if not i or i == "??": continue
                    per.append((i, year, int(pd.to_numeric(r["Gold"], errors="coerce") or 0), int(pd.to_numeric(r["Total"], errors="coerce") or 0)))
                break
    df = pd.DataFrame(per, columns=["iso", "year", "gold", "total"]).groupby(["iso", "year"]).sum().reset_index()
    years = sorted(df.year.unique())
    full = df.set_index(["iso", "year"]).unstack(fill_value=0).stack().reset_index() if False else df
    piv_t = df.pivot(index="year", columns="iso", values="total").reindex(years).fillna(0).cumsum()
    piv_g = df.pivot(index="year", columns="iso", values="gold").reindex(years).fillna(0).cumsum()
    name = "summer" if season == "s" else "winter"
    for piv, kind in ((piv_t, "medals"), (piv_g, "gold")):
        rows = [(c, y, int(piv.loc[y, c])) for c in piv.columns for y in years if piv.loc[y, c] > 0]
        write_psv(f"{OUT}/olympics-{name}-{kind}.psv", f"Olympic {name} games — cumulative {'medals' if kind == 'medals' else 'gold medals'} by country", rows)
    print(name, "games", len(years), "top:", piv_t.iloc[-1].sort_values(ascending=False).head(6).astype(int).to_dict())


# ---------- Compétitions : on cherche le tableau des finales/résultats et la colonne du vainqueur
def winners_from_tables(f, year_col_hint=("Year", "Edition"), win_hint=("Winner", "Winners", "Champion", "Champions", "Gold")):
    out = []
    for t in pd.read_html(f):
        cols = [" ".join(map(str, c)) if isinstance(c, tuple) else str(c) for c in t.columns]
        t.columns = cols
        yc = next((c for h in year_col_hint for c in cols if h.lower() in c.lower()), None)
        wc = next((c for c in cols if any(h.lower() == c.lower().split()[-1] or h.lower() in c.lower().split() for h in win_hint)), None)
        if not yc or not wc: continue
        for _, r in t.iterrows():
            y = re.findall(r"(18|19|20)\d{2}", str(r[yc]))
            m = re.search(r"((?:18|19|20)\d{2})", str(r[yc]))
            if not m: continue
            w = str(r[wc])
            if w in ("nan", "") or "TBD" in w or "To be" in w: continue
            out.append((int(m.group(1)), w))
        if len(out) >= 5: break
    return out


COMP = {
    "football-men-world-cup": ("wc_football_men.html", "FIFA World Cup (men) — titles"),
    "football-women-world-cup": ("wc_football_women.html", "FIFA Women's World Cup — titles"),
    "rugby-world-cup": ("wc_rugby.html", "Rugby World Cup — titles"),
    "handball-men-world-cup": ("wc_handball_men.html", "IHF World Men's Handball Championship — titles"),
    "handball-women-world-cup": ("wc_handball_women.html", "IHF World Women's Handball Championship — titles"),
    "basketball-world-cup": ("wc_basketball.html", "FIBA Basketball World Cup — titles"),
}
for slug, (f, title) in COMP.items():
    w = winners_from_tables(f"{RAW}/{f}")
    w = sorted({y: n for y, n in w}.items())
    pd.DataFrame(w, columns=["year", "winner"]).assign(iso=[iso(n) for _, n in w]).to_csv(f"{OUT}/{slug}-winners.csv", index=False)
    print(slug, len(w), w[:2], w[-2:])


# ---------- Compétitions individuelles : la nationalité vient du drapeau (flagicon) dans le tableau
from bs4 import BeautifulSoup


def flags(cell):
    out = []
    for f in cell.select(".flagicon"):
        a = f.find("a"); img = f.find("img")
        out.append((a.get("title") if a else None) or (img.get("alt") if img else ""))
    return out


def table_with(f, words):
    s = BeautifulSoup(open(f).read(), "lxml")
    return next(t for t in s.select("table.wikitable") if all(w in t.get_text()[:600] for w in words))


def grand_slams(f):
    t = table_with(f, ["Australian", "Wimbledon"]); out = []
    for tr in t.select("tr"):
        cells = tr.find_all(["td", "th"])
        m = re.match(r"(18|19|20)\d{2}", cells[0].get_text(strip=True)) if cells else None
        if not m: continue
        for c in cells[1:]:
            out += [(int(m.group(0)), n) for n in flags(c)]
    return out


def per_row(f, words, year_idx, who_idx, rank_filter=None):
    t = table_with(f, words); out = []; year = None
    for tr in t.select("tr"):
        cells = tr.find_all(["td", "th"])
        if not cells: continue
        m = re.match(r"\s*((?:18|19|20)\d{2})", cells[0].get_text(" ", strip=True))
        if m: year = int(m.group(1))
        elif rank_filter is None: continue
        row = cells if m else [None] + cells          # ligne sans cellule année (rowspan)
        if rank_filter and not rank_filter(row): continue
        if year and len(row) > who_idx and row[who_idx] is not None:
            out += [(year, n) for n in flags(row[who_idx])[:1]]
    return out


IND = {
    "tennis-grand-slam-men": (lambda: grand_slams(f"{RAW}/gs_men.html"), "Grand Slam men's singles titles"),
    "tennis-grand-slam-women": (lambda: grand_slams(f"{RAW}/gs_women.html"), "Grand Slam women's singles titles"),
    "formula1-drivers": (lambda: per_row(f"{RAW}/f1.html", ["Season", "Driver", "Constructor"], 0, 1), "Formula One World Drivers' Championships"),
    "ballon-dor": (lambda: per_row(f"{RAW}/ballon_dor.html", ["Year", "Rank", "Player"], 0, 2,
                                   rank_filter=lambda r: r[1] is not None and r[1].get_text(strip=True).startswith("1")), "Ballon d'Or winners"),
}
import datetime
for slug, (fn, title) in IND.items():
    w = fn()
    if slug == "formula1-drivers":   # saison en cours non terminée : pas de champion avant la dernière course (décembre)
        w = [x for x in w if x[0] < datetime.date.today().year or datetime.date.today().month == 12 and datetime.date.today().day > 15]
    pd.DataFrame(w, columns=["year", "winner"]).assign(iso=[iso(n) for _, n in w]).to_csv(f"{OUT}/{slug}-winners.csv", index=False)
    print(slug, len(w), w[:2], w[-2:])
COMP.update({k: (None, v[1]) for k, v in IND.items()})

# Tour de France : colonne Pays
t = [t for t in pd.read_html(f"{RAW}/tdf.html") if "Country" in map(str, t.columns) and "Cyclist" in map(str, t.columns)][0]
t = t[t["Country"].astype(str).str.len() < 40]
w = [(int(re.search(r"(18|19|20)\d{2}", str(y)).group(0)), c) for y, c in zip(t["Year"], t["Country"]) if re.search(r"(18|19|20)\d{2}", str(y)) and str(c) not in ("nan", "—") and "No winner" not in str(c)]
pd.DataFrame(w, columns=["year", "winner"]).assign(iso=[iso(n) for _, n in w]).to_csv(f"{OUT}/tour-de-france-winners.csv", index=False)
COMP["tour-de-france"] = (None, "Tour de France general classification wins")
print("tour-de-france", len(w), w[:2], w[-2:])

# ---------- Titres cumulés par pays, année par année
for slug, (_, title) in COMP.items():
    w = pd.read_csv(f"{OUT}/{slug}-winners.csv")
    bad = w[w.iso.isin(["??"]) | w.iso.isna()]
    if len(bad): print("  non attribués", slug, bad.winner.unique()[:10])
    w = w[~w.iso.isin(["??"]) & w.iso.notna()]
    y0, y1 = int(w.year.min()), int(w.year.max())
    cnt = w.groupby(["year", "iso"]).size().unstack(fill_value=0).reindex(range(y0, y1 + 1), fill_value=0).cumsum()
    rows = [(c, y, int(cnt.loc[y, c])) for c in cnt.columns for y in cnt.index if cnt.loc[y, c] > 0]
    write_psv(f"{OUT}/{slug}-titles.psv", f"{title} — cumulative, by country", rows)
    print("  ", slug, y0, y1, cnt.iloc[-1].sort_values(ascending=False).head(5).to_dict())


# ---------- Lot 2 (bonus) : compétitions continentales, cricket, ski, Ballon d'Or féminin, clubs
def team_final(f, idx_hint=("Year",), win=("Winners", "Champion", "Champions")):
    for t in pd.read_html(f):
        cols = [" ".join(map(str, c)) if isinstance(c, tuple) else str(c) for c in t.columns]
        t.columns = cols
        yc = next((c for c in cols if c.split()[0] in idx_hint), None)
        wc = next((c for c in cols if c.startswith("Final") and c.split()[-1] in win), None)
        if yc and wc and len(t) >= 8:
            out = []
            for y, w in zip(t[yc], t[wc]):
                m = re.search(r"(18|19|20)\d{2}", str(y))
                if m and str(w) not in ("nan", "") and "TBD" not in str(w) and "Future" not in str(w):
                    w = re.split(r"\s\d", re.sub(r"\[.*?\]", "", str(w)))[0].strip()   # « Australia 253/5 (50 overs) » → Australia
                    out.append((int(m.group(0)), w))
            return out
    return []


def flag_column(f, words, col):
    t = table_with(f, words); out = []
    head = [c.get_text(" ", strip=True) for c in t.select("tr")[0].find_all(["th", "td"])]
    j = next(i for i, h in enumerate(head) if h.startswith(col))
    for tr in t.select("tr")[1:]:
        cells = tr.find_all(["td", "th"])
        if len(cells) <= j: continue
        m = re.match(r"\s*((?:18|19|20)\d{2})", cells[0].get_text(" ", strip=True))
        if m: out += [(int(m.group(1)), n) for n in flags(cells[j])[:1]]
    return out


def ucl():
    t = [t for t in pd.read_html(f"{RAW}/ucl.html") if "Country" in map(str, t.columns) and "Winners" in map(str, t.columns)][0]
    return [(int(str(s)[:4]) + 1, c) for s, c in zip(t["Season"], t["Country"]) if re.match(r"\d{4}", str(s)) and str(c) != "nan"]


LOT2 = {
    "football-euro": (lambda: team_final(f"{RAW}/euro.html"), "UEFA European Championship titles"),
    "football-copa-america": (lambda: team_final(f"{RAW}/copa.html"), "Copa América titles"),
    "football-champions-league-clubs": (ucl, "European Cup / Champions League titles, by the winning club's country"),
    "cricket-world-cup": (lambda: team_final(f"{RAW}/cricket.html"), "Cricket World Cup titles (men)"),
    "ski-world-cup-men": (lambda: flag_column(f"{RAW}/ski_men.html", ["Year", "Overall", "Slalom"], "Overall"), "Alpine Ski World Cup overall titles (men)"),
    "ski-world-cup-women": (lambda: flag_column(f"{RAW}/ski_women.html", ["Year", "Overall", "Downhill"], "Overall"), "Alpine Ski World Cup overall titles (women)"),
    "ballon-dor-feminin": (lambda: per_row(f"{RAW}/ballon_dor_f.html", ["Year", "Rank", "Player"], 0, 2,
                                           rank_filter=lambda r: r[1] is not None and r[1].get_text(strip=True).startswith("1")), "Ballon d'Or Féminin winners"),
}
for slug, (fn, title) in LOT2.items():
    try:
        w = sorted(set(fn()))
    except Exception as e:
        print("ECHEC", slug, e); continue
    if not w: print("VIDE", slug); continue
    pd.DataFrame(w, columns=["year", "winner"]).assign(iso=[iso(n) for _, n in w]).to_csv(f"{OUT}/{slug}-winners.csv", index=False)
    ww = pd.read_csv(f"{OUT}/{slug}-winners.csv"); bad = ww[ww.iso.isin(["??"]) | ww.iso.isna()]
    if len(bad): print("  non attribués", slug, bad.winner.unique()[:8])
    ww = ww[~ww.iso.isin(["??"]) & ww.iso.notna()]
    if ww.empty: continue
    y0, y1 = int(ww.year.min()), int(ww.year.max())
    cnt = ww.groupby(["year", "iso"]).size().unstack(fill_value=0).reindex(range(y0, y1 + 1), fill_value=0).cumsum()
    write_psv(f"{OUT}/{slug}-titles.psv", f"{title} — cumulative, by country",
              [(c, y, int(cnt.loc[y, c])) for c in cnt.columns for y in cnt.index if cnt.loc[y, c] > 0])
    print(slug, len(w), y0, y1, cnt.iloc[-1].sort_values(ascending=False).head(5).to_dict())

# ---------- Totaux à date seulement (pas d'historique année par année sur la source) : une ligne par pays pour l'année en cours
Y = datetime.date.today().year
def totals(f, cols_needed, value_col, slug, title):
    t = [t for t in pd.read_html(f) if all(c in map(str, t.columns) for c in cols_needed)][0]
    rows = []
    for c, v in zip(t["Country"], t[value_col]):
        i = iso(c); v = pd.to_numeric(re.sub(r"\[.*?\]", "", str(v)), errors="coerce")
        if i and i != "??" and v == v and v > 0: rows.append((i, Y, int(v)))
    agg = pd.DataFrame(rows, columns=["i", "y", "v"]).groupby(["i", "y"]).v.sum().reset_index()
    write_psv(f"{OUT}/{slug}-total.psv", f"{title} — all-time total by country, as of {Y}", list(agg.itertuples(index=False, name=None)))
    print(slug, agg.sort_values("v", ascending=False).head(5).values.tolist())

totals(f"{RAW}/motogp.html", ["Country", "MotoGP/500cc"], "MotoGP/500cc", "motogp-riders", "MotoGP / 500cc riders' world titles")
totals(f"{RAW}/golf_men.html", ["Country", "Masters", "Total"], "Total", "golf-majors-men", "Men's golf major championships")
totals(f"{RAW}/davis.html", ["Country", "Titles", "First"], "Titles", "davis-cup", "Davis Cup titles")
