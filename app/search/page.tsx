import Link from 'next/link';
import AppShell from '@/components/AppShell';
import PageHeader from '@/components/ui/PageHeader';
import Panel from '@/components/ui/Panel';
import Flag from '@/components/ui/Flag';
import EmptyState from '@/components/ui/EmptyState';
import { getGlobalSearchResults } from '@/lib/global-search';

export const dynamic = 'force-dynamic';

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const query = (searchParams.q ?? '').trim();
  const { countries, indicators, articles } = await getGlobalSearchResults(query);
  const total = countries.length + indicators.length + articles.length;

  return (
    <AppShell active="">
      <PageHeader kicker="Search" title={query ? `Results for “${query}”` : 'Search'} description={query ? `${total} result${total === 1 ? '' : 's'}` : undefined} />

      <form action="/search" method="get" className="mb-6 max-w-xl">
        <input
          name="q"
          type="search"
          defaultValue={query}
          autoFocus
          placeholder="Search countries, indicators, articles…"
          aria-label="Search"
          className="w-full rounded-lg border border-borderStrong bg-panel h-11 px-4 text-[14px] text-text placeholder:text-textMuted outline-none focus:border-accent"
        />
      </form>

      {!query && <EmptyState title="What are you looking for?">Try a country (“Japan”), an indicator (“inflation”) or a topic (“demography”).</EmptyState>}
      {query && total === 0 && <EmptyState title="No results">Check the spelling or try a broader term.</EmptyState>}

      <div className="grid gap-4">
        {countries.length > 0 && (
          <Panel title="Countries">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {countries.map((c) => (
                <Link key={c.slug} href={`/pays/${c.slug}`} className="flex items-center gap-2.5 rounded-lg border border-border px-3 py-2 text-[14px] text-text hover:border-accent">
                  <Flag iso={c.iso_code} />
                  {c.name_default}
                </Link>
              ))}
            </div>
          </Panel>
        )}
        {indicators.length > 0 && (
          <Panel title="Indicators">
            <ul className="divide-y divide-border">
              {indicators.map((i) => (
                <li key={i.slug}>
                  <Link href={`/indicateurs?indicator=${i.slug}`} className="block py-2.5 text-[14px] text-text hover:text-accent">
                    {i.name_default}
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>
        )}
        {articles.length > 0 && (
          <Panel title="The Gazette">
            <ul className="divide-y divide-border">
              {articles.map((a) => (
                <li key={a.slug}>
                  <Link href={`/gazette/${a.slug}`} className="block py-2.5">
                    <span className="block text-[14px] text-text hover:text-accent">{a.title}</span>
                    {a.subtitle && <span className="block text-[13px] text-textMuted">{a.subtitle}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>
        )}
      </div>
    </AppShell>
  );
}
