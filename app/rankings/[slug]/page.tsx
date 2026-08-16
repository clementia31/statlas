import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { getRankingForIndicator } from '@/lib/rankings';
import { getSourcesForIndicator } from '@/lib/sources';
import { formatValue } from '@/lib/format';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function RankingDetailPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { year?: string };
}) {
  const [{ indicator, year, years, ranked }, sources] = await Promise.all([
    getRankingForIndicator(params.slug, searchParams.year),
    getSourcesForIndicator(params.slug),
  ]);

  if (!indicator) {
    notFound();
  }

  const record = ranked[0];

  return (
    <div className="flex min-h-screen">
      <Sidebar active="Rankings" />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />

        <div className="p-[22px] max-w-3xl">
          <a href="/rankings" className="text-textMuted text-xs hover:text-white">← Rankings</a>

          <div className="mt-3 mb-1">
            <div className="font-serif text-2xl">{indicator.name_default} ranking</div>
            <div className="text-textMuted text-xs mt-1">{year} — {ranked.length} countries</div>
          </div>

          {sources.length > 0 && (
            <div className="text-textMuted text-[11px] mb-5">
              Source{sources.length > 1 ? 's' : ''}:{' '}
              {sources.map((s, i) => (
                <span key={i}>
                  {i > 0 && ', '}
                  {s.sourceUrl ? (
                    <a href={s.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:text-accent underline">
                      {s.sourceName}
                    </a>
                  ) : (
                    s.sourceName
                  )}
                </span>
              ))}
            </div>
          )}

          {record && (
            <div className="bg-panel border border-accent rounded-[10px] p-4 mb-5">
              <div className="text-textMuted text-[11px] mb-1">Record — {year}</div>
              <div className="flex items-baseline justify-between">
                <a href={`/pays/${record.slug}`} className="font-serif text-xl hover:text-accent">{record.name}</a>
                <span className="font-mono text-lg font-medium">{formatValue(record.value, indicator.unit)}</span>
              </div>
            </div>
          )}

          <div className="bg-panel border border-border rounded-[10px] overflow-hidden max-h-[65vh] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-panel">
                <tr className="text-textMuted text-[11px] border-b border-border">
                  <th className="text-left p-2 font-medium w-10">#</th>
                  <th className="text-left p-2 font-medium">Country</th>
                  <th className="text-right p-2 font-medium">Value</th>
                  <th className="text-right p-2 font-medium">Score (0-100)</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {ranked.map((r, i) => (
                  <tr key={r.slug} className="border-b border-border last:border-b-0">
                    <td className="p-2 text-textMuted">{i + 1}</td>
                    <td className="p-2 font-sans">
                      <a href={`/pays/${r.slug}`} className="text-textSecondary hover:text-accent hover:underline">
                        {r.name}
                      </a>
                    </td>
                    <td className="p-2 text-right">{formatValue(r.value, indicator.unit)}</td>
                    <td className="p-2 text-right text-textMuted">{r.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
