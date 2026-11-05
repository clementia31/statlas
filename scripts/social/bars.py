"""Statlas — image fixe « classement en barres » (1080x1350) pour X / Instagram.

Même identité que les vidéos (statlas : nuit et or ; gazette : beige éditorial).
Chaque ligne : rang, drapeau, pays, barre, valeur, et une ligne de détail facultative (ex. années d'organisation).

usage (en module) : render(rows, title, subtitle, source, out, theme="statlas", note="")
  rows = [(iso2, valeur, détail), ...] déjà triés
"""
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.offsetbox import OffsetImage, AnnotationBbox
from matplotlib.patches import FancyBboxPatch, Rectangle

from race import THEMES, flag, globe, country_name, fmt


def render(rows, title, subtitle, source, out, theme="statlas", note="", unit="", names=None):
    T = THEMES[theme]; names = names or {}
    fig = plt.figure(figsize=(10.8, 13.5), dpi=100, facecolor=T["bg"])
    brand = T["brand"]; gx = 0.5 - 0.0165 * len(brand) - 0.03
    globe(fig, gx, 0.952, 0.032, T["accent"])
    fig.text(gx + 0.05, 0.952, brand, fontproperties=T["logo"], fontsize=46, color=T["logo_col"], va="center")
    fig.add_artist(Rectangle((0.44, 0.903), 0.12, 0.004, transform=fig.transFigure, color=T["accent"]))
    fig.text(0.5, 0.848, title, ha="center", fontproperties=T["title"], fontsize=44 if len(title) < 30 else 36, color=T["ink"])
    fig.text(0.5, 0.812, subtitle, ha="center", fontproperties=T["sub"], fontsize=15.5, color=T["muted"])

    n = len(rows); top, bottom = 0.775, 0.17
    h = (top - bottom) / n
    vmax = max(r[1] for r in rows)
    ring = (13, 27, 42, 255) if T["dark"] else (255, 255, 255, 255)
    k = 1.0 if n <= 5 else 0.72
    x_bar0, x_bar1 = 0.30, 0.86
    for i, (iso, v, detail) in enumerate(rows):
        yc = top - h * (i + 0.5)
        col = T["palette"][0] if i == 0 else T["palette"][1] if not T["dark"] else T["accent"] if i == 0 else "#4CC9F0"
        col = T["accent"] if i == 0 else T["palette"][1]
        # rang
        fig.text(0.075, yc + (0.012 if detail else 0) * k, f"{i + 1}", fontproperties=T["year"], fontsize=34 * k, color=T["accent"] if i == 0 else T["muted"], va="center", ha="center")
        # drapeau
        ax = fig.add_axes([0.115, yc - 0.03 * k + (0.012 if detail else 0) * k, 0.06 * k, 0.06 * k * 1080 / 1350]); ax.axis("off")
        ax.imshow(flag(iso, ring))
        # nom
        fig.text(0.30, yc + 0.03 * k + (0.012 if detail else 0) * k, names.get(iso) or country_name(iso), fontproperties=T["label"], fontsize=24 * k, color=T["ink"], va="center")
        # barre
        w = (x_bar1 - x_bar0) * v / vmax
        fig.add_artist(FancyBboxPatch((x_bar0, yc - 0.016 * k + (0.012 if detail else 0) * k), w, 0.022 * k, boxstyle="round,pad=0,rounding_size=0.006",
                                      transform=fig.transFigure, color=col, alpha=1 if i == 0 else 0.85))
        fig.text(x_bar0 + w + 0.015, yc - 0.005 * k + (0.012 if detail else 0) * k, fmt(v, unit, True), fontproperties=T["num"], fontsize=24 * k, color=T["ink"], va="center")
        # (valeur alignée sur la barre)
        if detail:
            fig.text(0.30, yc - 0.032 * k, detail, fontproperties=T["tick"], fontsize=13.5 * k, color=T["muted"], va="center")
        if i < n - 1:
            fig.add_artist(Rectangle((0.06, top - h * (i + 1)), 0.88, 0.0012, transform=fig.transFigure, color=T["grid"]))
    if note:
        fig.text(0.5, 0.15, note, ha="center", va="top", fontproperties=T["sub"], fontsize=12.5, color=T["muted"], linespacing=1.6)
    fig.text(0.5, 0.085 if "\n" in note else 0.1, f"Source: {source}", ha="center", fontproperties=T["sub"], fontsize=13.5, color=T["muted"])
    fig.text(0.5, 0.035, "S T A T L A S   R E S E A R C H", ha="center", va="center", fontproperties=T["foot"], fontsize=14, color=T["ink"])
    fig.savefig(out, facecolor=T["bg"]); plt.close(fig)


if __name__ == "__main__":
    # Pays hôtes (sujets validés le 5 nov. 2026)
    import sys, os
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
    from build_hosts import FOOT, SUMMER, WINTER
    out = sys.argv[1]
    LAST = 2026

    def table(events, top, upto=LAST, ties_year=True):
        cnt, years, first = {}, {}, {}
        for ev in events:
            for y, cs in ev.items():
                if y > upto: continue
                for c in cs.split():
                    cnt[c] = cnt.get(c, 0) + 1; years.setdefault(c, []).append(y); first[c] = min(first.get(c, 9999), y)
        order = sorted(cnt, key=lambda c: (-cnt[c], first[c]))[:top]
        return [(c, cnt[c], " · ".join(str(y) for y in sorted(years[c]))) for c in order]

    note = "Co-hosts count once each · host city's current country · editions already played (to 2026)"
    render(table([FOOT], 5), "Who hosts the World Cup?", "FIFA World Cups hosted (men), by country", "Statlas Research", f"{out}/hosts-world-cup-bars.png", note="Co-hosts count once each · editions already played (to 2026)\nNext: Spain, Morocco & Portugal 2030 · Saudi Arabia 2034")
    render(table([SUMMER], 5), "Who hosts the Summer Olympics?", "Summer Olympic Games hosted, by country", "Statlas Research", f"{out}/hosts-summer-bars.png", note="Editions already played · next: Los Angeles 2028, Brisbane 2032")
    render(table([WINTER], 5), "Who hosts the Winter Olympics?", "Winter Olympic Games hosted, by country", "Statlas Research", f"{out}/hosts-winter-bars.png", note="Editions already played (to Milan-Cortina 2026) · next: French Alps 2030, Salt Lake City 2034")
    rows = table([FOOT, SUMMER, WINTER], 10)
    rows = [(c, v, "") for c, v, _ in rows]
    render(rows, "The world's favourite hosts", "World Cups + Summer and Winter Olympics hosted, by country", "Statlas Research", f"{out}/hosts-mega-bars.png", note="Editions already played (to 2026) · co-hosts count once each")
    print("ok")
