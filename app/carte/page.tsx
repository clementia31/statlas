import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import AnimatedWorldMap from '@/components/AnimatedWorldMap';
import { getIndicatorAllYears } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function CartePage({
  searchParams,
}: {
  searchParams: { indicator?: string; q?: string };
}) {
  const indicatorSlug = searchParams.indicator ?? 'human-development-index';
  const query = (searchParams.q ?? '').toLowerCase().trim();
  const { indicator, years, yearsData } = await getIndicatorAllYears(indicatorSlug);

  const filteredYearsData = query
    ? Object.fromEntries(
        Object.entries(yearsData).map(([year, rows]) => [
          year,
          rows.filter((r) => r.name.toLowerCase().includes(query)),
        ])
      )
    : yearsData;

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
                Animated over {years.length} years
                {query ? ` — filtered by "${searchParams.q}"` : ''}
                {' — '}use the indicator selector above to switch
              </div>
            </div>
            <AnimatedWorldMap
              years={years}
              yearsData={filteredYearsData}
              indicatorLabel={indicator?.name_default ?? indicatorSlug}
              indicatorUnit={indicator?.unit}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
