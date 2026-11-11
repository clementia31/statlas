import OriginalWorks from '@/components/ui/OriginalWorks';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import PageHeader from '@/components/ui/PageHeader';
import Panel from '@/components/ui/Panel';
import CompareTable from '@/components/CompareTable';
import CountrySelector from '@/components/CountrySelector';
import LineChart from '@/components/LineChart';
import IndicatorSelect from '@/components/controls/IndicatorSelect';
import { getCountries, getCountryCatalog, getCountrySeries, getYearValues } from '@/lib/data';

export const dynamic = 'force-dynamic';

// Colonnes du tableau comparatif : chaque colonne utilise l'année de référence de son indicateur
const TABLE_INDICATORS = [
  { slug: 'population-total', label: 'Population' },
  { slug: 'gdp-nominal-usd', label: 'GDP' },
  { slug: 'gdp-ppp-per-capita-intl-dollar', label: 'GDP per capita (PPP)' },
  { slug: 'human-development-index', label: 'HDI' },
  { slug: 'life-expectancy-birth', label: 'Life expectancy' },
  { slug: 'gini-index', label: 'Gini' },
  { slug: 'public-debt-gdp-percent', label: 'Public debt' },
  { slug: 'unemployment-rate', label: 'Unemployment' },
  { slug: 'inflation-rate-cpi', label: 'Inflation' },
  { slug: 'co2-emissions-per-capita', label: 'CO2 per capita' },
];

export default async function ComparisonsPage({ searchParams }: { searchParams: { indicator?: string; countries?: string } }) {
  const [catalog, countries] = await Promise.all([getCountryCatalog(), getCountries()]);
  const bySlug = new Map(catalog.map((c) => [c.slug, c]));

  const columns = TABLE_INDICATORS.filter((t) => bySlug.has(t.slug)).map((t) => {
    const m = bySlug.get(t.slug)!;
    return { slug: t.slug, label: t.label, unit: m.unit, year: m.ref_year };
  });
  const columnValues = await Promise.all(columns.map((c) => (c.year ? getYearValues(c.slug, c.year) : Promise.resolve([]))));

  const rows = countries.map((c) => ({ slug: c.slug, name: c.name, iso: c.iso, values: {} as Record<string, number | undefined> }));
  const rowBySlug = new Map(rows.map((r) => [r.slug, r]));
  columns.forEach((c, i) => {
    for (const v of columnValues[i]) {
      const r = rowBySlug.get(v.entity_slug);
      if (r) r.values[c.slug] = v.value;
    }
  });
  const tableRows = rows.filter((r) => Object.keys(r.values).length > 0);

  // Graphique : un indicateur, jusqu'à 6 pays
  const chartMeta = bySlug.get(searchParams.indicator ?? '') ?? bySlug.get('gdp-ppp-per-capita-intl-dollar') ?? catalog[0];
  const selected = (searchParams.countries ?? 'france,germany,united-states,china,japan')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => countries.some((c) => c.slug === s))
    .slice(0, 6);
  const series = chartMeta ? await getCountrySeries(chartMeta.slug, selected) : {};
  const nameOf = new Map(countries.map((c) => [c.slug, c.name]));

  return (
    <AppShell active="Comparisons">
      <PageHeader
        kicker="Compare"
        title="Compare countries"
        description="Follow several countries over time, or scan every country side by side. Each column uses the latest year with broad coverage for that indicator."
        actions={
          <Link
            href="/benchmark"
            className="inline-flex h-11 items-center rounded-lg border border-borderStrong bg-panel px-4 text-[14px] font-medium hover:border-accent"
          >
            See as a benchmark →
          </Link>
        }
      />

      {chartMeta && (
        <Panel
          title={`${chartMeta.name} over time`}
          subtitle={`${chartMeta.source_name ?? ''} · dashed segments are projections`}
          className="mb-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-end gap-3 mb-4">
            <IndicatorSelect options={catalog.map((c) => ({ slug: c.slug, name: c.name, category: c.category }))} value={chartMeta.slug} />
            <div className="flex-1">
              <CountrySelector
                selected={selected.map((s) => ({ slug: s, name: nameOf.get(s) ?? s }))}
                allCountries={countries.map((c) => ({ slug: c.slug, name_default: c.name }))}
                basePath="/comparaisons"
                baseParams={{ indicator: chartMeta.slug }}
              />
            </div>
          </div>
          <LineChart
            series={selected.map((s) => ({
              label: nameOf.get(s) ?? s,
              points: (series[s] ?? []).map((p) => ({ x: p.year, y: p.value, projection: p.is_projection })),
            }))}
            unit={chartMeta.unit}
            height={320}
          />
          <OriginalWorks slug={chartMeta.slug} />
        </Panel>
      )}

      <Panel title="All countries" subtitle="Latest year with broad coverage, shown under each column">
        <CompareTable columns={columns} rows={tableRows} />
      </Panel>
    </AppShell>
  );
}
