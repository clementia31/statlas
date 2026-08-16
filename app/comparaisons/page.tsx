import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { getLatestObservationsByIndicator } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const INDICATORS = [
  { slug: 'human-development-index', label: 'HDI' },
  { slug: 'gdp-nominal-usd', label: 'Nominal GDP (USD M)' },
  { slug: 'population-total', label: 'Population' },
  { slug: 'life-expectancy-birth', label: 'Life expectancy' },
];

export default async function ComparisonsPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const results = await Promise.all(
    INDICATORS.map((i) => getLatestObservationsByIndicator(i.slug))
  );

  const valuesByIndicator: Record<string, Map<string, number>> = {};
  const nameBySlug = new Map<string, string>();
  const allSlugs = new Set<string>();

  INDICATORS.forEach((ind, idx) => {
    const map = new Map<string, number>();
    for (const row of results[idx].rows) {
      if (row.entity) {
        map.set(row.entity.slug, row.value_number);
        allSlugs.add(row.entity.slug);
        if (!nameBySlug.has(row.entity.slug)) {
          nameBySlug.set(row.entity.slug, row.entity.name_default);
        }
      }
    }
    valuesByIndicator[ind.slug] = map;
  });

  const query = (searchParams.q ?? '').toLowerCase().trim();

  const sortedSlugs = Array.from(allSlugs)
    .filter((slug) => (nameBySlug.get(slug) ?? slug).toLowerCase().includes(query))
    .sort((a, b) => (nameBySlug.get(a) ?? a).localeCompare(nameBySlug.get(b) ?? b));

  return (
    <div className="flex min-h-screen">
      <Sidebar active="Comparisons" />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />

        <div className="p-[22px]">
          <div className="font-serif text-2xl mb-1">Country comparison</div>
          <div className="text-textMuted text-xs mb-1">
            Live data from Statlas — {sortedSlugs.length} countries, {INDICATORS.length} indicators
          </div>
          <div className="text-textMuted text-[11px] mb-4">
            <a href="/bibliographie" className="hover:text-accent underline">View all data sources →</a>
          </div>

          <div className="bg-panel border border-border rounded-[10px] overflow-auto max-w-4xl max-h-[70vh]">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-panel">
                <tr className="text-textMuted text-[11px] border-b border-border">
                  <th className="text-left p-2 font-medium">Country</th>
                  {INDICATORS.map((i) => (
                    <th key={i.slug} className="text-left p-2 font-medium">{i.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="font-mono">
                {sortedSlugs.map((slug) => (
                  <tr key={slug} className="border-b border-border last:border-b-0">
                    <td className="p-2 font-sans font-medium">
                      <a href={`/pays/${slug}`} className="hover:text-accent hover:underline">
                        {nameBySlug.get(slug) ?? slug}
                      </a>
                    </td>
                    {INDICATORS.map((i) => {
                      const v = valuesByIndicator[i.slug].get(slug);
                      return (
                        <td key={i.slug} className="p-2">
                          {v !== undefined ? v.toLocaleString() : '—'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {sortedSlugs.length === 0 && (
                  <tr>
                    <td colSpan={INDICATORS.length + 1} className="p-4 text-textMuted font-sans text-center">
                      No country matches your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
