import Link from 'next/link';
import ArticleBody from '@/components/gazette/ArticleBody';
import { getDraft } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Brouillon · Admin Statlas', robots: { index: false, follow: false } };

const LANG: Record<string, string> = { fr: 'Français', en: 'English', es: 'Español' };

export default async function DraftPage({ params }: { params: { lang: string; slug: string } }) {
  const d = await getDraft(params.lang, params.slug);
  if (!d) return <main className="mx-auto max-w-[760px] px-4 py-10">Brouillon introuvable. <Link href="/admin" className="underline">Retour</Link></main>;
  return (
    <main className="mx-auto max-w-[760px] px-4 py-10 text-stone-900">
      <p className="text-xs uppercase tracking-[0.15em] text-stone-500">
        <Link href="/admin" className="underline">Statlas · espace admin</Link> · {LANG[d.lang] ?? d.lang} · {d.status}
        {d.translation_key && <> · original : <Link href={`/gazette/${d.translation_key}`} className="underline">/gazette/{d.translation_key}</Link></>}
      </p>
      <h1 className="mt-3 font-serif text-4xl font-bold leading-tight">{d.title}</h1>
      {d.subtitle && <p className="mt-2 font-serif text-xl italic text-stone-600">{d.subtitle}</p>}
      {d.key_findings && d.key_findings.length > 0 && (
        <ul className="mt-6 list-disc space-y-1 border-y border-stone-300 py-4 pl-5 font-serif">
          {d.key_findings.map((k, i) => <li key={i}>{k}</li>)}
        </ul>
      )}
      <div className="mt-6"><ArticleBody body={d.body ?? ''} /></div>
    </main>
  );
}
