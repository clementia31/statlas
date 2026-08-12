import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { getCountryProfile } from '@/lib/supabase';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function CountryDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const { entity, indicators } = await getCountryProfile(params.slug);

  if (!entity) {
    notFound();
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar active="Countries" />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />

        <div className="p-[22px]">
          <div className="flex items-baseline justify-between mb-1">
            <div className="font-serif text-3xl">{entity!.name_default}</div>
            {entity!.iso_code && (
              <div className="text-textMuted text-xs font-mono">{entity!.iso_code}</div>
            )}
          </div>
          <div className="text-textMuted text-xs mb-4">
            {indicators.length} indicators available for this country
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-w-4xl">
            {indicators.map((row) => (
              <div key={row.indicator_id} className="bg-panel border border-border rounded-[10px] p-3.5">
                <div className="text-textMuted text-[11px] mb-1.5">{row.indicator!.name_default}</div>
                <div className="font-mono text-xl font-medium text-white">
                  {row.value_number.toLocaleString()}
                </div>
                <div className="text-textMuted text-[10px] mt-1">
                  {row.indicator!.unit} · {row.period_start.slice(0, 4)}
                  {row.is_projection ? ' (projection)' : ''}
                </div>
              </div>
            ))}
          </div>

          {indicators.length === 0 && (
            <div className="text-textMuted text-sm mt-6">No data available yet for this country.</div>
          )}
        </div>
      </div>
    </div>
  );
}
