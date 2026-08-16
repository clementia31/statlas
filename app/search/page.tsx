import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { getGlobalSearchResults } from '@/lib/global-search';

export const dynamic = 'force-dynamic';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q ?? '';
  const { countries, indicators, articles } = await getGlobalSearchResults(query);
  const totalResults = countries.length + indicators.length + articles.length;

  return (
    <div className="flex min-h-screen">
      <Sidebar active="" />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />

        <div className="p-[22px] max-w-3xl">
          <div className="font-serif text-2xl mb-1">Search results</div>
          <div className="text-textMuted text-xs mb-6">
            {totalResults} results for &quot;{query}&quot;
          </div>

          {countries.length > 0 && (
            <div className="mb-6">
              <div className="text-textMuted text-[11px] font-medium mb-2 uppercase">Countries</div>
              <div className="bg-panel border border-border rounded-[10px] overflow-hidden">
                {countries.map((c) => (
                  <a
                    key={c.slug}
                    href={`/pays/${c.slug}`}
                    className="block px-4 py-2.5 text-sm text-textSecondary hover:text-white hover:bg-panel2 border-b border-border last:border-b-0"
                  >
                    {c.name_default}
                  </a>
                ))}
              </div>
            </div>
          )}

          {indicators.length > 0 && (
            <div className="mb-6">
              <div className="text-textMuted text-[11px] font-medium mb-2 uppercase">Indicators</div>
              <div className="bg-panel border border-border rounded-[10px] overflow-hidden">
                {indicators.map((i) => (
                  <a
                    key={i.slug}
                    href={`/indicateurs?indicator=${i.slug}`}
                    className="block px-4 py-2.5 text-sm text-textSecondary hover:text-white hover:bg-panel2 border-b border-border last:border-b-0"
                  >
                    {i.name_default}
                  </a>
                ))}
              </div>
            </div>
          )}

          {articles.length > 0 && (
            <div className="mb-6">
              <div className="text-textMuted text-[11px] font-medium mb-2 uppercase">The Gazette</div>
              <div className="bg-panel border border-border rounded-[10px] overflow-hidden">
                {articles.map((a) => (
                  <a
                    key={a.slug}
                    href={`/gazette/${a.slug}`}
                    className="block px-4 py-2.5 hover:bg-panel2 border-b border-border last:border-b-0"
                  >
                    <div className="text-sm text-textSecondary hover:text-white">{a.title}</div>
                    {a.subtitle && <div className="text-textMuted text-xs">{a.subtitle}</div>}
                  </a>
                ))}
              </div>
            </div>
          )}

          {totalResults === 0 && query && (
            <div className="text-textMuted text-sm">No results found for &quot;{query}&quot;.</div>
          )}
          {!query && (
            <div className="text-textMuted text-sm">Type in the search bar above and press Enter.</div>
          )}
        </div>
      </div>
    </div>
  );
}
