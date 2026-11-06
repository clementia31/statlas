"""Statlas — vidéo « course de courbes » pour X / Instagram (1080x1350, MP4).

Identités validées (5 nov. 2026) :
  statlas : fond nuit, nom et accents dorés, police Space Grotesk
  gazette : fond beige éditorial, titres Fraunces, filets rouges
Vitesse validée : 3 années par seconde, chaque année affichée, image finale tenue 4 s.

Exemple :
  python3 scripts/social/race.py --data data/seeds/history/nobel-laureates-cumulative.psv \
      --countries US,GB,DE,FR --start 1901 --end 2025 --theme statlas \
      --title "Who wins the Nobel Prize?" \
      --subtitle "Laureates born in each country (current borders), cumulative since 1901" \
      --source "Nobel Foundation" --out nobel.mp4
"""
import argparse, io, os, subprocess
import numpy as np, pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
from matplotlib.font_manager import FontProperties as FP
from matplotlib.offsetbox import OffsetImage, AnnotationBbox
from matplotlib.patches import Circle, Ellipse, Rectangle
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
F = lambda n: FP(fname=f"{HERE}/fonts/{n}.ttf")

THEMES = {
    "statlas": dict(
        brand="STATLAS", bg="#132A52", ink="#F2F4F8", muted="#8FA3BF", grid="#24406E", accent="#F5B83D",
        logo_col="#F5B83D", palette=["#F5B83D", "#4CC9F0", "#7BE0A6", "#FF6B6B", "#C77DFF", "#F4F1DE", "#FF9F43", "#2EC4B6", "#F78FB3", "#A3B18A"],
        logo=F("space-grotesk-700-normal"), title=F("space-grotesk-700-normal"), sub=F("space-grotesk-400-normal"),
        label=F("space-grotesk-700-normal"), num=F("space-grotesk-600-normal"), tick=F("space-grotesk-400-normal"),
        year=F("space-grotesk-700-normal"), foot=F("space-grotesk-600-normal"), dark=True, year_style="box"),
    "gazette": dict(
        brand="THE GAZETTE", bg="#F3EEE4", ink="#1A1A1A", muted="#6E675C", grid="#E2DACB", accent="#B3261E",
        logo_col="#1A1A1A", palette=["#B3261E", "#1F3A93", "#2E7D5B", "#C98A0B", "#6A3D9A", "#4A4A4A", "#D35400", "#117A8B", "#8E3B5E", "#7A6A2F"],
        logo=F("fraunces-900-normal"), title=F("fraunces-800-normal"), sub=F("ibm-plex-sans-400-italic"),
        label=F("ibm-plex-sans-700-normal"), num=F("ibm-plex-mono-600-normal"), tick=F("ibm-plex-mono-400-normal"),
        year=F("fraunces-900-normal"), foot=F("ibm-plex-sans-600-normal"), dark=False, year_style="rule"),
    "investa": dict(
        brand="INVESTA", bg="#0B1120", ink="#F2F5F2", muted="#8C9AB0", grid="#1A2438", accent="#4CAF50",
        logo_col="#F2F5F2", palette=["#4CAF50", "#4CC9F0", "#F5B83D", "#FF6B6B", "#C77DFF", "#F4F1DE", "#FF9F43", "#2EC4B6", "#F78FB3", "#A3B18A"],
        logo=F("montserrat-600-normal"), title=F("space-grotesk-700-normal"), sub=F("space-grotesk-400-normal"),
        label=F("space-grotesk-700-normal"), num=F("space-grotesk-600-normal"), tick=F("space-grotesk-400-normal"),
        year=F("space-grotesk-700-normal"), foot=F("montserrat-500-normal"), dark=True, year_style="box",
        mark="investa", foot_text="M Y I N V E S T A . F R", lang="fr"),
}


def country_name(iso):
    try:
        import pycountry
        c = pycountry.countries.get(alpha_2=iso)
        return {"GB": "United Kingdom", "US": "United States", "KR": "South Korea", "RU": "Russia",
                "IR": "Iran", "TW": "Taiwan", "VN": "Vietnam", "CD": "DR Congo", "AE": "UAE", "HK": "Hong Kong",
                "CZ": "Czechia", "SY": "Syria", "VE": "Venezuela", "BO": "Bolivia", "TZ": "Tanzania", "LA": "Laos"}.get(iso, getattr(c, "common_name", None) or c.name)
    except Exception:
        return iso


def flag(iso, ring):
    import cairosvg
    png = cairosvg.svg2png(url=f"{HERE}/flags/{iso.lower()}.svg", output_width=128, output_height=128)
    im = Image.open(io.BytesIO(png)).convert("RGBA")
    m = Image.new("L", (128, 128), 0); ImageDraw.Draw(m).ellipse((5, 5, 123, 123), fill=255)
    out = Image.new("RGBA", (128, 128), (0, 0, 0, 0)); out.paste(im, (0, 0), m)
    ImageDraw.Draw(out).ellipse((3, 3, 125, 125), outline=ring, width=6)
    return np.asarray(out)


def globe(fig, x, y, r, col, lw=2.2):
    """Marque Statlas : globe en méridiens traversé par une courbe."""
    a = fig.add_axes([x - r, y - r * 1.0, 2 * r, 2 * r * 1.25], facecolor="none")
    a.set_xlim(-1.1, 1.1); a.set_ylim(-1.1, 1.1); a.set_aspect("equal"); a.axis("off")
    a.add_patch(Circle((0, 0), 1, fill=False, ec=col, lw=lw))
    for w in (0.38, 0.75):
        a.add_patch(Ellipse((0, 0), 2 * w, 2, fill=False, ec=col, lw=lw * .7))
    for h in (-0.5, 0, 0.5):
        half = np.sqrt(1 - h * h); a.plot([-half, half], [h, h], color=col, lw=lw * .7)
    xs = np.linspace(-0.85, 0.85, 30)
    a.plot(xs, -0.15 + 0.45 * np.tanh(2.2 * xs), color=col, lw=lw * 1.4, solid_capstyle="round")


def building(fig, x, y, r, col, lw=2.2):
    """Marque Investa : cadre arrondi et immeuble."""
    from matplotlib.patches import FancyBboxPatch
    a = fig.add_axes([x - r, y - r * 1.0, 2 * r, 2 * r * 1.25], facecolor="none")
    a.set_xlim(-1.1, 1.1); a.set_ylim(-1.1, 1.1); a.set_aspect("equal"); a.axis("off")
    a.add_patch(FancyBboxPatch((-1, -1), 2, 2, boxstyle="round,pad=0,rounding_size=0.35", fill=False, ec=col, lw=lw * 1.2))
    a.add_patch(Rectangle((-0.45, -0.7), 0.9, 1.25, fill=False, ec=col, lw=lw))
    for wx in (-0.22, 0.12):
        for wy in (0.2, -0.15):
            a.add_patch(Rectangle((wx, wy), 0.12, 0.17, color=col))
    a.add_patch(Rectangle((-0.1, -0.7), 0.2, 0.3, color=col))


INVESTA_SVG = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 156 270"><path fill="#4CAF50" fill-rule="evenodd" '
               'd="M0 0H156V270H117V218.4L105.5 211H102.5V270H77V168L55 182V210.5L40.5 218.4V270H0Z '
               'M11 12V258H32V212.4L47 203.5V180.4L76 156.5L107 180.4V201.5L125 212.4V258H145V12Z"/></svg>')


def investa_logo(fig, T):
    """Logo officiel Investa : symbole vert + INVESTA (Montserrat) + « GESTION PATRIMONIALE »."""
    import cairosvg
    png = cairosvg.svg2png(bytestring=INVESTA_SVG.encode(), output_width=156 * 2, output_height=270 * 2)
    im = np.asarray(Image.open(io.BytesIO(png)).convert("RGBA"))
    h = 0.072; w = h * 156 / 270 * 1350 / 1080
    x0 = 0.335
    a = fig.add_axes([x0, 0.905, w, h]); a.imshow(im); a.axis("off")
    sp = "\u2009"
    fig.text(x0 + w + 0.022, 0.955, sp.join("INVESTA"), fontproperties=T["logo"], fontsize=40, color=T["logo_col"], va="center")
    fig.text(x0 + w + 0.062, 0.917, sp.join("GESTION") + "  " + sp.join("PATRIMONIALE"), fontproperties=T["foot"],
             fontsize=10.5, color=T["muted"], va="center")
    for xx in (x0 + w + 0.024, x0 + w + 0.302):
        fig.add_artist(Rectangle((xx, 0.9155), 0.026, 0.0028, transform=fig.transFigure, color=T["accent"]))


def badge(label, color, ring):
    """Pastille ronde avec initiale (villes : pas de drapeau)."""
    im = Image.new("RGBA", (128, 128), (0, 0, 0, 0)); dr = ImageDraw.Draw(im)
    dr.ellipse((3, 3, 125, 125), fill=color, outline=ring, width=6)
    from PIL import ImageFont
    f = ImageFont.truetype(f"{HERE}/fonts/space-grotesk-700-normal.ttf", 64)
    t = label[:1].upper(); w = dr.textlength(t, font=f)
    dr.text(((128 - w) / 2, 26), t, font=f, fill=ring)
    return np.asarray(im)


def fmt(v, unit, integer=False):
    if integer: v = round(v)
    a = abs(v)
    s = f"{v/1e12:.2f}T" if a >= 1e12 else f"{v/1e9:.1f}B" if a >= 1e9 else f"{v/1e6:.1f}M" if a >= 1e6 \
        else f"{v:,.0f}" if a >= 100 else f"{v:.0f}" if v == round(v) else f"{v:.1f}"
    if FR: s = s.replace(",", "\u202f").replace(".", ",")
    return f"{unit}{s}" if unit in ("$", "£") or (unit == "€" and not FR) else (f"{s} {unit}" if unit else s)


FR = False


class Race:
    def __init__(self, a):
        self.a = a; self.T = T = THEMES[a.theme]
        global FR; FR = T.get("lang") == "fr"
        d = pd.read_csv(a.data, sep="|", comment="#", names=["iso", "year", "v", "p"], dtype={"iso": str})
        d = d[(d.year >= a.start) & (d.year <= a.end) & ((d.iso.str.len() == 2) | a.badges)]
        # projections : colonne p = 1 (fichiers OWID) ou --proj-from (fichiers sans colonne)
        pf = d.loc[d.p == 1, "year"].min() if d.p.notna().any() else np.nan
        self.proj = a.proj_from or (int(pf) if pf == pf else None)
        pool = d[~d.iso.isin([x for x in a.exclude.split(",") if x])]
        if a.minpop:   # exclut les micro-États (population ONU de l'année de classement ou la plus proche)
            pop = pd.read_csv(os.path.join(os.path.dirname(a.data), "..", "history", "population-un-wpp.psv") if not os.path.exists(a.minpop_file) else a.minpop_file,
                              sep="|", comment="#", names=["iso", "year", "v", "p"])
            py = min(a.rank_year or 2025, 2025)
            big = set(pop[(pop.year == py) & (pop.v >= a.minpop)].iso)
            pool = pool[pool.iso.isin(big)]
        if a.countries:
            isos = a.countries.split(",")
        else:   # top N à la dernière année disponible
            ry = a.rank_year or pool.year.max()
            last = pool[pool.year == ry].copy()
            # égalité : le pays arrivé le premier à une valeur non nulle passe devant (ex. Suède 1903 avant Japon 1949)
            first = pool[pool.v > 0].groupby("iso").year.min()
            last["first"] = last.iso.map(first).fillna(9999)
            isos = list(last.sort_values(["v", "first"], ascending=[False, True]).iso.head(a.top))
        d = d[d.iso.isin(isos)].pivot(index="year", columns="iso", values="v").sort_index()
        d = d.loc[a.start:a.end].interpolate(limit_area="inside").ffill().fillna(0 if a.fill0 else np.nan)
        self.integer = bool(np.allclose(d.fillna(0).values, np.round(d.fillna(0).values)))
        self.d = d.dropna(how="all"); self.isos = [i for i in isos if i in self.d]
        self.y0, self.y1 = int(self.d.index.min()), int(self.d.index.max())
        self.col = {iso: T["palette"][k % len(T["palette"])] for k, iso in enumerate(self.isos)}
        ring = (19, 42, 82, 255) if T["dark"] else (255, 255, 255, 255)
        over = dict(x.split("=", 1) for x in a.names.split(";") if "=" in x)
        self.names = {i: over.get(i) or (i if a.badges else country_name(i)) for i in self.isos}
        self.flags = {i: badge(self.names[i], self.col[i], ring) if a.badges else flag(i, ring) for i in self.isos}
        self.ymax = None
        n = len(self.isos)
        self.k = 1.0 if n <= 5 else 0.78          # échelle des étiquettes pour un top 10
        self.fig = plt.figure(figsize=(10.8, 13.5), dpi=100)

    def val(self, t):
        d = self.d
        i = np.interp(t, d.index.values, np.arange(len(d)))
        lo = int(np.floor(i)); hi = min(lo + 1, len(d) - 1); w = i - lo
        return d.iloc[lo] * (1 - w) + d.iloc[hi] * w

    def draw(self, t):
        T, fig, a, d = self.T, self.fig, self.a, self.d
        fig.clear(); fig.set_facecolor(T["bg"])
        brand = T["brand"]; gx = 0.5 - 0.0165 * len(brand) - 0.03
        if T.get("mark") == "investa":
            investa_logo(fig, T)
        else:
            (building if T.get("mark") == "building" else globe)(fig, gx, 0.952, 0.032, T["accent"])
            fig.text(gx + 0.05, 0.952, brand, fontproperties=T["logo"], fontsize=46, color=T["logo_col"], va="center")
            fig.add_artist(Rectangle((0.44, 0.903), 0.12, 0.004, transform=fig.transFigure, color=T["accent"]))
        fig.text(0.5, 0.848, a.title, ha="center", fontproperties=T["title"], fontsize=44 if len(a.title) < 30 else 36, color=T["ink"])
        fig.text(0.5, 0.812, a.subtitle, ha="center", fontproperties=T["sub"], fontsize=15.5, color=T["muted"])
        ax = fig.add_axes([0.10, 0.235, 0.855, 0.545], facecolor=T["bg"])
        hist = d.loc[:np.floor(t)]; cur = self.val(t)
        seen = np.nanmax(hist.values) if len(hist) else 0          # l'axe couvre tout l'historique déjà tracé
        target = max(a.ymin_top, np.nanmax(cur.values) * 1.18, seen * 1.06)
        self.ymax = target if self.ymax is None else self.ymax + (target - self.ymax) * 0.08
        xr = t + max(7, (t - self.y0) * 0.40)
        ax.set_xlim(self.y0, xr); ax.set_ylim(0, self.ymax)
        for s in ("top", "right", "left"): ax.spines[s].set_visible(False)
        ax.spines["bottom"].set_color(T["muted"]); ax.spines["bottom"].set_linewidth(1.2)
        ax.grid(axis="y", color=T["grid"], lw=1.1); ax.set_axisbelow(True)
        ax.tick_params(colors=T["muted"], length=0, pad=8)
        span = t - self.y0
        step = 1 if span < 8 else 2 if span < 16 else 5 if span < 35 else 10 if span < 70 else 20 if span < 120 else 25 if span < 160 else 50
        ax.set_xticks([x for x in range(self.y0 - self.y0 % step, self.y1 + 1, step) if self.y0 <= x <= t])
        ax.yaxis.set_major_locator(mticker.MaxNLocator(5))
        ax.yaxis.set_major_formatter(mticker.FuncFormatter(lambda v, _: fmt(v, a.unit if a.unit in ("$", "€", "£") else "")))
        for lab in ax.get_xticklabels() + ax.get_yticklabels():
            lab.set_fontproperties(T["tick"]); lab.set_fontsize(14)
        live = [i for i in self.isos if not np.isnan(cur[i])]
        P = self.proj
        if P and t > P:
            ax.axvspan(P, t, color=T["grid"], alpha=.35, lw=0)
            ax.text(P + 0.5, self.ymax * 0.985, a.proj_label, fontproperties=T["tick"], fontsize=12, color=T["muted"], va="top")
        for iso in live:
            xs = np.array(list(hist.index) + [t], float); ys = np.array(list(hist[iso]) + [cur[iso]], float)
            segs = [(xs, ys, "-")]
            if P and t > P:
                k = xs <= P
                segs = [(xs[k], ys[k], "-"), (np.r_[xs[k][-1:], xs[~k]], np.r_[ys[k][-1:], ys[~k]], (0, (2, 1.6)))]
            for sx, sy, ls in segs:
                if T["dark"]:
                    ax.plot(sx, sy, color=self.col[iso], lw=12, alpha=.12, solid_capstyle="round", ls=ls)
                ax.plot(sx, sy, color=self.col[iso], lw=4.6, solid_capstyle="round", dash_capstyle="round", ls=ls)
        order = sorted(live, key=lambda i: cur[i])
        gap = self.ymax * 0.09 * self.k; pos = {}; last = -1e18
        for iso in order:
            pos[iso] = max(cur[iso], last + gap); last = pos[iso]
        over = last - self.ymax * 0.97
        if over > 0:
            for iso in pos: pos[iso] -= over
        dx = (xr - self.y0) * 0.042
        for iso in order:
            col = self.col[iso]
            if abs(pos[iso] - cur[iso]) > gap * 0.15:
                ax.plot([t, t + dx * 0.55], [cur[iso], pos[iso]], color=col, lw=1.2, alpha=.6)
            ax.plot([t], [cur[iso]], "o", color=col, ms=10, mec=T["bg"], mew=2)
            ax.add_artist(AnnotationBbox(OffsetImage(self.flags[iso], zoom=0.34 * self.k), (t + dx, pos[iso]), frameon=False, annotation_clip=False))
            ax.text(t + dx * 1.9 * self.k ** .5, pos[iso] + gap * 0.18, self.names[iso], color=col, fontproperties=T["label"], fontsize=17 * self.k, va="center")
            ax.text(t + dx * 1.9 * self.k ** .5, pos[iso] - gap * 0.22, fmt(cur[iso], a.unit, self.integer), color=T["ink"], fontproperties=T["num"], fontsize=18 * self.k, va="center")
        fig.text(0.5, 0.183, f"Source{' :' if FR else ':'} {a.source}", ha="center", fontproperties=T["sub"], fontsize=13.5, color=T["muted"])
        yr = f"{int(np.floor(t + 1e-9))}"
        if T["year_style"] == "rule":
            fig.text(0.5, 0.112, yr, ha="center", va="center", fontproperties=T["year"], fontsize=72, color=T["ink"])
            fig.add_artist(Rectangle((0.40, 0.068), 0.20, 0.003, transform=fig.transFigure, color=T["accent"]))
        else:
            fig.text(0.5, 0.112, yr, ha="center", va="center", fontproperties=T["year"], fontsize=64, color=T["accent"],
                     bbox=dict(boxstyle="round,pad=0.28,rounding_size=0.6", fc="none", ec=T["accent"], lw=2.5))
        fig.text(0.5, 0.035, T.get("foot_text", "S T A T L A S   R E S E A R C H"), ha="center", va="center", fontproperties=T["foot"], fontsize=14, color=T["ink"])
        fig.canvas.draw()

    def render(self, out, yps=3.0, fps=30, hold=4):
        n = max(2, int((self.y1 - self.y0) / yps * fps))
        ts = list(np.linspace(self.y0, self.y1, n)) + [self.y1] * (fps * hold)
        ff = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgba", "-s", "1080x1350",
                               "-r", str(fps), "-i", "-", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18",
                               "-movflags", "+faststart", out], stdin=subprocess.PIPE)
        for t in ts:
            self.draw(t); ff.stdin.write(self.fig.canvas.buffer_rgba().tobytes())
        ff.stdin.close(); ff.wait()
        self.fig.savefig(out.rsplit(".", 1)[0] + "_cover.png", facecolor=self.T["bg"])   # image finale = vignette


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--data", required=True); p.add_argument("--countries", default="")
    p.add_argument("--top", type=int, default=5, help="si --countries est vide : top 3, 5 ou 10 à la dernière année")
    p.add_argument("--start", type=int, default=0); p.add_argument("--end", type=int, default=9999)
    p.add_argument("--theme", default="statlas", choices=list(THEMES))
    p.add_argument("--title", required=True); p.add_argument("--subtitle", default="")
    p.add_argument("--source", required=True); p.add_argument("--unit", default="")
    p.add_argument("--yps", type=float, default=3.0); p.add_argument("--ymin-top", dest="ymin_top", type=float, default=10)
    p.add_argument("--rank-year", dest="rank_year", type=int, default=0, help="année du classement top N (défaut : dernière)")
    p.add_argument("--exclude", default="", help="codes ISO2 à exclure")
    p.add_argument("--minpop", type=float, default=0, help="population minimale (ex. 1e6) pour le top N")
    p.add_argument("--minpop-file", dest="minpop_file", default="data/seeds/history/population-un-wpp.psv")
    p.add_argument("--proj-from", dest="proj_from", type=int, default=0, help="année de début des projections (pointillés)")
    p.add_argument("--proj-label", dest="proj_label", default="PROJECTION", help="texte de la zone projetée (ex. AWARDED)")
    p.add_argument("--names", default="", help="noms affichés imposés, ex. EU=ESA (Europe)")
    p.add_argument("--still", action="store_true", help="aperçu PNG de l'image finale")
    p.add_argument("--fill0", action="store_true", help="avant la première donnée, compter 0 (séries cumulées)")
    p.add_argument("--badges", action="store_true", help="codes libres (villes…) : pastille avec initiale au lieu du drapeau")
    p.add_argument("--out", required=True)
    a = p.parse_args()
    r = Race(a)
    if a.still:   # aperçu : image finale seulement
        r.draw(r.y1); r.fig.savefig(a.out, facecolor=r.T["bg"])
    else:
        r.render(a.out, a.yps)
