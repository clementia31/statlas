import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import KpiCard from '@/components/KpiCard';
import WorldMap from '@/components/WorldMap';
import { getLatestObservationsByIndicator } from '@/lib/supabase';

export const revalidate = 300;

const NAME_OVERRIDES: Record<string, string> = {
  'United States': 'United States of America',
};

export default async function VueGlobalePage({
  searchParams,
}: {
  searchParams: { indicator?: string };
}) {
  const indicatorSlug = searchParams.indicator ?? 'human-development-index';
  const { indicator, rows } = await getLatestObservationsByIndicator(indicatorSlug);

  const mapData = rows
    .filter((r) => r.entity)
    .map((r) => {
      const rawName = r.entity!.name_default;
      return {
        slug: r.entity!.slug,
        name: NAME_OVERRIDES[rawName] ?? rawName,
        value: r.value_number,
      };
    });

  const average =
    mapData.length > 0
      ? (mapData.reduce((sum, d) => sum + d.value, 0) / mapData.length).toFixed(3)
      : '—';

  return (
    <div className="flex min-h-screen">
      <Sidebar active="Overview" />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />

        <div className="flex-1 flex min-h-0">
          <div className="flex-1 min-w-0 p-[18px] overflow-auto">
            <div className="bg-panel border border-border rounded-[10px] p-4 relative mb-4">
              <div className="mb-2.5">
                <div className="font-serif text-[17px]">
                  {indicator?.name_default ?? indicatorSlug}
                </div>
                <div className="text-textMuted text-xs mt-0.5">
                  Global overview of key indicators worldwide
                  {' — '}
                  {mapData.length} countries with data
                </div>
              </div>
              <WorldMap
                data={mapData}
                indicatorLabel={indicator?.name_default ?? indicatorSlug}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <KpiCard label="world average" value={average} delta="" positive />
              <KpiCard label="world gdp (ppp)" value="190.4 t$" delta="+2.9%" positive />
              <KpiCard label="population" value="8.19 bn" delta="+0.9%" positive />
              <KpiCard label="avg public debt" value="78.4%" delta="+1.2 pt" positive={false} />
              <KpiCard label="life expectancy" value="73.1 yrs" delta="+0.2" positive />
              <KpiCard label="avg gini" value="36.4" delta="-0.3" positive={false} />
            </div>
          </div>

          <div className="w-[260px] border-l border-border bg-panel p-4 shrink-0 hidden lg:block">
            <div className="text-xs text-textSecondary font-medium mb-2.5">Economic news</div>
            <div className="text-textMuted text-[11px] italic py-2">
              Coming in a later phase — reserved space for now.
            </div>
            <div className="text-xs text-textSecondary font-medium mt-5 mb-2.5">Active alerts</div>
            <div className="text-textMuted text-[11px] italic py-2">
              Coming in a later phase — reserved space for now.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
