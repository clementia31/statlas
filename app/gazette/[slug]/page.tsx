import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { getArticleBySlug } from '@/lib/supabase';
import { getDomainBySlug, getArticlesByDomain, getDisciplines } from '@/lib/gazette';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function GazetteSlugPage({
  params,
}: {
  params: { slug: string };
}) {
  const domain = await getDomainBySlug(params.slug);

  if (domain) {
    const [articles, disciplines] = await Promise.all([
      getArticlesByDomain(domain.slug),
      getDisciplines(),
    ]);

    return (
      <div className="flex min-h-screen">
        <Sidebar active="The Gazette" />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar />
          <div className="p-[28px] max-w-2xl mx-auto w-full">
            <a href="/gazette" className="text-textMuted text-xs hover:text-white">← The Gazette</a>

            <div className="mt-5 mb-6 pb-5 border-b-2 border-white/20 text-center">
              <div className="font-serif text-3xl">{domain.name}</div>
              <div className="font-serif italic text-textSecondary text-sm mt-1">{domain.tagline}</div>
              <div className="text-textMuted text-xs mt-2 max-w-md mx-auto">{domain.description}</div>
            </div>

            <div className="text-[11px] text-textMuted mb-2">Articles ({articles.length})</div>
            {articles.length > 0 ? (
              <div className="mb-8">
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
              </div>
            ) : (
              <div className="text-textMuted text-sm mb-8 italic">
                No articles published in this domain yet.
              </div>
            )}

            <div className="text-[11px] text-textMuted mb-1">Quantitative disciplines</div>
            <div className="text-textSecondary text-[13px] leading-loose">
              {disciplines.map((d, i) => (
                <span key={d.slug}>
                  {i > 0 && <span className="mx-1.5 opacity-50">·</span>}
                  {d.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const article = await getArticleBySlug(params.slug);

  if (!article) {
    notFound();
  }

  const source = article.source;
  const doc = article.doc;

  return (
    <div className="flex min-h-screen">
      <Sidebar active="The Gazette" />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />

        <div className="p-[28px] max-w-2xl mx-auto w-full">
          <a href="/gazette" className="text-textMuted text-xs hover:text-white">← The Gazette</a>

          <div className="mt-5">
            <div className="text-[11px] text-textMuted mb-2">
              {article.article_type}
              {article.domain_slug && (
                <>
                  {' · '}
                  <a href={`/gazette/${article.domain_slug}`} className="hover:text-accent">{article.domain_slug}</a>
                </>
              )}
            </div>
            <div className="font-serif text-[32px] font-medium leading-tight mb-2">{article.title}</div>
            {article.subtitle && (
              <div className="font-serif italic text-textSecondary text-lg mb-3">{article.subtitle}</div>
            )}
            <div className="text-textMuted text-xs font-mono mb-6 pb-6 border-b border-border">
              {article.author_name} — {article.published_at?.slice(0, 10)}
            </div>

            <div className="text-textSecondary text-[16px] leading-[1.7] whitespace-pre-line">
              {article.body}
            </div>

            {source && (
              <div className="mt-8 pt-5 border-t border-border">
                <div className="text-textMuted text-[11px] mb-1.5">Foundational text</div>
                <div className="text-sm font-serif">{doc?.title}</div>
                <div className="text-textMuted text-xs mt-1">
                  {source.name}
                  {doc?.published_at ? ` — ${doc.published_at.slice(0, 4)}` : ''}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
