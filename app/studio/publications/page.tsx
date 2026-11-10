import Link from 'next/link';
import StudioShell, { Eyebrow, Notice } from '@/components/studio/Shell';
import { createPost } from '../actions';
import { FORMATS, NETWORKS, PROJECTS, Post, STATUS, dayKey, getPosts, isProject } from '@/lib/studio';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Publications · Studio', robots: { index: false, follow: false } };

const field = 'h-11 w-full rounded-lg border border-borderStrong bg-panel px-3 text-[16px]';

function Card({ p }: { p: Post }) {
  const f = FORMATS[p.format ?? 'chart'] ?? FORMATS.chart;
  return (
    <li className="overflow-hidden rounded-xl border border-border bg-panel">
      <Link href={`/studio/publications/${p.id}`} className="block">
        {p.kind === 'video' && !p.poster_url ? (
          <div className="flex aspect-[4/3] w-full items-center justify-center bg-panel2 text-[13px] text-textMuted">Video</div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.kind === 'video' ? p.poster_url! : p.media_url} alt="" loading="lazy" className="aspect-[4/3] w-full bg-panel2 object-cover" />
        )}
        <div className="p-3.5">
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.1em]" style={{ color: f.color }}>
            {f.label} · {PROJECTS[p.project].label} · {p.kind}
          </div>
          <div className="mt-1 font-serif text-[18px] font-semibold leading-snug">{p.title}</div>
          <div className="mt-1 text-[12.5px] text-textMuted">
            {STATUS[p.status]}
            {p.scheduled_at ? ` · ${dayKey(p.scheduled_at)}` : ''} · {p.platforms.map((x) => NETWORKS[x] ?? x).join(' · ')}
          </div>
        </div>
      </Link>
    </li>
  );
}

export default async function PublicationsPage({ searchParams }: { searchParams: { p?: string } }) {
  const { posts, error } = await getPosts();
  const project = isProject(searchParams.p) ? searchParams.p : null;
  const shown = project ? posts.filter((x) => x.project === project) : posts;
  const groups: [string, Post[]][] = [
    ['Ready', shown.filter((p) => p.status === 'scheduled')],
    ['Ideas, not scheduled', shown.filter((p) => p.status === 'draft')],
    ['Published', shown.filter((p) => p.status === 'published').reverse()],
  ];
  const pill = (on: boolean) =>
    `inline-flex h-11 items-center rounded-full border px-4 text-[14px] ${on ? 'border-text bg-text text-white' : 'border-borderStrong bg-panel hover:border-text'}`;
  return (
    <StudioShell active="Publications">
      <Eyebrow>Publications</Eyebrow>
      <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-[34px] font-bold leading-tight sm:text-[40px]">Library</h1>
        <div className="flex flex-wrap gap-2">
          <Link href="/studio/publications" className={pill(!project)}>All</Link>
          {(Object.keys(PROJECTS) as (keyof typeof PROJECTS)[]).map((k) => (
            <Link key={k} href={`/studio/publications?p=${k}`} className={pill(project === k)}>{PROJECTS[k].label}</Link>
          ))}
        </div>
      </div>
      {error && <Notice>{error}</Notice>}

      {groups.map(([label, list]) => (
        <section key={label} className="mt-9">
          <h2 className="border-b-2 border-text pb-1.5 font-serif text-[22px] font-semibold">{label} · {list.length}</h2>
          {list.length === 0 ? (
            <p className="mt-3 text-[14px] text-textMuted">Nothing here yet.</p>
          ) : (
            <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{list.map((p) => <Card key={p.id} p={p} />)}</ul>
          )}
        </section>
      ))}

      <section id="new" className="mt-12 scroll-mt-6 rounded-xl border border-border bg-panel p-5">
        <h2 className="font-serif text-[22px] font-semibold">New publication</h2>
        <p className="mt-1 text-[13.5px] text-textMuted">The image or video must already be on the site. Give its path (for example /social/my-chart.jpg) or a full https address.</p>
        <form action={createPost} className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-[13px] text-textSecondary sm:col-span-2">Title<input name="title" required className={`mt-1 ${field}`} /></label>
          <label className="text-[13px] text-textSecondary sm:col-span-2">Image or video path<input name="media_url" required placeholder="/social/…" className={`mt-1 font-mono ${field}`} /></label>
          <label className="text-[13px] text-textSecondary">Project
            <select name="project" className={`mt-1 ${field}`}>{(Object.keys(PROJECTS) as (keyof typeof PROJECTS)[]).map((k) => <option key={k} value={k}>{PROJECTS[k].label}</option>)}</select>
          </label>
          <label className="text-[13px] text-textSecondary">Format
            <select name="format" defaultValue="chart" className={`mt-1 ${field}`}>{Object.entries(FORMATS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select>
          </label>
          <label className="text-[13px] text-textSecondary">Date (optional)<input type="date" name="date" className={`mt-1 ${field}`} /></label>
          <label className="text-[13px] text-textSecondary">Time, Paris<input type="time" name="time" defaultValue="12:00" className={`mt-1 ${field}`} /></label>
          <div className="flex flex-wrap gap-4 sm:col-span-2">
            {Object.entries(NETWORKS).map(([k, v]) => (
              <label key={k} className="flex min-h-11 items-center gap-2 text-[14px]"><input type="checkbox" name="platforms" value={k} defaultChecked={k !== 'gazette'} className="h-5 w-5" />{v}</label>
            ))}
          </div>
          <div className="sm:col-span-2"><button className="h-11 rounded-lg bg-accent px-5 text-[14px] font-semibold text-white hover:opacity-90">Create</button></div>
        </form>
      </section>
    </StudioShell>
  );
}
