import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import WorldMap from '@/components/WorldMap';
import { getLatestObservationsByIndicator } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const NAME_OVERRIDES: Record<string, string> = {
  'United States': 'United States of America',
};

export default async function CartePage({
  searchParams,
}: {
  searchParams: { indicator?: string; q?: string };
}) {
  const indicatorSlug = searchParams.indicator ?? 'human-development-index';
  const query = (searchParams.q ?? '').toLowerCase().trim();
  const { indicator, rows } = await getLatestObservationsByIndicator(indicatorSlug);

  const allMapData = rows
    .filter((r) => r.entity)
    .map((r) => {
      const rawName = r.entity!.name_default;
      return {
        slug: r.entity!.slug,
        name: NAME_OVERRIDES[rawName] ?? rawName,
        value: r.value_number,
      };
    });

  const mapData = query
    ? allMapData.filter((d) => d.name.toLowerCase().includes(query))
    : allMapData;

  return (
    <div className="flex min-h-screen">
      <Sidebar active="Map" />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />

        <div className="p-[18px]">
          <div className="bg-panel border border-border rounded-[10px] p-4">
            <div className="mb-2.5">
              <div className="font-serif text-[17px]">
                {indicator?.name_default ?? indicatorSlug}
              </div>
              <div className="text-textMuted text-xs mt-0.5">
                {mapData.length} countries with data
                {query ? ` matching "${searchParams.q}"` : ''}
                {' — '}use the indicator selector above to switch
              </div>
            </div>
            <WorldMap
              data={mapData}
              indicatorLabel={indicator?.name_default ?? indicatorSlug}
              indicatorUnit={indicator?.unit}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
