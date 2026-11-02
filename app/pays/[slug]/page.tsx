import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import AppShell from '@/components/AppShell';
import Panel from '@/components/ui/Panel';
import Badge from '@/components/ui/Badge';
import Flag from '@/components/ui/Flag';
import LineChart from '@/components/LineChart';
import { supabase } from '@/lib/supabase';
import { getCountryExtras } from '@/lib/country-facts';
import { getCountryForecasts, getCountryIndicators, getCountrySeries } from '@/lib/data';
import { formatValue } from '@/lib/format';
import { regionOf, ISO } from '@/lib/iso';

export const dynamic = 'force-dynamic';

async function getEntity(slug: string) {
  const { data } = await supabase
    .from('entities')
    .select('id, slug, name_default, iso_code, entity_type')
    .eq('slug', slug)
    .eq('entity_type', 'country')
    .maybeSingle();
  return data;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const e = await getEntity(params.slug);
  if (!e) return { title: 'Country not found — Statlas' };
  return {
    title: `${e.name_default} — key statistics | Statlas`,
    description: `GDP, population, human development, life expectancy and more for ${e.name_default}, with sources and world rankings.`,
  };
}

const TREND_DEFAULT = 'gdp-ppp-per-capita-intl-dollar';

export default async function CountryPage({ params, searchParams }: { params: { slug: string }; searchParams: { trend?: string } }) {
  const entity = await getEntity(params.slug);
  if (!entity) notFound();

  const [extras, indicators, forecasts] = await Promise.all([
    getCountryExtras(entity.id),
    getCountryIndicators(entity.id),
    getCountryForecasts(entity.slug),
  ]);
  const { facts, currencyName, memberships } = extras;

  const trendSlug = indicators.some((i) => i.meta.slug === searchParams.trend)
    ? (searchParams.trend as string)
    : indicators.some((i) => i.meta.slug === TREND_DEFAULT)
      ? TREND_DEFAULT
      : indicators[0]?.meta.slug;
  const trendMeta = indicators.find((i) => i.meta.slug === trendSlug)?.meta;
  const series = trendSlug ? (await getCountrySeries(trendSlug, [entity.slug]))[entity.slug] ?? [] : [];

  const byCategory = new Map<string, typeof indicators>();
  for (const i of indicators) {
    const c = i.meta.category ?? 'Other';
    if (!byCategory.has(c)) byCategory.set(c, []);
    byCategory.get(c)!.push(i);
  }

  const factRows: [string, React.ReactNode][] = [];
  if (facts?.capital) factRows.push(['Capital', facts.capital]);
  factRows.push(['Region', `${regionOf(entity.iso_code)}${entity.iso_code && ISO[entity.iso_code]?.[2] ? ' · ' + ISO[entity.iso_code][2] : ''}`]);
  if (facts?.official_languages?.length) factRows.push(['Languages', facts.official_languages.join(', ')]);
  if (facts?.currency_code) factRows.push(['Currency', `${currencyName ?? facts.currency_code} (${facts.currency_code})`]);
  if (facts?.area_km2) factRows.push(['Area', `${new Intl.NumberFormat('en-US').format(Number(facts.area_km2))} km²`]);
  if (facts?.borders_iso3) factRows.push(['Land borders', facts.borders_iso3.length === 0 ? 'None' : `${facts.borders_iso3.length} ${facts.borders_iso3.length === 1 ? 'country' : 'countries'}`]);
  if (facts) factRows.push(['Landlocked', facts.landlocked ? 'Yes' : 'No']);
  if (facts) factRows.push(['UN member', facts.un_member ? 'Yes' : 'No']);

  return (
    <AppShell active="Countries">
      <Link href="/pays" className="text-[12px] text-textMuted hover:text-white">
        ← All countries
      </Link>

      <div className="mt-3 mb-6 flex items-center gap-4">
        <Flag iso={entity.iso_code} size="lg" />
        <div className="min-w-0">
          <h1 className="font-serif text-[28px] sm:text-[32px] leading-tight text-white">{entity.name_default}</h1>
          {facts?.official_name && <div className="text-[13px] text-textMuted">{facts.official_name}</div>}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <Panel title="Key facts" className="lg:col-span-1">
          <dl className="grid grid-cols-[110px_1fr] gap-y-2 text-[13px]">
            {factRows.map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-textMuted">{k}</dt>
                <dd className="text-white text-right">{v}</dd>
              </div>
            ))}
          </dl>
          {memberships.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-1.5">
              {memberships.map((g) => (
                <Badge key={g.slug}>{g.name_default}</Badge>
              ))}
            </div>
          )}
        </Panel>

        <Panel
          title={trendMeta ? trendMeta.name : 'Trend'}
          subtitle={trendMeta ? `${trendMeta.source_name ?? ''} · dashed line = projection` : undefined}
          className="lg:col-span-2"
        >
          <div className="flex flex-wrap gap-1.5 mb-3">
            {indicators
              .filter((i) => i.meta.first_year !== i.meta.last_year)
              .map((i) => (
                <Link
                  key={i.meta.slug}
                  href={`/pays/${entity.slug}?trend=${i.meta.slug}`}
                  scroll={false}
                  className={`rounded-full border px-2.5 py-1 text-[11px] ${
                    i.meta.slug === trendSlug ? 'border-accent bg-accent/15 text-white' : 'border-border text-textSecondary hover:text-white'
                  }`}
                >
                  {i.meta.name}
                </Link>
              ))}
          </div>
          <LineChart
            series={[{ label: entity.name_default, points: series.map((p) => ({ x: p.year, y: p.value, projection: p.is_projection })) }]}
            unit={trendMeta?.unit}
            height={240}
            fill
          />
        </Panel>
      </div>

      {indicators.length === 0 && <div className="text-textMuted text-sm">No statistics available yet for this country.</div>}

      {Array.from(byCategory.entries()).map(([cat, items]) => (
        <section key={cat} className="mb-6">
          <h2 className="text-[11px] uppercase tracking-[0.14em] text-textMuted mb-3">{cat}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {items.map((i) => {
              const fc = forecasts.get(i.meta.slug);
              return (
                <Link
                  key={i.meta.slug}
                  href={`/rankings/${i.meta.slug}`}
                  className="rounded-xl border border-border bg-panel p-4 hover:border-accent/60 transition-colors"
                >
                  <div className="text-[12px] text-textSecondary leading-snug min-h-[32px]">{i.meta.name}</div>
                  <div className="mt-1.5 flex items-baseline justify-between gap-2">
                    <span className="font-mono text-[22px] text-white">{formatValue(i.value, i.meta.unit)}</span>
                    {i.rank !== null && (
                      <span className="text-[11px] text-textMuted whitespace-nowrap">
                        #{i.rank} of {i.rankTotal}
                      </span>
                    )}
                  </div>
                  <div className="mt-1.5 text-[11px] text-textMuted flex flex-wrap gap-x-2">
                    <span>
                      {i.year}
                      {i.is_projection ? ' (projection)' : ''}
                    </span>
                    {i.rank !== null && i.rankYear !== i.year && <span>· rank as of {i.rankYear}</span>}
                    <span>· {i.meta.source_name}</span>
                  </div>
                  {fc && fc.year > i.year && (
                    <div className="mt-2 text-[11px] text-yellow/90">
                      Forecast {fc.year}: {formatValue(fc.value, i.meta.unit)}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </section>
      ))}

      <p className="text-[11.5px] text-textMuted">
        Values show the latest observed year for each indicator. Ranks compare countries on the most recent year with broad coverage. Forecasts are the source&apos;s own
        projections.
      </p>
    </AppShell>
  );
}
