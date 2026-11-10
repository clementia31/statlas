import Link from 'next/link';
import StudioShell, { Eyebrow, Notice } from '@/components/studio/Shell';
import IdeaComposer from '@/components/studio/IdeaComposer';
import { setIdeaDone } from '../actions';
import { IDEA_KINDS, Idea, IdeaItem, PROJECTS, dayKey, getIdeas, isProject } from '@/lib/studio';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Ideas · Studio', robots: { index: false, follow: false } };

const KIND_OPTS = Object.entries(IDEA_KINDS).map(([value, v]) => ({ value, label: v.label }));
const PROJECT_OPTS = [{ value: 'gazette', label: 'Gazette' }, { value: 'statlas', label: 'Statlas' }, { value: 'myinvesta', label: 'MyInvesta' }];
const fmt = (iso: string) => new Date(`${dayKey(iso)}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

function Row({ idea, items }: { idea: Idea; items: IdeaItem[] }) {
  const k = IDEA_KINDS[idea.kind];
  const done = idea.status === 'done';
  const photo = items.find((i) => i.kind === 'file' && i.mime?.startsWith('image/') && i.url);
  const notes = items.filter((i) => i.kind === 'note').length;
  const files = items.filter((i) => i.kind === 'file').length;
  return (
    <li className={`flex gap-3 rounded-[10px] border border-border bg-panel p-4 sm:gap-4 ${done ? 'opacity-60' : ''}`} style={{ borderLeft: `4px solid ${k.color}` }}>
      <form action={setIdeaDone}>
        <input type="hidden" name="id" value={idea.id} />
        <input type="hidden" name="done" value={done ? '0' : '1'} />
        <button aria-label={done ? 'Reopen this idea' : 'Mark as done'} className="flex h-11 w-11 items-center justify-center">
          <span className={`flex h-[22px] w-[22px] items-center justify-center rounded-md border-[1.5px] text-[13px] text-white ${done ? 'border-green bg-green' : 'border-borderStrong bg-panel'}`}>{done ? '✓' : ''}</span>
        </button>
      </form>
      <Link href={`/studio/ideas/${idea.id}`} className="flex min-w-0 flex-1 gap-4 hover:text-accent">
        {photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo.url!} alt="" loading="lazy" className="hidden h-[72px] w-24 shrink-0 rounded-lg border border-border object-cover sm:block" />
        )}
        <span className="min-w-0 flex-1">
          <span className="block text-[12px] text-textMuted">
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.1em]" style={{ color: k.color }}>{k.label}</span> · {PROJECTS[idea.project].label} · {fmt(idea.created_at)}
          </span>
          <span className={`mt-0.5 block font-serif text-[19px] font-semibold leading-snug ${done ? 'line-through' : ''}`}>{idea.title}</span>
          {idea.body && <span className="mt-1 line-clamp-2 block text-[14px] leading-relaxed text-textSecondary">{idea.body}</span>}
          {(notes > 0 || files > 0 || idea.draft_slug) && (
            <span className="mt-2 block text-[12.5px] text-textMuted">
              {[notes ? `${notes} note${notes > 1 ? 's' : ''}` : '', files ? `${files} file${files > 1 ? 's' : ''}` : '', idea.draft_slug ? 'draft article created' : ''].filter(Boolean).join(' · ')}
            </span>
          )}
        </span>
        <span aria-hidden className="hidden self-center text-[13px] text-textMuted sm:block">Open →</span>
      </Link>
    </li>
  );
}

export default async function IdeasPage({ searchParams }: { searchParams: { s?: string; p?: string } }) {
  const { ideas, items, error } = await getIdeas();
  const showDone = searchParams.s === 'done';
  const project = isProject(searchParams.p) ? searchParams.p : null;
  const inProject = project ? ideas.filter((i) => i.project === project) : ideas;
  const open = inProject.filter((i) => i.status === 'open');
  const done = inProject.filter((i) => i.status === 'done');
  const shown = showDone ? done : open;
  const q = (s: boolean, p: string | null) => `/studio/ideas${s || p ? '?' : ''}${[s ? 's=done' : '', p ? `p=${p}` : ''].filter(Boolean).join('&')}`;
  const pill = (on: boolean) => `inline-flex h-11 items-center rounded-full border px-4 text-[14px] ${on ? 'border-text bg-text text-white' : 'border-borderStrong bg-panel hover:border-text'}`;
  return (
    <StudioShell active="Ideas">
      <Eyebrow>Ideas</Eyebrow>
      <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-[34px] font-bold leading-tight sm:text-[40px]">Subjects to cover</h1>
        <div className="flex flex-wrap gap-2">
          <Link href={q(false, project)} className={pill(!showDone)}>Open · {open.length}</Link>
          <Link href={q(true, project)} className={pill(showDone)}>Done · {done.length}</Link>
          <span className="w-2" />
          <Link href={q(showDone, null)} className={pill(!project)}>All</Link>
          {(Object.keys(PROJECTS) as (keyof typeof PROJECTS)[]).map((k) => <Link key={k} href={q(showDone, k)} className={pill(project === k)}>{PROJECTS[k].label}</Link>)}
        </div>
      </div>
      {error && <Notice>{error}</Notice>}
      <div className="mt-5"><IdeaComposer kinds={KIND_OPTS} projects={PROJECT_OPTS} /></div>

      <div className="mt-5 flex flex-wrap gap-4 text-[12.5px] text-textSecondary">
        {Object.values(IDEA_KINDS).map((k) => <span key={k.label} className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: k.color }} />{k.label}</span>)}
      </div>
      {shown.length === 0 ? (
        <p className="mt-4 text-[14px] text-textMuted">{showDone ? 'Nothing marked as done yet.' : 'No open idea. Note the first one above.'}</p>
      ) : (
        <ul className="mt-3 space-y-2.5">{shown.map((i) => <Row key={i.id} idea={i} items={items.filter((x) => x.idea_id === i.id)} />)}</ul>
      )}
    </StudioShell>
  );
}
