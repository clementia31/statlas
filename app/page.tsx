import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import KpiCard from '@/components/KpiCard';
import WorldMap from '@/components/WorldMap';
import { getLatestObservationsByIndicator } from '@/lib/supabase';

// Corrections de noms entre nos entités et les noms utilisés par world-atlas (Natural Earth)
const NAME_OVERRIDES: Record<string, string> = {
  'United States': 'United States of America',
  'South Korea': 'South Korea',
  Russia: 'Russia',
  Czechia: 'Czechia',
};

export default async function VueGlobalePage() {
  const { indicator, rows } = await getLatestObservationsByIndicator('human-development-index');

  const mapData = rows.map((r: any) => {
    const rawName = r.entities?.name_default ?? '';
    return {
      slug: r.entities?.slug ?? '',
      name: NAME_OVERRIDES[rawName] ?? rawName,
      value: r.value_number,
    };
  });

  const worldAverage =
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
                  {indicator?.name_default ?? 'Indice de développement humain'}
                </div>
                <div className="text-textMuted text-xs mt-0.5">
                  Vision macro des indicateurs clés à travers le monde
                </div>
              </div>
              <WorldMap
                data={mapData}
                indicatorLabel={indicator?.name_default ?? 'IDH'}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <KpiCard label="idh mondial" value={worldAverage} delta="+0.004" positive />
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
