import Link from 'next/link';
import { getPosts, SocialPost } from '@/lib/supabase-admin';
import { updatePost } from './actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Contenus · Admin Statlas', robots: { index: false, follow: false } };

const PLATFORMS: Record<string, { label: string; cls: string }> = {
  x: { label: 'X', cls: 'bg-stone-900 text-white' },
  instagram: { label: 'Instagram', cls: 'bg-pink-600 text-white' },
  gazette: { label: 'Gazette', cls: 'bg-red-800 text-white' },
};
const STATUS: Record<string, { label: string; cls: string }> = {
  draft: { label: 'À programmer', cls: 'bg-amber-100 text-amber-900' },
  scheduled: { label: 'Programmé', cls: 'bg-sky-100 text-sky-900' },
  published: { label: 'Publié', cls: 'bg-emerald-100 text-emerald-900' },
};
const TZ = 'Europe/Paris';
const dayKey = (iso: string) => new Date(iso).toLocaleDateString('en-CA', { timeZone: TZ }); // AAAA-MM-JJ
const timeOf = (iso: string) => new Date(iso).toLocaleTimeString('fr-FR', { timeZone: TZ, hour: '2-digit', minute: '2-digit' });

function Chips({ p }: { p: SocialPost }) {
  return (
    <span className="flex flex-wrap gap-1">
      {p.platforms.map((x) => (
        <span key={x} className={`rounded px-1.5 py-0.5 text-[10px] ${PLATFORMS[x]?.cls ?? 'bg-stone-200'}`}>{PLATFORMS[x]?.label ?? x}</span>
      ))}
    </span>
  );
}

function Editor({ p }: { p: SocialPost }) {
  const d = p.scheduled_at ? dayKey(p.scheduled_at) : '';
  const t = p.scheduled_at ? timeOf(p.scheduled_at) : '12:00';
  return (
    <details className="mt-2">
      <summary className="cursor-pointer text-sm underline">Programmer / modifier</summary>
      <form action={updatePost} className="mt-2 space-y-2 text-sm">
        <input type="hidden" name="id" value={p.id} />
        <div className="flex flex-wrap gap-2">
          <input type="date" name="date" defaultValue={d} className="h-11 rounded border border-stone-300 px-2" />
          <input type="time" name="time" defaultValue={t} className="h-11 rounded border border-stone-300 px-2" />
          <select name="status" defaultValue={p.status} className="h-11 rounded border border-stone-300 px-2">
            <option value="draft">À programmer</option>
            <option value="scheduled">Programmé</option>
            <option value="published">Publié</option>
          </select>
        </div>
        <div className="flex flex-wrap gap-3">
          {Object.entries(PLATFORMS).map(([k, v]) => (
            <label key={k} className="flex min-h-11 items-center gap-1.5">
              <input type="checkbox" name="platforms" value={k} defaultChecked={p.platforms.includes(k)} className="h-5 w-5" /> {v.label}
            </label>
          ))}
        </div>
        <textarea name="caption" defaultValue={p.caption ?? ''} placeholder="Texte du post" rows={3} className="w-full rounded border border-stone-300 p-2 text-base" />
        <input name="notes" defaultValue={p.notes ?? ''} placeholder="Notes internes" className="h-11 w-full rounded border border-stone-300 px-2 text-base" />
        {['x', 'instagram', 'gazette'].map((k) => (
          <input key={k} name={`link_${k}`} defaultValue={p.links?.[k] ?? ''} placeholder={`Lien publié — ${PLATFORMS[k].label}`} className="h-11 w-full rounded border border-stone-300 px-2 text-base" />
        ))}
        <button className="h-11 rounded bg-stone-900 px-4 text-white">Enregistrer</button>
      </form>
    </details>
  );
}

function Card({ p }: { p: SocialPost }) {
  const st = STATUS[p.status];
  return (
    <li className="rounded-lg border border-stone-300 bg-white p-3">
      {p.kind === 'video' ? (
        <video src={p.media_url} poster={p.poster_url ?? undefined} controls preload="none" playsInline className="aspect-[4/5] w-full rounded bg-stone-900 object-cover" />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <a href={p.media_url} target="_blank" rel="noopener"><img src={p.media_url} alt={p.title} loading="lazy" className="aspect-[4/5] w-full rounded object-cover" /></a>
      )}
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="font-serif text-[16px] leading-snug">{p.title}</span>
        <span className="text-[11px] uppercase text-stone-500">{p.kind === 'video' ? 'Vidéo' : 'Image'}</span>
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <span className={`rounded px-1.5 py-0.5 text-[11px] ${st.cls}`}>{st.label}</span>
        <Chips p={p} />
        <a href={p.media_url} download className="text-[12px] underline">Télécharger</a>
      </div>
      {p.notes && <p className="mt-1 text-[12px] text-stone-500">{p.notes}</p>}
      <Editor p={p} />
    </li>
  );
}

function Calendar({ posts, month }: { posts: SocialPost[]; month: string }) {
  const [y, m] = month.split('-').map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1));
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const offset = (first.getUTCDay() + 6) % 7; // lundi = 0
  const byDay = new Map<string, SocialPost[]>();
  for (const p of posts) {
    if (!p.scheduled_at) continue;
    const k = dayKey(p.scheduled_at);
    byDay.set(k, [...(byDay.get(k) ?? []), p]);
  }
  const prev = new Date(Date.UTC(y, m - 2, 1)).toISOString().slice(0, 7);
  const next = new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 7);
  const today = new Date().toLocaleDateString('en-CA', { timeZone: TZ });
  const cells = Array.from({ length: offset + days }, (_, i) => (i < offset ? null : i - offset + 1));
  const label = first.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  return (
    <section className="mt-8">
      <div className="flex items-center justify-between">
        <Link href={`/admin/contenus?m=${prev}`} className="flex h-11 items-center px-2 underline">← Mois précédent</Link>
        <h2 className="font-serif text-2xl font-semibold capitalize">{label}</h2>
        <Link href={`/admin/contenus?m=${next}`} className="flex h-11 items-center px-2 underline">Mois suivant →</Link>
      </div>
      <div className="mt-3 grid grid-cols-7 gap-1 text-[11px] uppercase text-stone-500">
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((d) => <div key={d} className="px-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const k = `${month}-${String(d).padStart(2, '0')}`;
          const items = byDay.get(k) ?? [];
          return (
            <div key={i} className={`min-h-[96px] rounded border p-1 ${k === today ? 'border-red-700' : 'border-stone-200'} bg-white`}>
              <div className="text-[11px] text-stone-500">{d}</div>
              <ul className="mt-0.5 space-y-1">
                {items.map((p) => (
                  <li key={p.id} className={`rounded px-1 py-0.5 text-[11px] leading-tight ${STATUS[p.status].cls}`}>
                    <a href={`#post-${p.slug}`} className="block">
                      <span className="font-mono">{timeOf(p.scheduled_at!)}</span> {p.title}
                      <span className="block opacity-70">{p.platforms.map((x) => PLATFORMS[x]?.label ?? x).join(' · ')}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default async function ContentsPage({ searchParams }: { searchParams: { m?: string } }) {
  const { posts, error } = await getPosts();
  const month = /^\d{4}-\d{2}$/.test(searchParams.m ?? '') ? searchParams.m! : new Date().toLocaleDateString('en-CA', { timeZone: TZ }).slice(0, 7);
  const drafts = posts.filter((p) => p.status === 'draft');
  const scheduled = posts.filter((p) => p.status === 'scheduled');
  const published = posts.filter((p) => p.status === 'published').reverse();
  return (
    <main className="mx-auto max-w-[1100px] px-4 py-10 text-stone-900">
      <p className="text-xs uppercase tracking-[0.15em] text-stone-500">
        <Link href="/admin" className="underline">Statlas · espace admin</Link> · Contenus
      </p>
      <h1 className="mt-1 font-serif text-4xl font-bold">Contenus & calendrier</h1>
      <p className="mt-2 text-stone-600">Vidéos et images créées pour X, Instagram et la Gazette. Programme une date, puis passe le statut à « Publié » avec le lien du post une fois en ligne.</p>
      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <span className="rounded border border-stone-300 px-2 py-1">À programmer · {drafts.length}</span>
        <span className="rounded border border-stone-300 px-2 py-1">Programmés · {scheduled.length}</span>
        <span className="rounded border border-stone-300 px-2 py-1">Publiés · {published.length}</span>
      </div>
      {error && <p className="mt-6 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">{error}</p>}

      <Calendar posts={posts} month={month} />

      {[['À programmer', drafts], ['Programmés', scheduled], ['Publiés', published]].map(([label, list]) => (
        <section key={label as string} className="mt-10">
          <h2 className="border-b-2 border-stone-900 pb-1 font-serif text-2xl font-semibold">{label as string}</h2>
          {(list as SocialPost[]).length === 0 ? (
            <p className="mt-3 italic text-stone-500">Rien pour l'instant.</p>
          ) : (
            <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(list as SocialPost[]).map((p) => (
                <div id={`post-${p.slug}`} key={p.id}><Card p={p} /></div>
              ))}
            </ul>
          )}
        </section>
      ))}
    </main>
  );
}
