import Link from 'next/link';
import AppShell from '@/components/AppShell';
import PageHeader from '@/components/ui/PageHeader';
import Flag from '@/components/ui/Flag';
import { getCountryCatalog, getPodiums } from '@/lib/data';
import { formatValue } from '@/lib/format';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'World rankings — Statlas',
  description: 'Every Statlas indicator ranked across countries, with sources and the year of the data.',
};

export default async function RankingsPage() {
  const [catalog, podiums] = await Promise.all([getCountryCatalog(), getPodiums()]);
  const groups = new Map<string, typeof catalog>();
  for (const m of catalog) {
    const g = m.category ?? 'Other';
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g)!.push(m);
  }

  return (
    <AppShell active="Rankings">
      <PageHeader
        kicker="Rankings"
        title="World rankings"
        description={`${catalog.length} indicators ranked on the most recent year with broad country coverage.`}
      />
      {Array.from(groups.entries()).map(([g, items]) => (
        <section key={g} className="mb-8">
          <h2 className="text-[12px] uppercase tracking-[0.14em] text-textMuted mb-3">{g}</h2>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {items.map((m) => {
              const podium = podiums.get(m.id) ?? [];
              return (
                <Link key={m.slug} href={`/rankings/${m.slug}`} className="rounded-xl border border-border bg-panel p-4 hover:border-accent transition-colors">
                  <div className="text-[14px] text-text font-medium leading-snug">{m.name}</div>
                  <div className="text-[12px] text-textMuted mt-1">
                    {m.ref_year} · {m.ref_coverage} countries ·{' '}
                    {m.higher_is_better === null ? 'highest first' : m.higher_is_better ? 'higher is better' : 'lower is better'}
                  </div>
                  <ol className="mt-3 space-y-1.5">
                    {podium.map((p) => (
                      <li key={p.slug} className="flex items-center gap-2 text-[12.5px]">
                        <span className="w-4 font-mono text-textMuted">{p.rank}</span>
                        <Flag iso={p.iso} />
                        <span className="flex-1 truncate text-textSecondary">{p.name}</span>
                        <span className="font-mono text-text">{formatValue(p.value, m.unit)}</span>
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
