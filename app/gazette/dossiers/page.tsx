import AppShell from '@/components/AppShell';
import { getDossiers } from '@/lib/gazette';

export const dynamic = 'force-dynamic';

export default async function DossiersPage() {
  const dossiers = await getDossiers();

  return (
    <AppShell active="The Gazette">

        <div className="p-[28px] max-w-2xl mx-auto w-full">
          <a href="/gazette" className="text-textMuted text-xs hover:text-white">← The Gazette</a>

          <div className="mt-5 mb-6 pb-5 border-b-2 border-white/20 text-center">
            <div className="font-serif text-3xl">Dossiers</div>
            <div className="font-serif italic text-textSecondary text-sm mt-1">
              Curated editorial collections
            </div>
          </div>

          {dossiers.length > 0 ? (
            <div>
              {dossiers.map((d) => (
                <a
                  key={d.slug}
                  href={`/gazette/dossiers/${d.slug}`}
                  className="block py-3 border-b border-border hover:text-accent"
                >
                  <div className="font-serif text-lg">{d.title}</div>
                  {d.description && <div className="text-textMuted text-sm mt-0.5">{d.description}</div>}
                </a>
              ))}
            </div>
          ) : (
            <div className="text-textMuted text-sm italic text-center">
              No dossiers published yet.
            </div>
          )}
        </div>
    </AppShell>
  );
}
