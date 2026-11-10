import Link from 'next/link';
import StudioShell, { Eyebrow, Notice } from '@/components/studio/Shell';
import { getDrafts, Draft } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Articles · Studio', robots: { index: false, follow: false } };

const STATUS: Record<string, { label: string; cls: string }> = {
  idea: { label: 'Idea', cls: 'bg-panel2 text-textSecondary' },
  draft: { label: 'Draft', cls: 'bg-[#FDF6DC] text-[#5C4300]' },
  review: { label: 'Review', cls: 'bg-[#EDF2FE] text-accent' },
  translating: { label: 'Translating', cls: 'bg-[#F1EAFB] text-[#5B3A99]' },
  ready: { label: 'Ready', cls: 'bg-[#E3F3EA] text-green' },
  published: { label: 'Published', cls: 'bg-text text-white' },
};
const LANGS = ['en', 'fr', 'es'];

function Row({ d }: { d: Draft }) {
  const st = STATUS[d.status] ?? { label: d.status, cls: 'bg-panel2' };
  const link = 'inline-flex min-h-11 items-center text-[14px] underline hover:text-accent';
  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-border py-2">
      {d.series_order != null && <span className="w-6 text-right font-mono text-[13px] text-textMuted">{d.series_order}</span>}
      <span className="rounded bg-panel2 px-2 py-0.5 font-mono text-[12px] uppercase">{d.lang}</span>
      <span className="min-w-[200px] flex-1 font-serif text-[17px]">{d.title}</span>
      <span className={`rounded px-2 py-0.5 text-[12px] font-medium ${st.cls}`}>{st.label}</span>
      {d.translation_key && d.lang !== 'en' && <Link href={`/studio/articles/${d.lang}/${d.slug}`} className={link}>Read</Link>}
      {d.doc_url && <a href={d.doc_url} target="_blank" rel="noopener" className={link}>Open draft</a>}
      {d.published_slug && <Link href={`/gazette/${d.published_slug}`} className={link}>View online</Link>}
      {d.notes && <p className="basis-full pl-9 text-[13.5px] text-textMuted">{d.notes}</p>}
    </li>
  );
}

export default async function ArticlesPage() {
  const { drafts, error } = await getDrafts();
  const groups = new Map<string, Draft[]>();
  for (const d of drafts) {
    const k = d.series ?? (d.translation_key ? `Published in English · /gazette/${d.translation_key}` : 'Standalone articles');
    groups.set(k, [...(groups.get(k) ?? []), d]);
  }
  return (
    <StudioShell active="Articles">
      <Eyebrow>The Gazette</Eyebrow>
      <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-[34px] font-bold leading-tight sm:text-[40px]">Articles</h1>
        <a href="/studio/export-articles" className="inline-flex h-11 items-center rounded-lg border border-borderStrong bg-panel px-4 text-[14px] font-medium hover:border-text">Export published articles (JSON)</a>
      </div>
      <p className="mt-2 max-w-[70ch] text-[15px] text-textSecondary">Articles in preparation, in every language. Drafts are edited in their own document; the public site only shows published articles.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {Object.entries(STATUS).map(([k, v]) => (
          <span key={k} className="rounded-full border border-borderStrong bg-panel px-3 py-1 text-[12.5px]">{v.label} · {drafts.filter((d) => d.status === k).length}</span>
        ))}
      </div>
      {error && <Notice>{error}</Notice>}
      {Array.from(groups.entries()).map(([series, items]) => (
        <section key={series} className="mt-9">
          <h2 className="border-b-2 border-text pb-1.5 font-serif text-[22px] font-semibold">{series}</h2>
          <ul>{[...items].sort((a, b) => LANGS.indexOf(a.lang) - LANGS.indexOf(b.lang)).map((d) => <Row key={d.id} d={d} />)}</ul>
        </section>
      ))}
      {!error && drafts.length === 0 && <p className="mt-9 text-[14px] text-textMuted">No article in preparation.</p>}
    </StudioShell>
  );
}
