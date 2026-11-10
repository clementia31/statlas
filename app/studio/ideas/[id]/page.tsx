import Link from 'next/link';
import { notFound } from 'next/navigation';
import StudioShell from '@/components/studio/Shell';
import IdeaComposer from '@/components/studio/IdeaComposer';
import { ideaToDraft, saveIdea, setIdeaDone } from '../../actions';
import { IDEA_KINDS, PROJECTS, TZ, getIdea } from '@/lib/studio';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Idea · Studio', robots: { index: false, follow: false } };

const field = 'h-11 w-full rounded-lg border border-borderStrong bg-panel px-3 text-[16px]';
const when = (iso: string) => new Date(iso).toLocaleString('en-GB', { timeZone: TZ, day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const size = (n: number | null) => (!n ? '' : n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);
// Les liens collés dans une note deviennent cliquables (http et https uniquement).
function Linked({ text }: { text: string }) {
  return (
    <>
      {text.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
        /^https?:\/\//.test(part) ? <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="break-all text-accent underline">{part}</a> : <span key={i}>{part}</span>,
      )}
    </>
  );
}

export default async function IdeaPage({ params }: { params: { id: string } }) {
  const found = await getIdea(params.id);
  if (!found) notFound();
  const { idea, items } = found;
  const k = IDEA_KINDS[idea.kind];
  const done = idea.status === 'done';
  const btn = 'inline-flex h-11 items-center rounded-lg border border-borderStrong bg-panel px-4 text-[14px] font-medium hover:border-text';
  return (
    <StudioShell active="Ideas">
      <Link href="/studio/ideas" className="inline-flex h-11 items-center text-[14px] text-textSecondary hover:text-text">← Ideas</Link>
      <div className="text-[11.5px] font-semibold uppercase tracking-[0.16em]" style={{ color: k.color }}>{k.label} · {PROJECTS[idea.project].label}</div>
      <div className="mt-1 flex flex-wrap items-start justify-between gap-3">
        <h1 className={`max-w-[26ch] font-serif text-[30px] font-bold leading-tight sm:text-[38px] ${done ? 'line-through opacity-70' : ''}`}>{idea.title}</h1>
        <div className="flex flex-wrap gap-2">
          {idea.draft_slug ? (
            <Link href="/studio/articles" className={btn}>Draft article created · see Articles</Link>
          ) : (
            <form action={ideaToDraft}><input type="hidden" name="id" value={idea.id} /><button className={btn}>→ Draft article</button></form>
          )}
          <Link href={`/studio/publications?title=${encodeURIComponent(idea.title)}&project=${idea.project}#new`} className={btn}>→ Publication</Link>
          <form action={setIdeaDone}>
            <input type="hidden" name="id" value={idea.id} />
            <input type="hidden" name="done" value={done ? '0' : '1'} />
            <button className={`inline-flex h-11 items-center rounded-lg px-4 text-[14px] font-semibold ${done ? 'border border-borderStrong bg-panel' : 'bg-green text-white hover:opacity-90'}`}>{done ? 'Reopen' : '✓ Mark as done'}</button>
          </form>
        </div>
      </div>
      <p className="mt-1 text-[13px] text-textMuted">Noted {when(idea.created_at)}</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <section>
          <h2 className="border-b-2 border-text pb-1.5 font-serif text-[22px] font-semibold">Notes and files · {items.length}</h2>
          {items.length === 0 && <p className="mt-3 text-[14px] text-textMuted">Nothing added yet. Use the box below to add notes, links, photos or documents as the subject matures.</p>}
          <ol className="mt-3 space-y-3">
            {items.map((it) => (
              <li key={it.id} className="rounded-[10px] border border-border bg-panel p-4">
                <div className="text-[12px] text-textMuted">{when(it.created_at)}</div>
                {it.kind === 'note' ? (
                  <p className="mt-1.5 whitespace-pre-wrap text-[15.5px] leading-relaxed"><Linked text={it.body ?? ''} /></p>
                ) : (
                  <div className="mt-2">
                    {it.mime?.startsWith('image/') && it.url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <a href={it.url} target="_blank" rel="noopener noreferrer"><img src={it.url} alt={it.file_name ?? ''} loading="lazy" className="max-h-[420px] rounded-lg border border-border object-contain" /></a>
                    )}
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                      <span className="break-all font-mono text-[12.5px] text-textSecondary">{it.file_name} · {size(it.size_bytes)}</span>
                      {it.url ? (
                        <a href={it.url} target="_blank" rel="noopener noreferrer" download={it.file_name ?? undefined} className="inline-flex h-11 items-center rounded-lg bg-text px-4 text-[14px] font-semibold text-white hover:opacity-90">↓ Open</a>
                      ) : (
                        <span className="text-[13px] text-red">File not reachable</span>
                      )}
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ol>
          <div className="mt-4"><IdeaComposer ideaId={idea.id} /></div>
        </section>

        <form action={saveIdea} className="h-fit space-y-3 rounded-xl border border-border bg-panel p-5">
          <input type="hidden" name="id" value={idea.id} />
          <div className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-textMuted">The idea</div>
          <label className="block text-[13px] text-textSecondary">Title<input name="title" defaultValue={idea.title} maxLength={200} className={`mt-1 ${field}`} /></label>
          <label className="block text-[13px] text-textSecondary">Starting point
            <textarea name="body" defaultValue={idea.body ?? ''} rows={7} className="mt-1 w-full rounded-lg border border-borderStrong bg-panel p-3 text-[16px] leading-relaxed" />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-[13px] text-textSecondary">Type
              <select name="kind" defaultValue={idea.kind} className={`mt-1 ${field}`}>{Object.entries(IDEA_KINDS).map(([v, o]) => <option key={v} value={v}>{o.label}</option>)}</select>
            </label>
            <label className="block text-[13px] text-textSecondary">Project
              <select name="project" defaultValue={idea.project} className={`mt-1 ${field}`}>{(Object.keys(PROJECTS) as (keyof typeof PROJECTS)[]).map((p) => <option key={p} value={p}>{PROJECTS[p].label}</option>)}</select>
            </label>
          </div>
          <button className="h-11 rounded-lg bg-accent px-5 text-[14px] font-semibold text-white hover:opacity-90">Save changes</button>
        </form>
      </div>
    </StudioShell>
  );
}
