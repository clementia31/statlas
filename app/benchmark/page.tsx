import Link from 'next/link';
import AppShell from '@/components/AppShell';
import PageHeader from '@/components/ui/PageHeader';
import Panel from '@/components/ui/Panel';
import RadarChart from '@/components/RadarChart';
import CountrySelector from '@/components/CountrySelector';
import { SERIES_COLORS } from '@/components/LineChart';
import { getBenchmarkData, PRESETS, type BenchmarkMode } from '@/lib/benchmark';
import { formatValue } from '@/lib/format';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Benchmark countries — Statlas',
  description: 'Compare up to six countries across development and economic indicators on a single radar chart.',
};

export default async function BenchmarkPage({ searchParams }: { searchParams: { countries?: string; mode?: string; preset?: string } }) {
  const presetKey = searchParams.preset && PRESETS[searchParams.preset] ? searchParams.preset : 'development';
  const mode: BenchmarkMode = searchParams.mode === 'minmax' ? 'minmax' : 'percentile';
  const requested = (searchParams.countries ?? 'france,germany,japan')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 6);

  const data = await getBenchmarkData(requested, mode, presetKey);
  const countrySlugs = requested.filter((s) => data.names[s]);

  const href = (o: Record<string, string>) => {
    const p = new URLSearchParams({ countries: countrySlugs.join(','), mode, preset: presetKey, ...o });
    return `/benchmark?${p.toString()}`;
  };
  const pill = (active: boolean) =>
    `rounded-full border px-3 py-1.5 text-[12px] ${active ? 'border-accent bg-accent/15 text-white' : 'border-border text-textSecondary hover:text-white'}`;

  return (
    <AppShell active="Benchmark">
      <PageHeader
        kicker="Benchmark"
        title="Country benchmark"
        description="Each axis shows where a country stands among all countries with data (100 = best). Raw values and years are in the table below."
      />

      <div className="flex flex-col gap-3 mb-5">
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(PRESETS).map(([k, p]) => (
            <Link key={k} href={href({ preset: k })} className={pill(presetKey === k)}>
              {p.label}
            </Link>
          ))}
          <span className="w-px bg-border mx-1" />
          <Link href={href({ mode: 'percentile' })} className={pill(mode === 'percentile')}>
            Percentile rank
          </Link>
          <Link href={href({ mode: 'minmax' })} className={pill(mode === 'minmax')}>
            Min–max score
          </Link>
        </div>
        <CountrySelector
          selected={countrySlugs.map((s) => ({ slug: s, name: data.names[s] ?? s }))}
          allCountries={data.completeCountries}
          basePath="/benchmark"
          baseParams={{ mode, preset: presetKey }}
        />
        <div className="text-[11px] text-textMuted">Only countries with data for every axis of this preset can be added.</div>
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        <Panel title={data.preset.label} subtitle={mode === 'percentile' ? 'Percentile among all countries' : 'Min–max score (0 = lowest, 100 = highest)'} className="lg:col-span-3">
          <div className="max-w-[560px] mx-auto">
            <RadarChart
              labels={data.columns.map((c) => c.label)}
              datasets={countrySlugs.map((s) => ({ label: data.names[s] ?? s, data: (data.scores[s] ?? []).map((v) => v ?? 0) }))}
              max={100}
            />
          </div>
        </Panel>

        <Panel title="Values" subtitle="Latest year with broad coverage" className="lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className="text-left text-[11px] text-textMuted border-b border-border">
                  <th className="py-2 pr-2 font-medium">Indicator</th>
                  {countrySlugs.map((s, i) => (
                    <th key={s} className="py-2 px-2 font-medium text-right whitespace-nowrap">
                      <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ background: SERIES_COLORS[i % SERIES_COLORS.length] }} />
                      {data.names[s]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.columns.map((c, ci) => (
                  <tr key={c.slug} className="border-b border-border/60">
                    <td className="py-2 pr-2 text-textSecondary">
                      <Link href={`/rankings/${c.slug}`} className="hover:text-white">
                        {c.label}
                      </Link>
                      <span className="block text-[10.5px] text-textMuted">
                        {c.year} · {c.source}
                      </span>
                    </td>
                    {countrySlugs.map((s) => (
                      <td key={s} className="py-2 px-2 text-right font-mono text-white whitespace-nowrap">
                        {formatValue(data.raw[s]?.[ci], c.unit)}
                        <span className="block text-[10.5px] text-textMuted">{data.scores[s]?.[ci] != null ? Math.round(data.scores[s][ci] as number) : '—'}/100</span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
