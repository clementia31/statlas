import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { getArticleBySlug } from '@/lib/supabase';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ArticleDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const article = await getArticleBySlug(params.slug);

  if (!article) {
    notFound();
  }

  const source = article.sources as any;
  const doc = source?.source_documents?.[0];

  return (
    <div className="flex min-h-screen">
      <Sidebar active="The Gazette" />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />

        <div className="p-[22px]">
          <a href="/gazette" className="text-textMuted text-xs hover:text-white">← Back to The Gazette</a>

          <div className="max-w-2xl mt-4">
            <div className="text-textMuted text-[10px] font-mono uppercase mb-2">{article.article_type}</div>
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
