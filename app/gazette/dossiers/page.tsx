import Link from 'next/link';
import AppShell from '@/components/AppShell';
import { getDossiers } from '@/lib/gazette';
import { CompactMasthead, GazettePage } from '@/components/gazette/Gazette';

export const dynamic = 'force-dynamic';

export default async function DossiersPage() {
  const dossiers = await getDossiers();

  return (
    <AppShell active="The Gazette" paper>
      <GazettePage>
        <CompactMasthead section="Dossiers" />
        <div className="mx-auto max-w-[760px] pt-10">
          <div className="text-center">
            <h1 className="font-headline text-[44px] sm:text-[60px] font-extrabold leading-none">Dossiers</h1>
            <p className="mt-3 font-headline italic text-[20px] text-inkSoft">Curated editorial collections</p>
          </div>
          {dossiers.length > 0 ? (
            <ol className="mt-10 border-t border-ink">
              {dossiers.map((d) => (
                <li key={d.slug} className="border-b border-rule">
                  <Link href={`/gazette/dossiers/${d.slug}`} className="block py-4 hover:text-press">
                    <div className="font-headline text-[24px] font-semibold leading-snug">{d.title}</div>
                    {d.description && <p className="mt-1 font-serif text-[16px] text-inkSoft">{d.description}</p>}
                  </Link>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-10 text-center font-serif italic text-inkMuted">No dossiers published yet.</p>
          )}
          <Link href="/gazette" className="mt-8 inline-flex h-11 items-center font-sans text-[13px] uppercase tracking-[0.1em] hover:text-press">
            ← Back to the front page
          </Link>
        </div>
      </GazettePage>
    </AppShell>
  );
}
