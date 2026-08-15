import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { getAllArticles } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function GazettePage() {
  const articles = await getAllArticles();

  return (
    <div className="flex min-h-screen">
      <Sidebar active="The Gazette" />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />

        <div className="p-[22px]">
          <div className="font-serif text-3xl mb-1">The Gazette</div>
          <div className="text-textMuted text-xs mb-6">
            Reference articles on the disciplines behind Statlas, and contributor perspectives on current affairs.
          </div>

          <div className="max-w-3xl flex flex-col gap-3">
            {articles.map((a) => (
              <a
                key={a.id}
                href={`/gazette/${a.slug}`}
                className="bg-panel border border-border rounded-[10px] p-4 hover:border-accent block"
              >
                <div className="flex items-baseline justify-between mb-1">
                  <div className="font-serif text-lg text-white">{a.title}</div>
                  <div className="text-textMuted text-[10px] font-mono uppercase">{a.article_type}</div>
                </div>
                {a.subtitle && <div className="text-textSecondary text-sm mb-1.5">{a.subtitle}</div>}
                <div className="text-textMuted text-[11px] font-mono">
                  {a.author_name} — {a.published_at?.slice(0, 10)}
                </div>
              </a>
            ))}
            {articles.length === 0 && (
              <div className="text-textMuted text-sm">No articles published yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
