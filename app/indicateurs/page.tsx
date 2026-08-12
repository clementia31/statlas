import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { getLatestObservationsByIndicator } from '@/lib/supabase';

export const revalidate = 300;

export default async function IndicatorDetailPage({
  searchParams,
}: {
  searchParams: { indicator?: string };
}) {
  const indicatorSlug = searchParams.indicator ?? 'human-development-index';
  const { indicator, rows } = await getLatestObservationsByIndicator(indicatorSlug);

  const ranked = rows
    .filter((r) => r.entity)
    .sort((a, b) => b.value_number - a.value_number)
    .slice(0, 15);

  return (
    <div className="flex min-h-screen">
      <Sidebar active="Indicators" />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />

        <div className="p-[22px]">
          <div className="mb-4">
            <div className="font-serif text-2xl">
              {indicator?.name_default ?? indicatorSlug}
            </div>
            <div className="text-textMuted text-xs mt-1">
              {ranked.length} countries ranked — latest available values
            </div>
          </div>

          <div className="bg-panel border border-border rounded-[10px] p-4 max-w-xl">
            <div className="text-textMuted text-[11px] mb-2">ranking</div>
            {ranked.map((r, i) => (
              <div
                key={r.entity_id}
                className="flex justify-between py-1.5 border-b border-border text-sm last:border-b-0"
              >
                <span>
                  <span className="text-textMuted font-mono mr-2 inline-block w-5">{i + 1}</span>
                  {r.entity!.name_default}
                </span>
                <span className="font-mono font-medium">{r.value_number}</span>
              </div>
            ))}
            {ranked.length === 0 && (
              <div className="text-textMuted text-sm py-4">No data for this indicator.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
