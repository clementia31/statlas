import { getDrafts, Draft } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Admin · Statlas', robots: { index: false, follow: false } };

const STATUS: Record<string, { label: string; cls: string }> = {
  idea: { label: 'Idée', cls: 'bg-stone-100 text-stone-700' },
  draft: { label: 'Brouillon', cls: 'bg-amber-100 text-amber-800' },
  review: { label: 'Relecture', cls: 'bg-sky-100 text-sky-800' },
  translating: { label: 'Traduction', cls: 'bg-violet-100 text-violet-800' },
  ready: { label: 'Prêt', cls: 'bg-emerald-100 text-emerald-800' },
  published: { label: 'Publié', cls: 'bg-stone-800 text-white' },
};
const LANG: Record<string, string> = { fr: 'FR', en: 'EN', es: 'ES' };

function Row({ d }: { d: Draft }) {
  const st = STATUS[d.status] ?? { label: d.status, cls: 'bg-stone-100' };
  return (
    <li className="flex flex-wrap items-center gap-3 border-b border-stone-200 py-3">
      {d.series_order != null && <span className="w-6 text-right font-mono text-sm text-stone-500">{d.series_order}</span>}
      <span className="rounded px-2 py-0.5 font-mono text-xs bg-stone-200">{LANG[d.lang] ?? d.lang}</span>
      <span className="flex-1 min-w-[200px] font-serif text-[17px]">{d.title}</span>
      <span className={`rounded px-2 py-0.5 text-xs ${st.cls}`}>{st.label}</span>
      {d.doc_url && (
        <a href={d.doc_url} target="_blank" rel="noopener" className="text-sm underline hover:text-red-700">Ouvrir le brouillon</a>
      )}
      {d.published_slug && (
        <a href={`/gazette/${d.published_slug}`} className="text-sm underline hover:text-red-700">Voir en ligne</a>
      )}
      {d.notes && <p className="basis-full pl-9 text-sm text-stone-500">{d.notes}</p>}
    </li>
  );
}

export default async function AdminPage() {
  const { drafts, error } = await getDrafts();
  const groups = new Map<string, Draft[]>();
  for (const d of drafts) {
    const k = d.series ?? 'Articles isolés';
    groups.set(k, [...(groups.get(k) ?? []), d]);
  }
  const counts = Object.keys(STATUS).map((s) => [STATUS[s].label, drafts.filter((d) => d.status === s).length] as const);

  return (
    <main className="mx-auto max-w-[920px] px-4 py-10 text-stone-900">
      <p className="text-xs uppercase tracking-[0.15em] text-stone-500">Statlas · espace admin</p>
      <h1 className="mt-1 font-serif text-4xl font-bold">Rédaction</h1>
      <a href="/admin/contenus" className="mt-3 inline-flex h-11 items-center rounded bg-stone-900 px-4 text-sm text-white">Contenus & calendrier des publications →</a>
      <p className="mt-2 text-stone-600">Articles en préparation pour The Gazette, toutes langues. Les brouillons s'éditent dans leur document ; le site public n'affiche que les articles publiés.</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {counts.map(([label, n]) => (
          <span key={label} className="rounded border border-stone-300 px-2 py-1 text-xs">{label} · {n}</span>
        ))}
      </div>
      {error && <p className="mt-6 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      {Array.from(groups.entries()).map(([series, items]) => (
        <section key={series} className="mt-10">
          <h2 className="border-b-2 border-stone-900 pb-1 font-serif text-2xl font-semibold">{series}</h2>
          <ul>{items.map((d) => <Row key={d.id} d={d} />)}</ul>
        </section>
      ))}
      {!error && drafts.length === 0 && <p className="mt-10 italic text-stone-500">Aucun article en préparation.</p>}
    </main>
  );
}
