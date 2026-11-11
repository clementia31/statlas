import maddison from '@/data/credits/maddison-2023.json';

// Certaines sources demandent de citer aussi les travaux d'origine dès que leurs données sont montrées dans un graphique.
// La liste vient du fichier officiel de la source (onglets « Sources » et « Maddison original sources »).
type Work = { period: string; ref: string };
type Country = { iso3: string; country: string; works: Work[] };
type Credits = { dataset: string; citation: string; general: string[]; groups: { title: string; countries: Country[] }[] };

const CREDITS: Record<string, Credits> = {
  'gdp-per-capita-maddison': maddison as Credits,
};

export function hasOriginalWorks(slug: string) {
  return slug in CREDITS;
}

export default function OriginalWorks({ slug }: { slug: string }) {
  const c = CREDITS[slug];
  if (!c) return null;
  const total = c.groups.reduce((n, g) => n + g.countries.reduce((m, k) => m + k.works.length, 0), 0);
  return (
    <details className="mt-2 text-[12.5px] text-textMuted leading-relaxed">
      <summary className="cursor-pointer select-none underline decoration-dotted hover:text-accent">
        Original studies behind this dataset ({total} references)
      </summary>
      <div className="mt-2 max-h-[420px] overflow-y-auto rounded-lg border border-border bg-panel p-3">
        <p>{c.citation}</p>
        {c.general.map((g) => (
          <p key={g} className="mt-1">{g}</p>
        ))}
        {c.groups.map((g) => (
          <div key={g.title} className="mt-3">
            <p className="font-semibold text-text">{g.title}</p>
            <ul className="mt-1 space-y-1.5">
              {g.countries.map((k) => (
                <li key={k.iso3}>
                  <span className="font-medium text-text">{k.country}</span>
                  <ul className="ml-4 list-disc">
                    {k.works.map((w, i) => (
                      <li key={i}>
                        {w.period}: {w.ref}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </details>
  );
}
