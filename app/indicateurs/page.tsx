import Link from 'next/link';
import AppShell from '@/components/AppShell';
import PageHeader from '@/components/ui/PageHeader';
import Panel from '@/components/ui/Panel';
import Tabs from '@/components/ui/Tabs';
import SourceNote from '@/components/ui/SourceNote';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import ChoroplethMap from '@/components/ChoroplethMap';
import LineChart from '@/components/LineChart';
import RankingTable from '@/components/RankingTable';
import IndicatorSelect from '@/components/controls/IndicatorSelect';
import YearSelect from '@/components/controls/YearSelect';
import { DEFAULT_INDICATOR, getCatalog, getIndicatorYears, getWorldSeries, getYearValues, isCityIndicator, pickYear, rankValues } from '@/lib/data';
import { formatValue, isAdditive, unitLabel } from '@/lib/format';

export const dynamic = 'force-dynamic';

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'map', label: 'Map' },
  { key: 'data', label: 'Data' },
  { key: 'metadata', label: 'Metadata' },
];

export default async function IndicatorsPage({ searchParams }: { searchParams: { indicator?: string; year?: string; tab?: string } }) {
  const catalog = await getCatalog();
  const meta = catalog.find((c) => c.slug === searchParams.indicator) ?? catalog.find((c) => c.slug === DEFAULT_INDICATOR) ?? catalog[0];
  if (!meta) {
    return (
      <AppShell active="Indicators">
        <EmptyState title="No indicators available yet" />
      </AppShell>
    );
  }

  const tab = TABS.some((t) => t.key === searchParams.tab) ? (searchParams.tab as string) : 'overview';
  const [years, world] = await Promise.all([getIndicatorYears(meta.slug), getWorldSeries(meta.slug)]);
  const year = pickYear(years, searchParams.year, meta.ref_year) ?? 0;
  const rows = await getYearValues(meta.slug, year);
  const ranked = rankValues(rows, meta.higher_is_better);
  const city = isCityIndicator(meta.slug);
  const additive = isAdditive(meta.unit);

  const options = catalog.map((c) => ({ slug: c.slug, name: c.name, category: c.category }));
  const href = (t: string) => {
    const p = new URLSearchParams({ indicator: meta.slug, tab: t });
    if (searchParams.year) p.set('year', searchParams.year);
    return `/indicateurs?${p.toString()}`;
  };

  // Statistiques descriptives de l'année affichée
  const values = rows.map((r) => r.value).sort((a, b) => a - b);
  const q = (p: number) => (values.length ? values[Math.min(values.length - 1, Math.floor(p * (values.length - 1)))] : null);
  const stats = [
    { label: additive ? 'Sum of countries' : 'Median', value: additive ? values.reduce((s, v) => s + v, 0) : q(0.5) },
    { label: 'Minimum', value: values[0] ?? null },
    { label: 'Maximum', value: values[values.length - 1] ?? null },
    { label: 'Countries', value: null, text: String(rows.length) },
  ];

  // Série mondiale : on n'affiche que les années à couverture comparable (≥ 80 % de la couverture max)
  const maxN = Math.max(0, ...world.map((w) => w.n));
  const comparable = world.filter((w) => w.n >= maxN * 0.8);

  return (
    <AppShell active="Indicators">
      <PageHeader
        kicker={meta.category ?? 'Indicator'}
        title={meta.name}
        description={meta.definition ?? undefined}
        actions={
          <>
            <IndicatorSelect options={options} value={meta.slug} />
            <YearSelect years={years} value={year} refYear={meta.ref_year} />
          </>
        }
      />

      <Tabs tabs={TABS.map((t) => ({ ...t, href: href(t.key) }))} active={tab} />

      {tab === 'overview' && (
        <div className="grid gap-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl border border-border bg-panel px-4 py-3.5">
                <div className="text-[11px] text-textMuted">
                  {s.label} · {year}
                </div>
                <div className="font-mono text-[19px] text-white mt-1">{s.text ?? formatValue(s.value, meta.unit)}</div>
              </div>
            ))}
          </div>

          {!city && (
            <Panel
              title={additive ? 'World total over time' : 'World median over time'}
              subtitle={`Years where at least 80% of the ${maxN} covered countries report data · ${unitLabel(meta.unit)}`}
            >
              <LineChart
                series={[{ label: additive ? 'Total' : 'Median', points: comparable.map((w) => ({ x: w.year, y: additive ? w.total : w.median })) }]}
                unit={meta.unit}
                fill
              />
            </Panel>
          )}

          <Panel title={`Ranking ${year}`} subtitle="Top 10" right={<Link href={href('data')} className="text-[12px] text-accent hover:underline">All countries →</Link>}>
            <RankingTable rows={ranked.slice(0, 10)} unit={meta.unit} linkable={!city} />
          </Panel>
          <SourceNote meta={meta} year={year} count={rows.length} />
        </div>
      )}

      {tab === 'map' && (
        <Panel title={`${meta.name} — ${year}`} subtitle={`${rows.length} ${city ? 'cities' : 'countries'} with data`}>
          {city ? (
            <EmptyState title="This indicator covers cities, not countries">See the Data tab for the full list.</EmptyState>
          ) : (
            <ChoroplethMap
              data={rows.map((r) => ({ slug: r.entity_slug, name: r.entity_name, iso: r.iso_code, value: r.value, projection: r.is_projection }))}
              unit={meta.unit}
              label={`${meta.name} (${year})`}
            />
          )}
          <div className="mt-4">
            <SourceNote meta={meta} year={year} count={rows.length} />
          </div>
        </Panel>
      )}

      {tab === 'data' && (
        <Panel
          title={`All ${city ? 'cities' : 'countries'} — ${year}`}
          subtitle={`${rows.length} entries · ${unitLabel(meta.unit)}`}
          right={
            <a href={`/api/export/${meta.slug}`} className="rounded-md border border-border px-3 py-1.5 text-[12px] text-textSecondary hover:text-white">
              Download CSV
            </a>
          }
        >
          {ranked.length ? <RankingTable rows={ranked} unit={meta.unit} linkable={!city} /> : <EmptyState title="No data for this year" />}
          <div className="mt-4">
            <SourceNote meta={meta} year={year} count={rows.length} />
          </div>
        </Panel>
      )}

      {tab === 'metadata' && (
        <Panel title="About this indicator">
          <dl className="grid sm:grid-cols-[200px_1fr] gap-x-6 gap-y-3 text-[13px]">
            {[
              ['Name', meta.name],
              ['Definition', meta.definition ?? '—'],
              ['Unit', unitLabel(meta.unit)],
              ['Category', meta.category ?? '—'],
              ['Source', [meta.source_name, meta.dataset_title].filter(Boolean).join(' — ') || '—'],
              ['Coverage', `${meta.first_year}–${meta.last_actual_year} observed${meta.last_year && meta.last_actual_year && meta.last_year > meta.last_actual_year ? `, projections to ${meta.last_year}` : ''}`],
              ['Reference year', `${meta.ref_year} (latest year with at least 80% of countries reporting) — ${meta.ref_coverage} ${city ? 'cities' : 'countries'}`],
              ['Frequency', meta.sub_annual ? 'Quarterly or monthly — the annual value is the last period of the year, year-on-year' : 'Annual'],
              ['Ranking direction', meta.higher_is_better === null ? 'Neutral (sorted from highest to lowest)' : meta.higher_is_better ? 'Higher is better' : 'Lower is better'],
            ].map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-textMuted">{k}</dt>
                <dd className="text-white">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-5 flex flex-wrap gap-2">
            {meta.source_url && (
              <a href={meta.source_url} target="_blank" rel="noopener noreferrer" className="rounded-md border border-border px-3 py-1.5 text-[12px] text-textSecondary hover:text-white">
                Visit source ↗
              </a>
            )}
            <a href={`/api/export/${meta.slug}`} className="rounded-md border border-border px-3 py-1.5 text-[12px] text-textSecondary hover:text-white">
              Download CSV
            </a>
            {years.some((y) => y.is_projection) && <Badge tone="warn">Includes official projections</Badge>}
          </div>
        </Panel>
      )}
    </AppShell>
  );
}
