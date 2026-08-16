import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { getDossierBySlug } from '@/lib/gazette';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function DossierDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const { dossier, articles } = await getDossierBySlug(params.slug);

  if (!dossier) {
    notFound();
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar active="The Gazette" />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />

        <div className="p-[28px] max-w-2xl mx-auto w-full">
          <a href="/gazette/dossiers" className="text-textMuted text-xs hover:text-white">← Dossiers</a>

          <div className="mt-5 mb-6 pb-5 border-b-2 border-white/20 text-center">
            <div className="text-[11px] text-textMuted mb-2">Dossier</div>
            <div className="font-serif text-3xl">{dossier.title}</div>
            {dossier.description && (
              <div className="text-textSecondary text-sm mt-2 max-w-md mx-auto">{dossier.description}</div>
            )}
          </div>

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
      </div>
    </div>
  );
}
