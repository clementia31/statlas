import Link from 'next/link';
import { notFound } from 'next/navigation';
import StudioShell from '@/components/studio/Shell';
import ArticleBody from '@/components/gazette/ArticleBody';
import { getDraft } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Draft · Studio', robots: { index: false, follow: false } };

const LANG: Record<string, string> = { fr: 'Français', en: 'English', es: 'Español' };

export default async function DraftPage({ params }: { params: { lang: string; slug: string } }) {
  const d = await getDraft(params.lang, params.slug);
  if (!d) notFound();
  return (
    <StudioShell active="Articles">
      <article className="mx-auto max-w-[760px] rounded-xl bg-paperLight px-5 py-7 text-ink sm:px-9">
        <p className="font-sans text-[12px] uppercase tracking-[0.14em] text-inkMuted">
          <Link href="/studio/articles" className="underline">Articles</Link> · {LANG[d.lang] ?? d.lang} · {d.status}
          {d.translation_key && <> · original: <Link href={`/gazette/${d.translation_key}`} className="underline">/gazette/{d.translation_key}</Link></>}
        </p>
        <h1 className="mt-3 font-headline text-[34px] font-bold leading-tight sm:text-[40px]">{d.title}</h1>
        {d.subtitle && <p className="mt-2 font-headline text-[20px] italic text-inkSoft">{d.subtitle}</p>}
        {d.key_findings && d.key_findings.length > 0 && (
          <ul className="mt-6 list-disc space-y-1 border-y border-rule py-4 pl-5 font-serif">
            {d.key_findings.map((k, i) => <li key={i}>{k}</li>)}
          </ul>
        )}
        <div className="mt-6"><ArticleBody body={d.body ?? ''} /></div>
      </article>
    </StudioShell>
  );
}
