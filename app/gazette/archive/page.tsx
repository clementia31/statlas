import Link from 'next/link';
import AppShell from '@/components/AppShell';
import { ArticleList, CompactMasthead, GazettePage, SectionLabel, typeLabel } from '@/components/gazette/Gazette';
import { getArchiveArticles, getDomains } from '@/lib/gazette';

export const dynamic = 'force-dynamic';

const TYPES = ['editorial', 'analysis', 'data_story', 'brief', 'reference', 'methodology'];

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

  const pill = (on: boolean) =>
    `inline-flex h-10 items-center px-3 border font-sans text-[12px] uppercase tracking-[0.12em] ${on ? 'border-ink bg-ink text-paper' : 'border-rule hover:border-ink'}`;

  return (
    <AppShell active="The Gazette" paper>
      <GazettePage>
        <CompactMasthead section="Archive" />
        <div className="mx-auto max-w-[760px] pt-10">
          <div className="text-center">
            <h1 className="font-headline text-[44px] sm:text-[60px] font-extrabold leading-none">Archive</h1>
            <p className="mt-3 font-headline italic text-[20px] text-inkSoft">Every article, chronologically</p>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-2">
            <Link href={filterHref('domain', '')} className={pill(!searchParams.domain)}>
              All sections
            </Link>
            {domains.map((d) => (
              <Link key={d.slug} href={filterHref('domain', d.slug)} className={pill(searchParams.domain === d.slug)}>
                {d.name}
              </Link>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <Link href={filterHref('type', '')} className={pill(!searchParams.type)}>
              All types
            </Link>
            {TYPES.map((t) => (
              <Link key={t} href={filterHref('type', t)} className={pill(searchParams.type === t)}>
                {typeLabel(t)}
              </Link>
            ))}
          </div>

          <div className="mt-10 pb-2">
            <SectionLabel>
              {articles.length} {articles.length === 1 ? 'article' : 'articles'}
            </SectionLabel>
          </div>
          {articles.length > 0 ? (
            <ArticleList articles={articles} />
          ) : (
            <p className="border-t border-ink pt-4 font-serif italic text-inkMuted">No articles match these filters.</p>
          )}
        </div>
      </GazettePage>
    </AppShell>
  );
}
