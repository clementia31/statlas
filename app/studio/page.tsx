import Link from 'next/link';
import StudioShell, { Eyebrow, Notice } from '@/components/studio/Shell';
import { FORMATS, NETWORKS, PROJECTS, Post, STATUS, dayKey, downloadHref, getPosts, isProject, todayKey } from '@/lib/studio';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Calendar · Studio', robots: { index: false, follow: false } };

function StatusMark({ s }: { s: Post['status'] }) {
  if (s === 'published') return <span aria-label="Published" className="text-[13px] font-bold text-green">✓</span>;
  if (s === 'scheduled') return <span aria-label="Ready" className="h-2.5 w-2.5 rounded-full bg-accent" />;
  return <span aria-label="Idea" className="h-2.5 w-2.5 rounded-full border-[1.5px] border-textMuted" />;
}

function Chip({ p, today }: { p: Post; today: boolean }) {
  const f = FORMATS[p.format ?? 'chart'] ?? FORMATS.chart;
  const nets = p.platforms.filter((x) => x !== 'gazette').map((x) => NETWORKS[x] ?? x);
  return (
    <Link
      href={`/studio/publications/${p.id}`}
      className={`block rounded-md border bg-panel px-2.5 py-2 hover:border-text ${today ? 'border-accent ring-1 ring-accent' : 'border-border'}`}
      style={{ borderLeft: `3px solid ${f.color}` }}
    >
      <span className="flex items-center justify-between gap-2">
        <span className="text-[10.5px] font-semibold uppercase tracking-[0.1em]" style={{ color: f.color }}>
          {f.label}
        </span>
        <StatusMark s={p.status} />
      </span>
      <span className="mt-0.5 block text-[13px] leading-snug">{p.title}</span>
      <span className="mt-0.5 block text-[11px] text-textMuted">{[PROJECTS[p.project].label, ...nets].join(' · ')}</span>
    </Link>
  );
}

export default async function CalendarPage({ searchParams }: { searchParams: { m?: string; p?: string } }) {
  const { posts, error } = await getPosts();
  const today = todayKey();
  const month = /^\d{4}-(0[1-9]|1[0-2])$/.test(searchParams.m ?? '') ? searchParams.m! : today.slice(0, 7);
  const project = isProject(searchParams.p) ? searchParams.p : null;
  const shown = project ? posts.filter((x) => x.project === project) : posts;

  const [y, m] = month.split('-').map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1));
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const offset = (first.getUTCDay() + 6) % 7;
  const total = Math.ceil((offset + days) / 7) * 7;
  const cells = Array.from({ length: total }, (_, i) => (i < offset || i >= offset + days ? null : i - offset + 1));
  const prev = new Date(Date.UTC(y, m - 2, 1)).toISOString().slice(0, 7);
  const next = new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 7);
  const label = first.toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  const q = (mm: string, pp: string | null) => `/studio?m=${mm}${pp ? `&p=${pp}` : ''}`;

  const byDay = new Map<string, Post[]>();
  for (const p of shown) {
    if (!p.scheduled_at) continue;
    const k = dayKey(p.scheduled_at);
    byDay.set(k, [...(byDay.get(k) ?? []), p]);
  }
  const due = (byDay.get(today) ?? []).filter((p) => p.status !== 'published');
  const unscheduled = shown.filter((p) => !p.scheduled_at && p.status !== 'published');
  const pill = (on: boolean) =>
    `inline-flex h-11 items-center rounded-full border px-4 text-[14px] ${on ? 'border-text bg-text text-white' : 'border-borderStrong bg-panel hover:border-text'}`;

  return (
    <StudioShell active="Calendar">
      <Eyebrow>Editorial calendar</Eyebrow>
      <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-[34px] font-bold leading-tight sm:text-[40px]">{label}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Link href={q(month, null)} className={pill(!project)}>All</Link>
          {(Object.keys(PROJECTS) as (keyof typeof PROJECTS)[]).map((k) => (
            <Link key={k} href={q(month, k)} className={pill(project === k)}>{PROJECTS[k].label}</Link>
          ))}
          <Link href={q(prev, project)} aria-label="Previous month" className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-borderStrong bg-panel hover:border-text">‹</Link>
          <Link href={q(next, project)} aria-label="Next month" className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-borderStrong bg-panel hover:border-text">›</Link>
          <Link href="/studio/publications#new" className="inline-flex h-11 items-center rounded-lg bg-accent px-4 text-[14px] font-semibold text-white hover:opacity-90">+ New publication</Link>
        </div>
      </div>

      {error && <Notice>{error}</Notice>}

      {due.map((p) => (
        <div key={p.id} className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border border-l-4 border-l-accent bg-panel px-5 py-4">
          <div>
            <div className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-textMuted">To publish today</div>
            <div className="mt-0.5 font-serif text-[22px] font-semibold leading-snug">{p.title}</div>
            <div className="text-[13px] text-textMuted">
              {[PROJECTS[p.project].label, (FORMATS[p.format ?? 'chart'] ?? FORMATS.chart).label, ...p.platforms.map((x) => NETWORKS[x] ?? x), p.caption ? 'caption ready' : 'no caption yet', p.media_url ? '' : 'no visual yet'].filter(Boolean).join(' · ')}
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/studio/publications/${p.id}`} className="inline-flex h-11 items-center rounded-lg border border-borderStrong bg-panel px-4 text-[14px] font-medium hover:border-text">Open</Link>
            {p.media_url && <a href={downloadHref(p.media_url, p.media_name)} download={p.media_name ?? undefined} className="inline-flex h-11 items-center rounded-lg bg-text px-4 text-[14px] font-semibold text-white hover:opacity-90">↓ Download</a>}
          </div>
        </div>
      ))}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-[12.5px] text-textSecondary">
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {Object.values(FORMATS).map((f) => (
            <span key={f.label} className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: f.color }} />
              {f.label}
            </span>
          ))}
        </div>
        <div className="flex gap-4">
          {(['published', 'scheduled', 'draft'] as const).map((s) => (
            <span key={s} className="inline-flex items-center gap-1.5"><StatusMark s={s} />{STATUS[s]}</span>
          ))}
        </div>
      </div>

      {/* Grille du mois : à partir de 900px. En dessous, liste jour par jour. */}
      <div className="mt-3 hidden border-t-2 border-text min-[900px]:block">
        <div className="grid grid-cols-7 border-l border-border bg-panel2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
            <div key={d} className="border-b border-r border-border px-2 py-2 text-[11.5px] font-semibold uppercase tracking-[0.12em] text-textMuted">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 border-l border-border">
          {cells.map((d, i) => {
            if (!d) return <div key={i} className="min-h-[124px] border-b border-r border-border bg-panel2/60" />;
            const k = `${month}-${String(d).padStart(2, '0')}`;
            const items = byDay.get(k) ?? [];
            const isToday = k === today;
            return (
              <div key={i} className={`min-h-[124px] border-b border-r border-border p-2 ${isToday ? 'bg-[#EDF2FE]' : 'bg-[#FBFAF6]'}`}>
                <div className="mb-1.5 font-mono text-[13px]">
                  {isToday ? <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent font-semibold text-white">{d}</span> : <span className="px-1.5">{d}</span>}
                </div>
                <div className="space-y-1.5">
                  {items.map((p) => <Chip key={p.id} p={p} today={isToday} />)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ol className="mt-3 border-t-2 border-text min-[900px]:hidden">
        {cells.filter((d): d is number => d !== null).map((d) => {
          const k = `${month}-${String(d).padStart(2, '0')}`;
          const items = byDay.get(k) ?? [];
          if (items.length === 0 && k !== today) return null;
          const wd = new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-GB', { weekday: 'short', timeZone: 'UTC' });
          return (
            <li key={d} className={`flex gap-3 border-b border-border py-3 ${k === today ? 'bg-[#EDF2FE] px-2' : ''}`}>
              <div className="w-12 shrink-0 font-mono text-[13px] text-textMuted">{wd}<br /><span className="text-[17px] text-text">{d}</span></div>
              <div className="flex-1 space-y-1.5">
                {items.length ? items.map((p) => <Chip key={p.id} p={p} today={k === today} />) : <span className="text-[13px] text-textMuted">Nothing planned today.</span>}
              </div>
            </li>
          );
        })}
      </ol>

      {unscheduled.length > 0 && (
        <section className="mt-10">
          <h2 className="border-b-2 border-text pb-1.5 font-serif text-[22px] font-semibold">Not scheduled yet · {unscheduled.length}</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {unscheduled.map((p) => <Chip key={p.id} p={p} today={false} />)}
          </div>
        </section>
      )}
    </StudioShell>
  );
}
