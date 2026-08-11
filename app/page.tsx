import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import KpiCard from '@/components/KpiCard';
import WorldMap from '@/components/WorldMap';
import { getLatestObservationsByIndicator } from '@/lib/supabase';

export const revalidate = 300;

const NAME_OVERRIDES: Record<string, string> = {
  'United States': 'United States of America',
};

const INDICATOR_LABELS: Record<string, string> = {
  'human-development-index': 'Indice de développement humain',
  'gdp-nominal-usd': 'PIB nominal',
  'fertility-rate': 'Taux de fécondité',
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
      <Sidebar active="Vue globale" />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />

        <div className="flex-1 flex min-h-0">
          <div className="flex-1 min-w-0 p-[18px] overflow-auto">
            <div className="bg-panel border border-border rounded-[10px] p-4 relative mb-4">
              <div className="mb-2.5">
                <div className="font-serif text-[17px]">
                  {indicator?.name_default ?? INDICATOR_LABELS[indicatorSlug] ?? indicatorSlug}
                </div>
                <div className="text-textMuted text-xs mt-0.5">
                  Vision macro des indicateurs clés à travers le monde
                  {' — '}
                  {mapData.length} pays avec données
                </div>
              </div>
              <WorldMap
                data={mapData}
                indicatorLabel={indicator?.name_default ?? indicatorSlug}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <KpiCard label="moyenne mondiale" value={average} delta="" positive />
              <KpiCard label="pib mondial (ppa)" value="190.4 t$" delta="+2.9%" positive />
              <KpiCard label="population" value="8.19 md" delta="+0.9%" positive />
              <KpiCard label="dette publique moy." value="78.4%" delta="+1.2 pt" positive={false} />
              <KpiCard label="espér. vie" value="73.1 ans" delta="+0.2" positive />
              <KpiCard label="gini moyen" value="36.4" delta="-0.3" positive={false} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
