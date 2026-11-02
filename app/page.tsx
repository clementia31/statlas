import Link from 'next/link';
import AppShell from '@/components/AppShell';
import PageHeader from '@/components/ui/PageHeader';
import Panel from '@/components/ui/Panel';
import SourceNote from '@/components/ui/SourceNote';
import Flag from '@/components/ui/Flag';
import ChoroplethMap from '@/components/ChoroplethMap';
import IndicatorSelect from '@/components/controls/IndicatorSelect';
import YearSelect from '@/components/controls/YearSelect';
import {
  DEFAULT_INDICATOR,
  getCountryCatalog,
  getIndicatorYears,
  getOverviewKpis,
  getYearValues,
  pickYear,
  rankValues,
} from '@/lib/data';
import { formatChange, formatValue } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function OverviewPage({ searchParams }: { searchParams: { indicator?: string; year?: string } }) {
  const catalog = await getCountryCatalog();
  const meta = catalog.find((c) => c.slug === searchParams.indicator) ?? catalog.find((c) => c.slug === DEFAULT_INDICATOR) ?? catalog[0];

  if (!meta) {
    return (
      <AppShell active="Overview">
        <PageHeader title="Statlas" description="No data available yet." />
      </AppShell>
    );
  }

  const options = catalog.map((c) => ({ slug: c.slug, name: c.name, category: c.category }));
  const [years, kpis] = await Promise.all([getIndicatorYears(meta.slug), getOverviewKpis()]);
  const year = pickYear(years, searchParams.year, meta.ref_year) ?? 0;
  const rows = await getYearValues(meta.slug, year);
  const ranked = rankValues(rows, meta.higher_is_better);
  const top = ranked.slice(0, 5);
  const bottom = ranked.slice(-5).reverse();
  const orderLabel = meta.higher_is_better === null ? ['Highest', 'Lowest'] : ['Top 5', 'Bottom 5'];

  return (
    <AppShell active="Overview">
      <PageHeader
        kicker="World overview"
        title="The world in numbers"
        description={`${catalog.length} indicators from the IMF, World Bank, UNDP, OECD and UN, harmonised by country and year. Every figure links back to its source.`}
      />

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 border-t-2 border-text mb-10">
        {kpis.map((k) => {
          const ch = k.previous !== null ? formatChange(k.value, k.previous, k.unit) : null;
          return (
            <Link
              key={k.slug}
              href={`/indicateurs?indicator=${k.slug}`}
              className="border-b border-border px-3 py-4 hover:bg-panel transition-colors xl:[&:not(:last-child)]:border-r"
            >
              <div className="text-[13px] text-textMuted leading-tight min-h-[32px]">{k.label}</div>
              <div className="font-mono text-[24px] sm:text-[26px] text-text mt-1.5">{formatValue(k.value, k.unit)}</div>
              <div className="mt-1 flex items-center gap-2 text-[12px]">
                {ch && <span className={`font-semibold ${ch.up ? 'text-green' : 'text-red'}`}>{ch.text}</span>}
                <span className="text-textMuted">
                  {k.year} · {k.n} countries
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      <Panel
        title={meta.name}
        subtitle={`${year} · ${rows.length} countries with data${rows.some((r) => r.is_projection) ? ' · projections' : ''}`}
        right={
          <div className="hidden md:flex gap-2">
            <IndicatorSelect options={options} value={meta.slug} />
            <YearSelect years={years} value={year} refYear={meta.ref_year} />
          </div>
        }
        className="mb-6"
      >
        <div className="md:hidden flex flex-col gap-2 mb-4">
          <IndicatorSelect options={options} value={meta.slug} />
          <YearSelect years={years} value={year} refYear={meta.ref_year} />
        </div>
        <ChoroplethMap
          data={rows.map((r) => ({ slug: r.entity_slug, name: r.entity_name, iso: r.iso_code, value: r.value, projection: r.is_projection }))}
          unit={meta.unit}
          label={`${meta.name} (${year})`}
        />
        <div className="mt-4">
          <SourceNote meta={meta} year={year} count={rows.length} />
        </div>
      </Panel>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {[
          { title: orderLabel[0], items: top },
          { title: orderLabel[1], items: bottom },
        ].map((col) => (
          <Panel key={col.title} title={`${col.title} — ${meta.name}`} subtitle={String(year)}>
            <ol className="divide-y divide-border">
              {col.items.map((r) => (
                <li key={r.entity_slug} className="flex items-center gap-3 py-2">
                  <span className="w-7 text-right font-mono text-[13px] text-textMuted">{r.rank}</span>
                  <Flag iso={r.iso_code} />
                  <Link href={`/pays/${r.entity_slug}`} className="flex-1 text-[14px] text-text hover:text-accent truncate">
                    {r.entity_name}
                  </Link>
                  <span className="font-mono text-[14px] text-text">{formatValue(r.value, meta.unit)}</span>
                </li>
              ))}
            </ol>
            <Link href={`/rankings/${meta.slug}?year=${year}`} className="mt-3 inline-block text-[13px] text-accent hover:underline">
              Full ranking →
            </Link>
          </Panel>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { href: '/pays', t: 'Country profiles', d: 'Every indicator for every country, with its world rank.' },
          { href: '/rankings', t: 'Rankings', d: 'Who leads and who lags, year by year.' },
          { href: '/benchmark', t: 'Benchmark', d: 'See where up to six countries stand among all countries.' },
          { href: '/gazette', t: 'The Gazette', d: 'Essays on the quantitative social sciences.' },
        ].map((c) => (
          <Link key={c.href} href={c.href} className="rounded-xl border border-border bg-panel p-5 hover:border-accent transition-colors">
            <div className="font-serif text-[19px] font-semibold text-text">{c.t}</div>
            <div className="text-[13px] text-textMuted mt-1 leading-relaxed">{c.d}</div>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
