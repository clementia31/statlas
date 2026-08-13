import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import TrendChart from '@/components/TrendChart';
import { getLatestObservationsByIndicator, getIndicatorTimeSeries } from '@/lib/supabase';
import { formatValue } from '@/lib/format';

export const dynamic = 'force-dynamic';

const TABS = ['Overview', 'Data', 'Charts', 'Map', 'Analysis', 'Metadata'];

export default async function IndicatorDetailPage({
  searchParams,
}: {
  searchParams: { indicator?: string; q?: string; tab?: string };
}) {
  const indicatorSlug = searchParams.indicator ?? 'human-development-index';
  const query = (searchParams.q ?? '').toLowerCase().trim();
  const activeTab = searchParams.tab ?? 'Overview';

  const [{ indicator, rows }, { series }] = await Promise.all([
    getLatestObservationsByIndicator(indicatorSlug),
    getIndicatorTimeSeries(indicatorSlug),
  ]);

  const ranked = rows
    .filter((r) => r.entity)
    .filter((r) => r.entity!.name_default.toLowerCase().includes(query))
    .sort((a, b) => b.value_number - a.value_number)
    .slice(0, 50);

  function tabHref(tab: string) {
    const params = new URLSearchParams();
    params.set('indicator', indicatorSlug);
    params.set('tab', tab);
    if (query) params.set('q', searchParams.q ?? '');
    return `/indicateurs?${params.toString()}`;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar active="Indicators" />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />

        <div className="p-[22px]">
          <div className="mb-3">
            <div className="font-serif text-2xl">
              {indicator?.name_default ?? indicatorSlug}
            </div>
            <div className="text-textMuted text-xs mt-1">
              {ranked.length} countries ranked — latest available values
              {query ? ` matching "${searchParams.q}"` : ''}
            </div>
          </div>

          <div className="flex gap-1 border-b border-border mb-4">
            {TABS.map((tab) => (
              <a
                key={tab}
                href={tabHref(tab)}
                className={`px-3.5 py-2 text-sm ${
                  tab === activeTab
                    ? 'text-white border-b-2 border-accent'
                    : 'text-textSecondary border-b-2 border-transparent hover:text-white'
                }`}
              >
                {tab}
              </a>
            ))}
          </div>

          {activeTab === 'Overview' ? (
            <>
              <div className="bg-panel border border-border rounded-[10px] p-4 max-w-3xl mb-4">
                <div className="text-textMuted text-[11px] mb-2">world average over time</div>
                <TrendChart
                  labels={series.map((s) => s.year)}
                  values={series.map((s) => Number(s.average.toFixed(3)))}
                />
              </div>

              <div className="bg-panel border border-border rounded-[10px] p-4 max-w-xl max-h-[70vh] overflow-auto">
                {ranked.map((r, i) => (
                  <div
                    key={r.entity_id}
                    className="flex justify-between py-1.5 border-b border-border text-sm last:border-b-0"
                  >
                    <span>
                      <span className="text-textMuted font-mono mr-2 inline-block w-5">{i + 1}</span>
                      {r.entity!.name_default}
                    </span>
                    <span className="font-mono font-medium">{formatValue(r.value_number, indicator?.unit)}</span>
                  </div>
                ))}
                {ranked.length === 0 && (
                  <div className="text-textMuted text-sm py-4">No data matches this search.</div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-panel border border-border rounded-[10px] p-8 max-w-3xl text-center">
              <div className="text-textMuted text-sm italic">
                {activeTab} — coming in a later phase.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
