"""Statlas — images fixes pour X / Instagram (1080x1350), mêmes identités que les vidéos.

  keyfigure(...) : un chiffre clé (avant / après)
  worldmap(...)  : carte du monde colorée par valeur, avec les plus hautes valeurs en dessous
  quote(...)     : citation avec auteur et référence

Le classement en barres est dans bars.py. Fond de carte : world-atlas 110m (Natural Earth, domaine public).
"""
import json, textwrap
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.collections import PolyCollection
from matplotlib.colors import LinearSegmentedColormap, to_rgba
from matplotlib.patches import FancyBboxPatch, Rectangle

from race import THEMES, globe, country_name, fmt

FOOT = "S T A T L A S   R E S E A R C H"


def _frame(theme, title, subtitle, source, note=""):
    T = THEMES[theme]
    fig = plt.figure(figsize=(10.8, 13.5), dpi=100, facecolor=T["bg"])
    brand = T["brand"]; gx = 0.5 - 0.0165 * len(brand) - 0.03
    if theme == "statlas":
        globe(fig, gx, 0.952, 0.032, T["accent"])
        fig.text(gx + 0.05, 0.952, brand, fontproperties=T["logo"], fontsize=46, color=T["logo_col"], va="center")
    else:
        fig.text(0.5, 0.952, brand, fontproperties=T["logo"], fontsize=46, color=T["logo_col"], va="center", ha="center")
    fig.add_artist(Rectangle((0.44, 0.903), 0.12, 0.004, transform=fig.transFigure, color=T["accent"]))
    if title:
        fig.text(0.5, 0.848, title, ha="center", fontproperties=T["title"], fontsize=44 if len(title) < 30 else 36, color=T["ink"])
    if subtitle:
        fig.text(0.5, 0.812, subtitle, ha="center", fontproperties=T["sub"], fontsize=15.5, color=T["muted"])
    if note:
        fig.text(0.5, 0.15, note, ha="center", va="top", fontproperties=T["sub"], fontsize=12.5, color=T["muted"], linespacing=1.6)
    if source:
        fig.text(0.5, 0.085 if "\n" in note else 0.1, f"Source: {source}", ha="center", fontproperties=T["sub"], fontsize=13.5, color=T["muted"])
    fig.text(0.5, 0.035, FOOT if theme == "statlas" else "T H E   G A Z E T T E   ·   S T A T L A S", ha="center", va="center", fontproperties=T["foot"], fontsize=14, color=T["ink"])
    return fig, T


def keyfigure(title, subtitle, before, after, unit, source, out, theme="statlas", note=""):
    """before / after = (libellé, valeur). La valeur d'arrivée est mise en avant."""
    fig, T = _frame(theme, title, subtitle, source, note)
    fig.text(0.5, 0.60, f"{after[1]:.0f}", ha="center", va="center", fontproperties=T["year"], fontsize=250, color=T["accent"])
    fig.text(0.5, 0.455, f"{unit} in {after[0]}", ha="center", va="center", fontproperties=T["label"], fontsize=34, color=T["ink"])
    fig.add_artist(Rectangle((0.2, 0.385), 0.6, 0.0015, transform=fig.transFigure, color=T["grid"]))
    # frise avant → après
    y = 0.29; x0, x1 = 0.22, 0.78
    fig.add_artist(Rectangle((x0, y - 0.002), x1 - x0, 0.004, transform=fig.transFigure, color=T["grid"]))
    for x, (lab, v), col in ((x0, before, T["palette"][1]), (x1, after, T["accent"])):
        fig.add_artist(FancyBboxPatch((x - 0.011, y - 0.011 * 1080 / 1350), 0.022, 0.022 * 1080 / 1350, boxstyle="round,pad=0,rounding_size=0.011",
                                      transform=fig.transFigure, color=col))
        fig.text(x, y + 0.045, f"{v:.1f}", ha="center", va="center", fontproperties=T["num"], fontsize=40, color=T["ink"])
        fig.text(x, y - 0.04, str(lab), ha="center", va="center", fontproperties=T["sub"], fontsize=20, color=T["muted"])
    fig.savefig(out, facecolor=T["bg"]); plt.close(fig)


def _equal_earth(lon, lat):
    A1, A2, A3, A4 = 1.340264, -0.081106, 0.000893, 0.003796
    lam, phi = np.radians(lon), np.radians(lat)
    th = np.arcsin(np.sqrt(3) / 2 * np.sin(phi)); t2 = th * th; t6 = t2 * t2 * t2
    x = 2 * np.sqrt(3) * lam * np.cos(th) / (3 * (9 * A4 * t6 * t2 + 7 * A3 * t6 + 3 * A2 * t2 + A1))
    y = th * (A4 * t6 * t2 + A3 * t6 + A2 * t2 + A1)
    return x, y


def _world(topo_path):
    """Lit le fichier world-atlas (TopoJSON) : renvoie [(code numérique ISO, [anneaux lon/lat])]."""
    t = json.load(open(topo_path)); sx, sy = t["transform"]["scale"]; tx, ty = t["transform"]["translate"]
    arcs = []
    for a in t["arcs"]:
        p = np.cumsum(np.array(a, dtype=float), axis=0); p[:, 0] = p[:, 0] * sx + tx; p[:, 1] = p[:, 1] * sy + ty; arcs.append(p)
    def ring(ids):
        pts = [arcs[i] if i >= 0 else arcs[~i][::-1] for i in ids]
        return np.concatenate([p if k == 0 else p[1:] for k, p in enumerate(pts)])
    out = []
    for g in t["objects"]["countries"]["geometries"]:
        polys = g["arcs"] if g["type"] == "MultiPolygon" else [g["arcs"]]
        out.append((g.get("id"), [ring(poly[0]) for poly in polys]))
    return out


def worldmap(values, title, subtitle, source, out, topo_path, theme="statlas", note="", unit="%", top=5, vmax=None, names=None):
    """values = {iso2: valeur}. Les pays sans donnée restent en gris."""
    import pycountry
    fig, T = _frame(theme, title, subtitle, source, note)
    names = names or {}
    num = {}
    for iso, v in values.items():
        c = pycountry.countries.get(alpha_2=iso)
        if c: num[c.numeric] = v
    vals = np.array(list(values.values())); vmax = vmax or float(np.percentile(vals, 95))
    cmap = LinearSegmentedColormap.from_list("s", ["#2C4F86", "#4F86C6", "#8FB8DE", "#F5B83D", "#FFE9A8"] if T["dark"] else ["#EFE6D2", "#E0B98A", "#C9763F", "#B3261E"])
    nodata = "#3A4558" if T["dark"] else "#E2DACB"
    ax = fig.add_axes([0.04, 0.43, 0.92, 0.36]); ax.axis("off"); ax.set_aspect("equal")
    polys, cols = [], []
    for cid, rings in _world(topo_path):
        if cid == "010": continue  # Antarctique : hors sujet, et sans donnée
        v = num.get(cid)
        for r in rings:
            if np.ptp(r[:, 0]) > 180:  # anneau à cheval sur l'antiméridien (Russie, Fidji) : on le ramène d'un seul côté
                r = r.copy(); r[:, 0] = np.minimum(np.where(r[:, 0] < 0, r[:, 0] + 360, r[:, 0]), 180)
            x, y = _equal_earth(r[:, 0], r[:, 1]); polys.append(np.column_stack([x, y]))
            cols.append(nodata if v is None else cmap(min(v / vmax, 1.0)))
    ax.add_collection(PolyCollection(polys, facecolors=cols, edgecolors=T["bg"], linewidths=0.5))
    ax.set_xlim(-2.75, 2.75); ax.set_ylim(-1.05, 1.32)
    # légende
    lax = fig.add_axes([0.30, 0.405, 0.40, 0.012]); lax.imshow(np.linspace(0, 1, 256)[None, :], aspect="auto", cmap=cmap); lax.axis("off")
    fig.text(0.29, 0.411, "0", ha="right", va="center", fontproperties=T["tick"], fontsize=13, color=T["muted"])
    fig.text(0.71, 0.411, f"{vmax:.0f}{unit} and more", ha="left", va="center", fontproperties=T["tick"], fontsize=13, color=T["muted"])
    fig.add_artist(Rectangle((0.84, 0.405), 0.022, 0.012, transform=fig.transFigure, color=nodata))
    fig.text(0.868, 0.411, "no data", ha="left", va="center", fontproperties=T["tick"], fontsize=13, color=T["muted"])
    # les plus hautes valeurs
    order = sorted(values.items(), key=lambda kv: -kv[1])[:top]
    fig.text(0.5, 0.362, "HIGHEST", ha="center", va="center", fontproperties=T["foot"], fontsize=13, color=T["accent"])
    y0, h = 0.335, 0.033
    for i, (iso, v) in enumerate(order):
        y = y0 - h * i
        fig.text(0.27, y, f"{i + 1}", ha="center", va="center", fontproperties=T["year"], fontsize=19, color=T["accent"] if i == 0 else T["muted"])
        fig.text(0.31, y, names.get(iso) or country_name(iso), ha="left", va="center", fontproperties=T["label"], fontsize=19, color=T["ink"])
        fig.text(0.73, y, f"{v:.0f}{unit}", ha="right", va="center", fontproperties=T["num"], fontsize=19, color=T["ink"])
    fig.savefig(out, facecolor=T["bg"]); plt.close(fig)


def quote(text, author, reference, out, theme="gazette", width=22):
    """Citation centrée. reference : œuvre et année, pour que chacun puisse vérifier."""
    fig, T = _frame(theme, "", "", "")
    lines = textwrap.wrap(text, width=width); n = len(lines)
    size = 62 if n <= 4 else 54 if n <= 6 else 46 if n <= 8 else 40
    lh = size * 1.38 / 1350
    top = 0.53 + lh * n / 2
    fig.text(0.5, top + 0.085, "“", ha="center", va="center", fontproperties=T["title"], fontsize=150, color=T["accent"])
    for i, l in enumerate(lines):
        fig.text(0.5, top - lh * (i + 0.5), l, ha="center", va="center", fontproperties=T["title"], fontsize=size, color=T["ink"])
    yb = top - lh * n - 0.045
    fig.add_artist(Rectangle((0.46, yb), 0.08, 0.004, transform=fig.transFigure, color=T["accent"]))
    fig.text(0.5, yb - 0.05, author, ha="center", va="center", fontproperties=T["label"], fontsize=28, color=T["ink"])
    fig.text(0.5, yb - 0.09, reference, ha="center", va="center", fontproperties=T["sub"], fontsize=17, color=T["muted"])
    fig.savefig(out, facecolor=T["bg"]); plt.close(fig)
