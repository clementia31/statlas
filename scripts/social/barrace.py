"""Statlas — course de barres animée (1080x1350, MP4) : classement qui se réordonne au fil des années.

Adapté aux comptages qui s'accumulent par à-coups (pays hôtes, titres) : contrairement aux courbes, les barres
restent lisibles avec 10 pays, l'échelle est toujours en nombres entiers et un pays n'apparaît qu'à son premier point.
"""
import subprocess
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, Rectangle

from race import THEMES, flag, globe, country_name

W, H = 1080, 1350


def render(table, events, title, subtitle, source, out, theme="statlas", top=10, yps=3.0, fps=30, hold=4, awarded_from=None, note=""):
    """table : {année: {iso: total cumulé}} pour chaque année ; events : {année: libellé de l'événement}."""
    T = THEMES[theme]
    years = sorted(table); y0, y1 = years[0], years[-1]
    ring = (19, 42, 82, 255) if T["dark"] else (255, 255, 255, 255)
    first = {}
    for y in years:
        for c, v in table[y].items():
            if v > 0: first.setdefault(c, y)
    flags = {c: flag(c, ring) for c in first}
    names = {c: country_name(c) for c in first}
    pos = {}
    fig = plt.figure(figsize=(10.8, 13.5), dpi=100)
    ff = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgba", "-s", f"{W}x{H}", "-r", str(fps),
                           "-i", "-", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-movflags", "+faststart", out], stdin=subprocess.PIPE)
    n = int((y1 - y0) / yps * fps)
    ts = list(np.linspace(y0, y1, n)) + [y1] * fps * hold
    vmax_s = None
    last_event = ""
    for t in ts:
        yi = int(np.floor(t)); frac = t - yi
        a = table[yi]; b = table[min(yi + 1, y1)]
        grow = min(1.0, frac / 0.35)       # la barre grandit pendant le premier tiers de l'année suivante
        val = {c: a.get(c, 0) + (b.get(c, 0) - a.get(c, 0)) * (grow if frac > 0 else 0) for c in set(a) | set(b)}
        val = {c: v for c, v in val.items() if v > 0}
        order = sorted(val, key=lambda c: (-round(val[c] + 0.0001, 3), first[c]))
        shown = order[:top]
        for i, c in enumerate(order):
            pos[c] = i if c not in pos else pos[c] + (i - pos[c]) * 0.18
        vmax = max([val[c] for c in shown] + [3])
        vmax_s = vmax if vmax_s is None else vmax_s + (vmax - vmax_s) * 0.1
        if events.get(yi): last_event = f"{yi} · {events[yi]}"

        fig.clear(); fig.set_facecolor(T["bg"])
        brand = T["brand"]; gx = 0.5 - 0.0165 * len(brand) - 0.03
        globe(fig, gx, 0.952, 0.032, T["accent"])
        fig.text(gx + 0.05, 0.952, brand, fontproperties=T["logo"], fontsize=46, color=T["logo_col"], va="center")
        fig.add_artist(Rectangle((0.44, 0.903), 0.12, 0.004, transform=fig.transFigure, color=T["accent"]))
        fig.text(0.5, 0.848, title, ha="center", fontproperties=T["title"], fontsize=44 if len(title) < 30 else 36, color=T["ink"])
        fig.text(0.5, 0.812, subtitle, ha="center", fontproperties=T["sub"], fontsize=15.5, color=T["muted"])

        top_y, bot_y = 0.765, 0.255
        slot = (top_y - bot_y) / top
        x0, x1 = 0.33, 0.86
        # graduations entières
        step = 1 if vmax_s <= 6 else 2 if vmax_s <= 14 else 5
        for g in range(0, int(vmax_s) + 1, step):
            x = x0 + (x1 - x0) * g / vmax_s
            fig.add_artist(Rectangle((x, bot_y - 0.005), 0.0012, top_y - bot_y + 0.01, transform=fig.transFigure, color=T["grid"]))
            fig.text(x, bot_y - 0.02, str(g), ha="center", fontproperties=T["tick"], fontsize=12, color=T["muted"])
        for c in order:
            p = pos[c]
            if p > top - 0.45: continue
            yc = top_y - slot * (p + 0.5)
            alpha = 1.0 if p <= top - 1 else max(0.0, (top - 0.45 - p) / 0.55)
            col = T["accent"] if order.index(c) == 0 else "#4CC9F0" if T["dark"] else T["palette"][1]
            w = (x1 - x0) * val[c] / vmax_s
            fig.add_artist(FancyBboxPatch((x0, yc - slot * 0.32), max(w, 0.004), slot * 0.64, boxstyle="round,pad=0,rounding_size=0.006",
                                          transform=fig.transFigure, color=col, alpha=alpha))
            fig.text(x0 + w + 0.012, yc, str(int(round(val[c]))), fontproperties=T["num"], fontsize=20, color=T["ink"], va="center", alpha=alpha)
            fig.text(x0 - 0.065, yc, names[c], fontproperties=T["label"], fontsize=16, color=T["ink"], va="center", ha="right", alpha=alpha)
            ax = fig.add_axes([x0 - 0.055, yc - slot * 0.36, slot * 0.72 * 1350 / 1080, slot * 0.72]); ax.axis("off")
            ax.imshow(flags[c], alpha=alpha)
        if last_event:
            fig.text(0.5, 0.215, last_event, ha="center", fontproperties=T["label"], fontsize=17, color=T["accent"])
        if note:
            fig.text(0.5, 0.185, note, ha="center", fontproperties=T["sub"], fontsize=12.5, color=T["muted"])
        fig.text(0.5, 0.162, f"Source: {source}", ha="center", fontproperties=T["sub"], fontsize=13.5, color=T["muted"])
        yr = str(yi)
        label = "AWARDED" if awarded_from and yi >= awarded_from else None
        fig.text(0.5, 0.095, yr, ha="center", va="center", fontproperties=T["year"], fontsize=64, color=T["accent"],
                 bbox=dict(boxstyle="round,pad=0.28,rounding_size=0.6", fc="none", ec=T["accent"], lw=2.5, ls="--" if label else "-"))
        if label:
            fig.text(0.5, 0.138, "EDITIONS ALREADY AWARDED, NOT YET PLAYED", ha="center", fontproperties=T["tick"], fontsize=12, color=T["muted"])
        fig.text(0.5, 0.025, "S T A T L A S   R E S E A R C H", ha="center", va="center", fontproperties=T["foot"], fontsize=14, color=T["ink"])
        fig.canvas.draw(); ff.stdin.write(fig.canvas.buffer_rgba().tobytes())
    fig.savefig(out.rsplit(".", 1)[0] + "_cover.png", facecolor=T["bg"])
    ff.stdin.close(); ff.wait()


if __name__ == "__main__":
    import os, sys
    sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
    from build_hosts import FOOT, SUMMER, WINTER
    import pycountry
    cum, table, events = {}, {}, {}
    NAMES = {"GB": "United Kingdom", "US": "United States", "KR": "South Korea", "RU": "Russia", "BA": "Bosnia"}
    nm = lambda c: NAMES.get(c) or getattr(pycountry.countries.get(alpha_2=c), "common_name", None) or pycountry.countries.get(alpha_2=c).name
    for y in range(1896, 2035):
        ev = []
        for lab, d in (("World Cup", FOOT), ("Summer Olympics", SUMMER), ("Winter Olympics", WINTER)):
            if y in d:
                for c in d[y].split(): cum[c] = cum.get(c, 0) + 1
                ev.append(f"{lab} — {' / '.join(nm(c) for c in d[y].split())}")
        table[y] = dict(cum); events[y] = "  ·  ".join(ev)
    render(table, events, "The world's favourite hosts", "World Cups + Summer and Winter Olympics hosted, by country",
           "Statlas Research", sys.argv[1], awarded_from=2027, note="Co-hosts count once each · host city's current country")
    print("ok")
