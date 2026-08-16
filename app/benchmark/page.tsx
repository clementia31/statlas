import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import RadarChart from '@/components/RadarChart';
import { getBenchmarkData, getAllCountriesForSelect, OVERVIEW_PRESET } from '@/lib/benchmark';
import { formatValue } from '@/lib/format';

export const dynamic = 'force-dynamic';

const COLORS = ['#3B82F6', '#22C55E', '#EAB308', '#EF4444', '#A855F7', '#F97316'];

export default async function BenchmarkPage({
  searchParams,
}: {
  searchParams: { countries?: string; mode?: string };
}) {
  const countrySlugs = (searchParams.countries ?? 'france,germany')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 6);

  const mode = searchParams.mode === 'percentile' ? 'percentile' : 'minmax';

  const [{ labels, countryNames, scoresByCountry, rawByCountry, indicatorUnits }, allCountries] =
    await Promise.all([
      getBenchmarkData(countrySlugs, mode),
      getAllCountriesForSelect(),
    ]);

  const datasets = countrySlugs.map((slug) => ({
    label: countryNames[slug] ?? slug,
    data: scoresByCountry[slug] ?? [],
  }));

  function modeHref(m: string) {
    const params = new URLSearchParams();
    params.set('countries', countrySlugs.join(','));
    params.set('mode', m);
    return `/benchmark?${params.toString()}`;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar active="Benchmark" />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />

        <div className="p-[22px] max-w-4xl">
          <div className="mb-1">
            <div className="font-serif text-2xl">Benchmark</div>
            <div className="text-textMuted text-xs mt-1">
              Overview preset — {labels.length} categories, {countrySlugs.length} countries
            </div>
          </div>

          <div className="flex gap-2 mb-5">
            <a
              href={modeHref('minmax')}
              className={`text-xs px-3 py-1.5 rounded-md border ${
                mode === 'minmax' ? 'border-accent text-white bg-panel2' : 'border-border text-textMuted hover:text-white'
              }`}
            >
              Min-max (0-100)
            </a>
            <a
              href={modeHref('percentile')}
              className={`text-xs px-3 py-1.5 rounded-md border ${
                mode === 'percentile' ? 'border-accent text-white bg-panel2' : 'border-border text-textMuted hover:text-white'
              }`}
            >
              Percentile rank
            </a>
          </div>

          <div className="bg-panel border border-border rounded-[10px] p-4 mb-4">
            <RadarChart labels={labels} datasets={datasets} />
            <div className="flex gap-4 mt-3 flex-wrap">
              {countrySlugs.map((slug, i) => (
                <span key={slug} className="flex items-center gap-1.5 text-xs text-textSecondary">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  {countryNames[slug] ?? slug}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-panel border border-border rounded-[10px] overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-textMuted text-[11px] border-b border-border">
                  <th className="text-left p-2 font-medium">Country</th>
                  {labels.map((l) => (
                    <th key={l} className="text-right p-2 font-medium">{l}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="font-mono">
                {countrySlugs.map((slug) => (
                  <tr key={slug} className="border-b border-border last:border-b-0">
                    <td className="p-2 font-sans font-medium">
                      <a href={`/pays/${slug}`} className="hover:text-accent hover:underline">
                        {countryNames[slug] ?? slug}
                      </a>
                    </td>
                    {(rawByCountry[slug] ?? []).map((v, i) => (
                      <td key={i} className="text-right p-2">
                        {v !== null ? formatValue(v, indicatorUnits[i]) : '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-textMuted text-[11px] mt-4">
            Change countries by editing the URL, e.g. /benchmark?countries=france,germany,japan
          </div>
        </div>
      </div>
    </div>
  );
}
