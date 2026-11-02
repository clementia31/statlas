import Link from 'next/link';
import AppShell from '@/components/AppShell';
import { ArticleList, CompactMasthead, GazettePage, Kicker } from '@/components/gazette/Gazette';
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
    <AppShell active="The Gazette" paper>
      <GazettePage>
        <CompactMasthead section="Dossier" />
        <div className="mx-auto max-w-[760px] pt-10">
          <div className="text-center">
            <Kicker>Dossier</Kicker>
            <h1 className="mt-2 font-headline text-[40px] sm:text-[56px] font-extrabold leading-none">{dossier.title}</h1>
            {dossier.description && <p className="mx-auto mt-4 max-w-[560px] font-serif text-[17px] leading-relaxed text-inkSoft">{dossier.description}</p>}
          </div>
          <div className="mt-10">
            <ArticleList articles={articles} />
          </div>
          <Link href="/gazette/dossiers" className="mt-8 inline-flex h-11 items-center font-sans text-[13px] uppercase tracking-[0.1em] hover:text-press">
            ← All dossiers
          </Link>
        </div>
      </GazettePage>
    </AppShell>
  );
}
