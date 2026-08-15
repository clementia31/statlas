import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { getAllSources } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function BibliographyPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const sources = await getAllSources();
  const query = (searchParams.q ?? '').toLowerCase().trim();
  const filtered = sources.filter((s) => s.name.toLowerCase().includes(query));

  return (
    <div className="flex min-h-screen">
      <Sidebar active="Bibliography" />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />

        <div className="p-[22px]">
          <div className="font-serif text-2xl mb-1">Bibliography</div>
          <div className="text-textMuted text-xs mb-4">
            {filtered.length} organizations
            {query ? ` matching "${searchParams.q}"` : ''}
          </div>

          <div className="max-w-3xl flex flex-col gap-3">
            {filtered.map((s) => (
              <div key={s.id} className="bg-panel border border-border rounded-[10px] p-4">
                <div className="flex items-baseline justify-between mb-1">
                  <div className="font-serif text-lg">
                    {s.url ? (
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
                        {s.name}
                      </a>
                    ) : (
                      s.name
                    )}
                  </div>
                  <div className="text-textMuted text-[10px] font-mono uppercase">{s.source_type}</div>
                </div>
                {s.documents.length > 0 && (
                  <div className="mt-2 flex flex-col gap-1">
                    {s.documents.map((d: any) => (
                      <div key={d.id} className="text-xs text-textSecondary flex justify-between">
                        <span>
                          {d.url ? (
                            <a href={d.url} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
                              {d.title}
                            </a>
                          ) : (
                            d.title
                          )}
                        </span>
                        {d.published_at && (
                          <span className="text-textMuted font-mono">{d.published_at.slice(0, 10)}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-textMuted text-sm">No source matches your search.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
