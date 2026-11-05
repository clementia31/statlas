"""Satellites en orbite par pays propriétaire, depuis le catalogue CelesTrak (SATCAT).

Sorties (data/seeds/social/) :
  satellites-in-orbit.psv : charges utiles (PAY) en orbite terrestre au 31 déc. de chaque année (actives ou non), 1957 → année en cours
  satellites-active.psv   : charges utiles actives aujourd'hui (OPS_STATUS + P B S X), une ligne par pays pour l'année en cours
ESA comptée à part (code EU) ; autres organisations multinationales (Intelsat, SES, Eutelsat...) exclues, comme la plupart des classements par pays.
"""
import datetime, pandas as pd

MAP = {"US": "US", "CIS": "RU", "PRC": "CN", "UK": "GB", "JPN": "JP", "FR": "FR", "IND": "IN", "GER": "DE", "IT": "IT", "CA": "CA",
       "SPN": "ES", "SKOR": "KR", "ARGN": "AR", "AUS": "AU", "ISRA": "IL", "TURK": "TR", "ROC": "TW", "FIN": "FI", "UAE": "AE",
       "BRAZ": "BR", "POL": "PL", "NOR": "NO", "SING": "SG", "LUXE": "LU", "NZ": "NZ", "INDO": "ID", "GREC": "GR", "SWTZ": "CH",
       "IRAN": "IR", "NETH": "NL", "DEN": "DK", "SAUD": "SA", "BEL": "BE", "CZCH": "CZ", "THAI": "TH", "SWED": "SE", "POR": "PT",
       "EGYP": "EG", "MALA": "MY", "MEX": "MX", "LTU": "LT", "RWA": "RW", "PAKI": "PK", "UKR": "UA", "SAFR": "ZA", "HUN": "HU",
       "RP": "PH", "KAZ": "KZ", "BUL": "BG", "ALG": "DZ", "CHLE": "CL", "VTNM": "VN", "NIG": "NG", "BELA": "BY", "AZER": "AZ",
       "PERU": "PE", "SVK": "SK", "MA": "MA", "SVN": "SI", "COL": "CO", "VENZ": "VE", "NKOR": "KP", "KWT": "KW", "ROM": "RO",
       "ECU": "EC", "EST": "EE", "BGD": "BD", "AB": "SA", "IM": "GB"}
# AB = Arabsat (Riyad), IM = Inmarsat (Londres) : opérateurs nationaux de fait ; FGER (RFA) regroupé avec GER
MAP["FGER"] = "DE"
# Agence spatiale européenne : gardée comme entité propre (code « EU », affichée « ESA ») pour la comparer aux pays
MAP["ESA"] = "EU"; MAP["ESRO"] = "EU"

d = pd.read_csv("data/seeds/raw/satcat.csv", dtype=str)
p = d[(d.OBJECT_TYPE == "PAY") & (d.ORBIT_CENTER == "EA") & d.OWNER.isin(MAP)].copy()
p["iso"] = p.OWNER.map(MAP)
p["L"] = pd.to_datetime(p.LAUNCH_DATE, errors="coerce"); p["D"] = pd.to_datetime(p.DECAY_DATE, errors="coerce")
today = pd.Timestamp(datetime.date.today()); Y = today.year
rows = []
for y in range(1957, Y + 1):
    end = min(pd.Timestamp(f"{y}-12-31"), today)
    alive = p[(p.L <= end) & (p.D.isna() | (p.D > end))]
    for iso, n in alive.groupby("iso").size().items():
        rows.append((iso, y, int(n), 0))
head = f"# Satellites (payloads) in Earth orbit by owner country, active or not, at 31 Dec — CelesTrak SATCAT\n# Retrieved {today.date()}; ESA counted as its own entity (EU); other multinational operators excluded; count by Statlas Research\n"
open("data/seeds/social/satellites-in-orbit.psv", "w").write(head + "".join(f"{a}|{b}|{c}|{e}\n" for a, b, c, e in sorted(rows)))
act = p[p.OPS_STATUS_CODE.isin(["+", "P", "B", "S", "X"])].groupby("iso").size()
open("data/seeds/social/satellites-active.psv", "w").write(
    f"# Active satellites by owner country — CelesTrak SATCAT operational status, {today.date()}; multinational operators excluded\n"
    + "".join(f"{iso}|{Y}|{int(n)}|0\n" for iso, n in act.sort_values(ascending=False).items()))
print(act.sort_values(ascending=False).head(12).to_dict())
yr = pd.DataFrame(rows, columns=["iso", "y", "n", "p"])
print(yr[yr.y.isin([1970, 2000, 2010, 2020, Y])].pivot(index="iso", columns="y", values="n").fillna(0).astype(int).sort_values(Y, ascending=False).head(10))
