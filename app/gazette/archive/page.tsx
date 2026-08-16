import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { getArchiveArticles, getDomains } from '@/lib/gazette';

export const dynamic = 'force-dynamic';

const TYPES = ['analysis', 'data_story', 'brief', 'reference', 'methodology'];

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: { year?: string; domain?: string; type?: string };
}) {
  const [articles, domains] = await Promise.all([
    getArchiveArticles(searchParams),
    getDomains(),
  ]);

  function filterHref(key: string, value: string) {
    const params = new URLSearchParams();
    if (searchParams.year && key !== 'year') params.set('year', searchParams.year);
    if (searchParams.domain && key !== 'domain') params.set('domain', searchParams.domain);
    if (searchParams.type && key !== 'type') params.set('type', searchParams.type);
    if (value) params.set(key, value);
    return `/gazette/archive?${params.toString()}`;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar active="The Gazette" />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />

        <div className="p-[28px] max-w-2xl mx-auto w-full">
          <a href="/gazette" className="text-textMuted text-xs hover:text-white">← The Gazette</a>

          <div className="mt-5 mb-6 pb-5 border-b-2 border-white/20 text-center">
            <div className="font-serif text-3xl">Archive</div>
            <div className="font-serif italic text-textSecondary text-sm mt-1">
              Every article, chronologically
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-center mb-6 text-[11px] text-textMuted">
            <a href={filterHref('domain', '')} className={!searchParams.domain ? 'text-white' : 'hover:text-white'}>All domains</a>
            {domains.map((d) => (
              <span key={d.slug}>
                <span className="mx-1 opacity-40">·</span>
                <a href={filterHref('domain', d.slug)} className={searchParams.domain === d.slug ? 'text-white' : 'hover:text-white'}>
                  {d.name}
                </a>
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 justify-center mb-8 text-[11px] text-textMuted">
            <a href={filterHref('type', '')} className={!searchParams.type ? 'text-white' : 'hover:text-white'}>All types</a>
            {TYPES.map((t) => (
              <span key={t}>
                <span className="mx-1 opacity-40">·</span>
                <a href={filterHref('type', t)} className={searchParams.type === t ? 'text-white' : 'hover:text-white'}>
                  {t}
                </a>
              </span>
            ))}
          </div>

          <div className="text-textMuted text-[11px] mb-2">{articles.length} articles</div>
          {articles.map((a) => (
            <a
              key={a.slug}
              href={`/gazette/${a.slug}`}
              className="flex justify-between items-baseline py-2.5 border-b border-border hover:text-accent"
            >
              <span>
                <span className="text-[10px] text-textMuted mr-2">{a.article_type}</span>
                <span className="text-[14px] text-textSecondary">{a.title}</span>
              </span>
              <span className="text-textMuted text-[11px] font-mono shrink-0 ml-3">
                {a.published_at?.slice(0, 10)}
              </span>
            </a>
          ))}
          {articles.length === 0 && (
            <div className="text-textMuted text-sm italic">No articles match these filters.</div>
          )}
        </div>
      </div>
    </div>
  );
}
