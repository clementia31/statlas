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
  // On vérifie d'abord si le slug correspond à un domaine
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
          <div className="p-[22px] max-w-3xl">
            <a href="/gazette" className="text-textMuted text-xs hover:text-white">← The Gazette</a>

            <div className="mt-4 mb-6 pb-6 border-b border-border">
              <div className="text-textMuted text-[11px] font-mono uppercase mb-2">Domain</div>
              <div className="font-serif text-3xl mb-2">{domain.name}</div>
              <div className="text-textSecondary text-sm">{domain.tagline}</div>
              <div className="text-textMuted text-xs mt-2 max-w-xl">{domain.description}</div>
            </div>

            <div className="text-textMuted text-[11px] font-medium uppercase mb-3">
              Articles ({articles.length})
            </div>
            {articles.length > 0 ? (
              <div className="flex flex-col gap-1 mb-8">
                {articles.map((a) => (
                  <a
                    key={a.slug}
                    href={`/gazette/${a.slug}`}
                    className="flex justify-between items-baseline py-2.5 border-b border-border hover:text-accent group"
                  >
                    <div>
                      <span className="text-textMuted text-[10px] font-mono uppercase mr-2">
                        {a.article_type}
                      </span>
                      <span className="text-sm text-textSecondary group-hover:text-accent">{a.title}</span>
                    </div>
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

            <div className="text-textMuted text-[11px] font-medium uppercase mb-3">
              Quantitative Disciplines
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {disciplines.map((d) => (
                <div key={d.slug} className="bg-panel border border-border rounded-md px-3 py-2">
                  <div className="text-sm text-textSecondary">{d.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Sinon, on cherche un article avec ce slug
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

        <div className="p-[22px]">
          <a href="/gazette" className="text-textMuted text-xs hover:text-white">← Back to The Gazette</a>

          <div className="max-w-2xl mt-4">
            <div className="text-textMuted text-[10px] font-mono uppercase mb-2 flex gap-2">
              <span>{article.article_type}</span>
              {article.domain_slug && (
                <>
                  <span>·</span>
                  <a href={`/gazette/${article.domain_slug}`} className="hover:text-accent">{article.domain_slug}</a>
                </>
              )}
            </div>
            <div className="font-serif text-3xl mb-2">{article.title}</div>
            {article.subtitle && (
              <div className="text-textSecondary text-base mb-3">{article.subtitle}</div>
            )}
            <div className="text-textMuted text-xs font-mono mb-6">
              {article.author_name} — {article.published_at?.slice(0, 10)}
            </div>

            <div className="text-textSecondary text-[15px] leading-relaxed whitespace-pre-line">
              {article.body}
            </div>

            {source && (
              <div className="mt-8 bg-panel border border-border rounded-[10px] p-4">
                <div className="text-textMuted text-[11px] mb-1.5">Foundational text</div>
                <div className="text-sm text-white font-serif">{doc?.title}</div>
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
