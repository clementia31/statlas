import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { getCountryProfile } from '@/lib/supabase';
import { getCountryExtras } from '@/lib/country-facts';
import { formatValue } from '@/lib/format';
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

  const { facts, memberships } = await getCountryExtras(entity!.id);

  return (
    <div className="flex min-h-screen">
      <Sidebar active="Countries" />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />

        <div className="p-[22px]">
          <div className="flex items-center gap-3 mb-1">
            {entity!.iso_code && (
              <img
                src={`https://flagcdn.com/w80/${entity!.iso_code.toLowerCase()}.png`}
                alt=""
                className="w-10 h-7 rounded object-cover border border-border"
              />
            )}
            <div>
              <div className="font-serif text-3xl">{entity!.name_default}</div>
              {facts?.official_name && (
                <div className="text-textMuted text-xs">{facts.official_name}</div>
              )}
            </div>
          </div>

          {facts && (
            <div className="bg-panel border border-border rounded-[10px] p-4 max-w-2xl mt-4 mb-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-textMuted text-[11px] font-medium mb-2">identity</div>
                  <table className="w-full text-sm">
                    {facts.capital && (
                      <tr><td className="text-textSecondary py-0.5">Capital</td><td className="text-right">{facts.capital}</td></tr>
                    )}
                    {facts.official_languages?.length > 0 && (
                      <tr><td className="text-textSecondary py-0.5">Language(s)</td><td className="text-right">{facts.official_languages.join(', ')}</td></tr>
                    )}
                    {facts.currency_code && (
                      <tr><td className="text-textSecondary py-0.5">Currency</td><td className="text-right">{facts.currencies?.name ?? facts.currency_code} ({facts.currency_code})</td></tr>
                    )}
                  </table>
                </div>

                <div>
                  <div className="text-textMuted text-[11px] font-medium mb-2">geography</div>
                  <table className="w-full text-sm">
                    {facts.area_km2 && (
                      <tr><td className="text-textSecondary py-0.5">Area</td><td className="text-right">{formatValue(facts.area_km2, 'people')} km²</td></tr>
                    )}
                    {facts.borders_iso3 && (
                      <tr><td className="text-textSecondary py-0.5">Borders</td><td className="text-right">{facts.borders_iso3.length} countries</td></tr>
                    )}
                    <tr><td className="text-textSecondary py-0.5">Landlocked</td><td className="text-right">{facts.landlocked ? 'Yes' : 'No'}</td></tr>
                    <tr><td className="text-textSecondary py-0.5">UN member</td><td className="text-right">{facts.un_member ? 'Yes' : 'No'}</td></tr>
                  </table>
                </div>
              </div>

              {memberships.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="text-textMuted text-[11px] font-medium mb-2">memberships</div>
                  <div className="flex gap-1.5 flex-wrap">
                    {memberships.map((g: any) => (
                      <span key={g.slug} className="bg-panel2 text-textSecondary text-xs px-2.5 py-1 rounded-md border border-border">
                        {g.name_default}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="text-textMuted text-xs mb-3">
            {indicators.length} indicators available for this country
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-w-4xl">
            {indicators.map((row) => (
              <div key={row.indicator_id} className="bg-panel border border-border rounded-[10px] p-3.5">
                <div className="text-textMuted text-[11px] mb-1.5">{row.indicator!.name_default}</div>
                <div className="font-mono text-xl font-medium text-white">
                  {formatValue(row.value_number, row.indicator!.unit)}
                </div>
                <div className="text-textMuted text-[10px] mt-1">
                  {row.period_start.slice(0, 4)}
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
