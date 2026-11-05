import Link from 'next/link';
import AppShell from '@/components/AppShell';
import PageHeader from '@/components/ui/PageHeader';
import Flag from '@/components/ui/Flag';
import EmptyState from '@/components/ui/EmptyState';
import { supabase } from '@/lib/supabase';
import { getYearValues, type IndicatorMeta } from '@/lib/data';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Sport & space — Statlas',
  description:
    'Which countries win the World Cups, Olympic medals, Grand Slams and Formula One titles — and who owns the satellites in orbit. Complete histories, by country.',
};

// Familles affichées, dans l'ordre ; un indicateur va dans la première famille dont le préfixe correspond
const FAMILIES: { name: string; prefixes: string[] }[] = [
  { name: 'Olympic Games', prefixes: ['olympics-'] },
  { name: 'Football', prefixes: ['football-', 'ballon-dor'] },
  { name: 'Rugby, handball, basketball & cricket', prefixes: ['rugby-', 'handball-', 'basketball-', 'cricket-'] },
  { name: 'Tennis & golf', prefixes: ['tennis-', 'davis-', 'golf-'] },
  { name: 'Motorsport & cycling', prefixes: ['formula1-', 'motogp-', 'tour-de-france'] },
  { name: 'Winter sports', prefixes: ['ski-'] },
  { name: 'Space', prefixes: ['satellites-'] },
];

export default async function SportPage() {
  // Sélection par préfixe d'indicateur (indépendant de la façon dont la vue expose la catégorie)
  const { data } = await supabase.from('indicator_catalog').select('*');
  const prefixes = FAMILIES.flatMap((f) => f.prefixes);
  const catalog = ((data ?? []) as IndicatorMeta[])
    .filter((m) => prefixes.some((p) => m.slug.startsWith(p)))
    .sort((a, b) => a.name.localeCompare(b.name));
  if (!catalog.length) {
    return (
      <AppShell active="Sport">
        <EmptyState title="The sport section is being loaded" />
      </AppShell>
    );
  }

  // Podium de la dernière année disponible (séries cumulées : la dernière année donne le total à date)
  const podiums = await Promise.all(
    catalog.map(async (m) => {
      const year = m.last_actual_year ?? m.last_year;
      const rows = year ? await getYearValues(m.slug, year) : [];
      return { slug: m.slug, year, top: [...rows].sort((a, b) => b.value - a.value).slice(0, 3) };
    }),
  );
  const bySlug = new Map(podiums.map((p) => [p.slug, p]));
  const groups = FAMILIES.map((f) => ({
    name: f.name,
    items: catalog.filter((m) => f.prefixes.some((p) => m.slug.startsWith(p))),
  })).filter((g) => g.items.length);

  return (
    <AppShell active="Sport">
      <PageHeader
        kicker="Sport & space"
        title="Who wins?"
        description="World Cups, Olympic medals, Grand Slams, Formula One, the Tour de France — and the satellites in orbit. Every title counted by country, with the full history. Successor states: USSR counted with Russia, East and West Germany with Germany, Yugoslavia with Serbia."
      />
      {groups.map((g) => (
        <section key={g.name} className="mb-8">
          <h2 className="text-[12px] uppercase tracking-[0.14em] text-textMuted mb-3">{g.name}</h2>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {g.items.map((m) => {
              const p = bySlug.get(m.slug);
              return (
                <Link
                  key={m.slug}
                  href={`/rankings/${m.slug}`}
                  className="rounded-xl border border-border bg-panel p-4 hover:border-accent transition-colors"
                >
                  <div className="text-[14px] text-text font-medium leading-snug">{m.name}</div>
                  <div className="text-[12px] text-textMuted mt-1">
                    {m.first_year ?? '—'}–{p?.year ?? '—'} · {m.unit}
                  </div>
                  <ol className="mt-3 space-y-1.5">
                    {(p?.top ?? []).map((r, i) => (
                      <li key={r.entity_slug} className="flex items-center gap-2 text-[12.5px]">
                        <span className="w-4 font-mono text-textMuted">{i + 1}</span>
                        <Flag iso={r.iso_code} />
                        <span className="flex-1 truncate text-textSecondary">{r.entity_name}</span>
                        <span className="font-mono text-text">{Math.round(r.value).toLocaleString('en-US')}</span>
                      </li>
                    ))}
                  </ol>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </AppShell>
  );
}
