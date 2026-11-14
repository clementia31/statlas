import Link from 'next/link';
import StudioShell, { Eyebrow, Notice } from '@/components/studio/Shell';
import { addReading } from '../actions';
import { PROJECTS, Project, Reading, VisitSummary, addDays, dayKey, getFigureLinks, getPosts, getReadings, getViewsAfter, getVisitSummary, isProject, todayKey } from '@/lib/studio';
import { projectOf } from '@/lib/visits';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Metrics · Studio', robots: { index: false, follow: false } };

const METRICS: Record<string, string> = {
  followers_instagram: 'Instagram followers',
  followers_x: 'X followers',
  visitors: 'Visitors (month)',
  page_views: 'Page views (month)',
  google_clicks: 'Clicks from Google (month)',
};
const field = 'h-11 w-full rounded-lg border border-borderStrong bg-panel px-3 text-[16px]';
const nf = new Intl.NumberFormat('en-GB');

const PERIODS = [
  [7, '7 days'],
  [30, '30 days'],
  [365, '12 months'],
] as const;
const MANUAL = ['followers_instagram', 'followers_x', 'google_clicks'];
const h2 = 'border-b-2 border-text pb-1.5 font-serif text-[22px] font-semibold';
const regions = new Intl.DisplayNames(['en'], { type: 'region' });
const countryName = (c: string) => {
  try {
    return c === '??' ? 'Unknown' : regions.of(c) ?? c;
  } catch {
    return c;
  }
};
const pct = (n: number, total: number) => (total > 0 ? `${Math.round((n / total) * 100)}%` : '—');
const short = (key: string) => new Date(`${key}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });

function AutoTile({ label, value, prev, counted }: { label: string; value: number; prev: number; counted: boolean }) {
  const delta = value - prev;
  return (
    <div className="border-r border-border px-4 py-4 first:pl-0">
      <div className="text-[13px] text-textSecondary">{label}</div>
      <div className="mt-1 font-serif text-[30px] font-semibold leading-none">{counted ? nf.format(value) : '—'}</div>
      <div className="mt-2 text-[12.5px] text-textMuted">
        {!counted ? 'nothing counted yet' : prev > 0 ? `${delta >= 0 ? '+' : '−'}${nf.format(Math.abs(delta))} vs previous period` : 'counted automatically'}
      </div>
    </div>
  );
}

// Courbe des visiteurs. Sur 12 mois, les jours sont regroupés par mois. Un trait vertical marque chaque publication.
function VisitorsChart({ summary, from, to, days, marks }: { summary: VisitSummary; from: string; to: string; days: number; marks: { day: string; title: string }[] }) {
  const byDay = new Map(summary.days.map((d) => [d.day, d]));
  const monthly = days > 60;
  let points: { key: string; label: string; visitors: number; views: number }[] = [];
  if (monthly) {
    const months = new Map<string, { visitors: number; views: number }>();
    for (let k = from; k <= to; k = addDays(k, 1)) {
      const m = k.slice(0, 7);
      const cur = months.get(m) ?? { visitors: 0, views: 0 };
      const d = byDay.get(k);
      months.set(m, { visitors: cur.visitors + (d?.visitors ?? 0), views: cur.views + (d?.views ?? 0) });
    }
    points = [...months].map(([m, v]) => ({ key: m, label: new Date(`${m}-15T12:00:00Z`).toLocaleDateString('en-GB', { month: 'short', year: '2-digit', timeZone: 'UTC' }), ...v }));
  } else {
    for (let k = from; k <= to; k = addDays(k, 1)) points.push({ key: k, label: short(k), visitors: byDay.get(k)?.visitors ?? 0, views: byDay.get(k)?.views ?? 0 });
  }
  const W = 720, H = 240, L = 44, R = 12, T = 14, B = 30;
  const max = Math.max(1, ...points.map((p) => p.visitors));
  const x = (i: number) => L + (points.length > 1 ? (i * (W - L - R)) / (points.length - 1) : (W - L - R) / 2);
  const y = (v: number) => T + (1 - v / max) * (H - T - B);
  const line = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.visitors).toFixed(1)}`).join(' ');
  const index = new Map(points.map((p, i) => [p.key, i]));
  const shown = marks.map((m) => ({ ...m, i: index.get(monthly ? m.day.slice(0, 7) : m.day) })).filter((m) => m.i !== undefined) as { day: string; title: string; i: number }[];
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Visitors per ${monthly ? 'month' : 'day'}, ${short(from)} to ${short(to)}. Highest value: ${nf.format(max)}.`}>
        {[0, 0.5, 1].map((f) => (
          <g key={f}>
            <line x1={L} x2={W - R} y1={y(max * f)} y2={y(max * f)} stroke="#DEDAD0" strokeWidth="1" />
            <text x={L - 8} y={y(max * f) + 4} textAnchor="end" fontSize="11" fill="#5B6270">{nf.format(Math.round(max * f))}</text>
          </g>
        ))}
        {shown.map((m, k) => (
          <line key={k} x1={x(m.i)} x2={x(m.i)} y1={T} y2={H - B} stroke="#8B1E1E" strokeWidth="1.5" strokeDasharray="4 4">
            <title>{`${m.title} · ${short(m.day)}`}</title>
          </line>
        ))}
        <path d={line} fill="none" stroke="#1F4FD1" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {points.length <= 62 && points.map((p, i) => (
          <circle key={p.key} cx={x(i)} cy={y(p.visitors)} r="3" fill="#1F4FD1">
            <title>{`${p.label}: ${nf.format(p.visitors)} visitors, ${nf.format(p.views)} page views`}</title>
          </circle>
        ))}
        <text x={L} y={H - 8} fontSize="11" fill="#5B6270">{points[0]?.label}</text>
        <text x={W - R} y={H - 8} textAnchor="end" fontSize="11" fill="#5B6270">{points[points.length - 1]?.label}</text>
      </svg>
      <p className="mt-1 text-[12.5px] text-textMuted">
        <span className="mr-1 inline-block h-[3px] w-5 translate-y-[-3px] bg-accent" aria-hidden="true" />
        Visitors
        {shown.length > 0 && (
          <>
            <span className="ml-4 mr-1 inline-block h-3 w-0 translate-y-[2px] border-l-2 border-dashed border-[#8B1E1E]" aria-hidden="true" />
            Publication day
          </>
        )}
      </p>
    </div>
  );
}

function Bars({ rows, total, empty }: { rows: { label: string; views: number }[]; total: number; empty: string }) {
  if (rows.length === 0) return <p className="mt-3 text-[14px] text-textMuted">{empty}</p>;
  const max = Math.max(...rows.map((r) => r.views));
  return (
    <ul className="mt-3 space-y-2.5">
      {rows.map((r) => (
        <li key={r.label} className="text-[14px]">
          <div className="flex items-baseline justify-between gap-3">
            <span className="min-w-0 truncate">{r.label}</span>
            <span className="shrink-0 font-mono text-[13px]">{nf.format(r.views)} <span className="text-textMuted">· {pct(r.views, total)}</span></span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-panel2"><div className="h-1.5 rounded-full bg-accent" style={{ width: `${Math.max(2, (r.views / max) * 100)}%` }} /></div>
        </li>
      ))}
    </ul>
  );
}

// Les visites venues d'autres sites sont regroupées au-delà des cinq premières provenances.
function groupSources(sources: VisitSummary['sources']) {
  const top = sources.slice(0, 6).map((s) => ({ label: s.source === 'direct' ? 'Direct (typed address, apps, no referrer)' : s.source, views: s.views }));
  const rest = sources.slice(6).reduce((n, s) => n + s.views, 0);
  return rest > 0 ? [...top, { label: 'Other sites', views: rest }] : top;
}

function Tile({ label, rows, sub }: { label: string; rows: Reading[]; sub: string }) {
  const [last, prev] = rows;
  const delta = last && prev ? Number(last.value) - Number(prev.value) : null;
  return (
    <div className="border-r border-border px-4 py-4 first:pl-0">
      <div className="text-[13px] text-textSecondary">{label}</div>
      <div className="mt-1 font-serif text-[30px] font-semibold leading-none">{last ? nf.format(Number(last.value)) : '—'}</div>
      <div className="mt-2 text-[12.5px] text-textMuted">
        {last ? `${last.reading_date}${delta !== null ? ` · ${delta >= 0 ? '+' : '−'}${nf.format(Math.abs(delta))} since ${prev.reading_date}` : ''}` : sub}
      </div>
    </div>
  );
}

export default async function MetricsPage({ searchParams }: { searchParams: { p?: string; d?: string } }) {
  const project = isProject(searchParams.p) ? searchParams.p : 'statlas';
  const days = PERIODS.some(([n]) => String(n) === searchParams.d) ? Number(searchParams.d) : 30;
  const counted = project !== 'myinvesta'; // MyInvesta est un autre site : ce compteur ne le couvre pas
  const [{ readings, error }, { posts }, visits, figureLinks] = await Promise.all([
    getReadings(),
    getPosts(),
    counted ? getVisitSummary(project, days) : Promise.resolve(null),
    counted ? getFigureLinks() : Promise.resolve(new Map<string, string>()),
  ]);
  const mine = readings.filter((r) => r.project === project);
  const of = (m: string) => mine.filter((r) => r.metric === m);
  const pub = posts.filter((p) => p.project === project);
  const count = (s: string) => pub.filter((p) => p.status === s).length;
  const summary = visits?.summary ?? null;
  const live = Boolean(summary?.first_day);
  const published = pub
    .filter((p) => p.status === 'published' && p.published_at)
    .map((p) => ({ post: p, day: dayKey(p.published_at as string) }))
    .filter((p) => visits && p.day >= visits.from && p.day <= visits.to)
    .sort((a, b) => (a.day < b.day ? 1 : -1));
  const effects = await Promise.all(
    published.slice(0, 8).map(async ({ post, day }) => {
      const link = figureLinks.get(post.title) ?? null;
      const where: Project = link ? projectOf(link) : project;
      return { post, day, link, views: summary ? await getViewsAfter(where, day, link) : null };
    }),
  );
  const href = (p: string, d: number) => `/studio/metrics?p=${p}&d=${d}`;
  return (
    <StudioShell active="Metrics">
      <Eyebrow>Metrics</Eyebrow>
      <h1 className="mt-1 font-serif text-[34px] font-bold leading-tight sm:text-[40px]">Audience</h1>
      {counted && visits?.error && <Notice>{visits.error}</Notice>}
      {counted && !visits?.error && (
        <Notice>
          {live
            ? `Visits are counted by the site itself since ${short(summary!.first_day as string)}, without cookies and without keeping any personal data. Visitors are an estimate per day; your own visits are not counted while you are signed in to the Studio.`
            : 'The visit counter is in place and nothing has been counted yet. Figures appear with the first visits; nothing exists before the counter went live.'}
        </Notice>
      )}
      {!counted && <Notice>MyInvesta is a separate site: this counter does not cover it. The figures below are the ones you enter by hand.</Notice>}
      {error && <Notice>{error}</Notice>}

      <div className="mt-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b border-border">
        <div className="flex gap-1">
          {(Object.keys(PROJECTS) as (keyof typeof PROJECTS)[]).map((k) => (
            <Link key={k} href={href(k, days)} className={`flex h-11 items-center px-4 text-[14.5px] ${project === k ? 'border-b-2 border-text font-semibold' : 'text-textSecondary hover:text-text'}`}>
              {PROJECTS[k].label}
            </Link>
          ))}
        </div>
        {counted && (
          <div className="flex gap-1.5 pb-2" role="group" aria-label="Period">
            {PERIODS.map(([n, label]) => (
              <Link key={n} href={href(project, n)} aria-current={days === n ? 'true' : undefined} className={`flex h-9 items-center rounded-full border px-3.5 text-[13px] ${days === n ? 'border-text bg-text text-white' : 'border-borderStrong bg-panel hover:border-text'}`}>
                {label}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 grid border-t-2 border-text sm:grid-cols-2 lg:grid-cols-4">
        {counted ? (
          <>
            <AutoTile label="Visitors" value={summary?.visitors ?? 0} prev={summary?.prev_visitors ?? 0} counted={live} />
            <AutoTile label="Page views" value={summary?.views ?? 0} prev={summary?.prev_views ?? 0} counted={live} />
          </>
        ) : (
          <>
            <Tile label="Visitors" rows={of('visitors')} sub="no reading yet" />
            <Tile label="Page views" rows={of('page_views')} sub="no reading yet" />
          </>
        )}
        <Tile label="From Google" rows={of('google_clicks')} sub="clicks · Search Console, entered by hand" />
        <div className="border-r border-border px-4 py-4">
          <div className="text-[13px] text-textSecondary">Followers</div>
          <div className="mt-1 font-serif text-[30px] font-semibold leading-none">
            {of('followers_instagram')[0] || of('followers_x')[0] ? nf.format(Number(of('followers_instagram')[0]?.value ?? 0) + Number(of('followers_x')[0]?.value ?? 0)) : '—'}
          </div>
          <div className="mt-2 text-[12.5px] text-textMuted">Instagram + X, entered by hand</div>
        </div>
      </div>

      {counted && summary && visits && (
        <>
          <div className="mt-8 grid gap-x-8 gap-y-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <section className="min-w-0">
              <h2 className={h2}>Visitors per {days > 60 ? 'month' : 'day'}</h2>
              {live ? (
                <div className="mt-3"><VisitorsChart summary={summary} from={visits.from} to={visits.to} days={days} marks={published.map((p) => ({ day: p.day, title: p.post.title }))} /></div>
              ) : (
                <p className="mt-3 text-[14px] text-textMuted">No visit counted yet.</p>
              )}
            </section>
            <section className="min-w-0">
              <h2 className={h2}>Where visitors come from</h2>
              <Bars rows={groupSources(summary.sources)} total={summary.entries} empty="No visit counted yet." />
            </section>
          </div>

          <div className="mt-8 grid gap-x-8 gap-y-8 lg:grid-cols-2">
            <section className="min-w-0">
              <h2 className={h2}>Most viewed pages</h2>
              {summary.pages.length === 0 ? (
                <p className="mt-3 text-[14px] text-textMuted">No page viewed yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="mt-2 w-full min-w-[360px] text-left text-[14px]">
                    <thead className="text-[12px] uppercase tracking-[0.08em] text-textMuted"><tr><th className="py-2 font-medium">Page</th><th className="text-right font-medium">Views</th><th className="pl-4 text-right font-medium">Share</th></tr></thead>
                    <tbody>
                      {summary.pages.map((r) => (
                        <tr key={r.path} className="border-t border-border">
                          <td className="max-w-[320px] truncate py-2"><a href={r.path} target="_blank" rel="noopener" className="hover:text-accent hover:underline">{r.path}</a></td>
                          <td className="text-right font-mono">{nf.format(r.views)}</td>
                          <td className="pl-4 text-right font-mono text-textMuted">{pct(r.views, summary.views)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
            <section className="min-w-0">
              <h2 className={h2}>Publications and their effect</h2>
              {effects.length === 0 ? (
                <p className="mt-3 text-[14px] text-textMuted">No publication marked as published in this period.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="mt-2 w-full min-w-[420px] text-left text-[14px]">
                    <thead className="text-[12px] uppercase tracking-[0.08em] text-textMuted"><tr><th className="py-2 font-medium">Publication</th><th className="font-medium">Date</th><th className="text-right font-medium">Views, 2 days</th></tr></thead>
                    <tbody>
                      {effects.map(({ post, day, link, views }) => (
                        <tr key={post.id} className="border-t border-border align-top">
                          <td className="py-2">
                            <Link href={`/studio/publications/${post.id}`} className="font-medium hover:text-accent hover:underline">{post.title}</Link>
                            <div className="text-[12.5px] text-textMuted">{link ? `linked page: ${link}` : 'no linked page: whole site'}</div>
                          </td>
                          <td className="whitespace-nowrap font-mono text-[13px]">{day}</td>
                          <td className="text-right font-mono">{views === null ? '—' : nf.format(views)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <p className="mt-2 text-[12.5px] text-textMuted">Views on the day of publication and the day after.</p>
            </section>
          </div>

          <section className="mt-8">
            <h2 className={h2}>Countries of visitors</h2>
            <div className="max-w-[640px]"><Bars rows={summary.countries.map((c) => ({ label: countryName(c.country), views: c.views }))} total={summary.entries} empty="No visit counted yet." /></div>
            <p className="mt-2 text-[12.5px] text-textMuted">Top 10, by visits arriving on the site. Only the country is kept, never the address of a visitor.</p>
          </section>
        </>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-panel p-5">
          <h2 className="font-serif text-[22px] font-semibold">Publications · {PROJECTS[project].label}</h2>
          <p className="mt-1 text-[13px] text-textMuted">Counted from the calendar.</p>
          <dl className="mt-4 grid grid-cols-3 gap-3 text-center">
            {[['Published', count('published')], ['Ready', count('scheduled')], ['Ideas', count('draft')]].map(([l, n]) => (
              <div key={l as string} className="rounded-lg bg-panel2 py-3">
                <dd className="font-serif text-[28px] font-semibold leading-none">{n}</dd>
                <dt className="mt-1 text-[12.5px] text-textSecondary">{l}</dt>
              </div>
            ))}
          </dl>
        </section>

        <section className="rounded-xl border border-border bg-panel p-5">
          <h2 className="font-serif text-[22px] font-semibold">Enter a reading</h2>
          <form action={addReading} className="mt-4 grid gap-3 sm:grid-cols-2">
            <input type="hidden" name="project" value={project} />
            <label className="text-[13px] text-textSecondary">Measure
              <select name="metric" className={`mt-1 ${field}`}>{Object.entries(METRICS).filter(([k]) => !counted || MANUAL.includes(k)).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
            </label>
            <label className="text-[13px] text-textSecondary">Value<input name="value" type="number" min="0" step="1" required inputMode="numeric" className={`mt-1 ${field}`} /></label>
            <label className="text-[13px] text-textSecondary">Date<input name="date" type="date" defaultValue={todayKey()} required className={`mt-1 ${field}`} /></label>
            <label className="text-[13px] text-textSecondary">Note (optional)<input name="note" className={`mt-1 ${field}`} /></label>
            <div className="sm:col-span-2"><button className="h-11 rounded-lg bg-accent px-5 text-[14px] font-semibold text-white hover:opacity-90">Save reading</button></div>
          </form>
        </section>
      </div>

      <section className="mt-8">
        <h2 className="border-b-2 border-text pb-1.5 font-serif text-[22px] font-semibold">Readings · {PROJECTS[project].label}</h2>
        {mine.length === 0 ? (
          <p className="mt-3 text-[14px] text-textMuted">No reading entered yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="mt-2 w-full min-w-[480px] text-left text-[14px]">
              <thead className="text-[12px] uppercase tracking-[0.08em] text-textMuted"><tr><th className="py-2 font-medium">Date</th><th className="font-medium">Measure</th><th className="text-right font-medium">Value</th><th className="pl-4 font-medium">Note</th></tr></thead>
              <tbody>
                {mine.slice(0, 60).map((r) => (
                  <tr key={r.id} className="border-t border-border"><td className="py-2 font-mono text-[13px]">{r.reading_date}</td><td>{METRICS[r.metric] ?? r.metric}</td><td className="text-right font-mono">{nf.format(Number(r.value))}</td><td className="pl-4 text-textMuted">{r.note}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {project === 'myinvesta' && (
        <section className="mt-8 rounded-xl border border-border bg-panel p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-serif text-[22px] font-semibold">Product metrics</h2>
            <span className="text-[13px] text-textMuted">Totals only — no personal data leaves the MyInvesta database</span>
          </div>
          <div className="mt-4 grid border-t-2 border-text sm:grid-cols-2 lg:grid-cols-4">
            {[['Properties under management', 'units'], ['Active leases', 'leases'], ['Gross rent under management', 'per month'], ['Clients by rent bracket', 'no bracket under five clients']].map(([l, s]) => (
              <div key={l} className="border-r border-border px-4 py-4 first:pl-0">
                <div className="text-[13px] text-textSecondary">{l}</div>
                <div className="mt-1 font-serif text-[30px] font-semibold leading-none">—</div>
                <div className="mt-2 text-[12.5px] text-textMuted">{s}</div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[13px] text-textMuted">Not connected yet: these appear once the totals function exists in the MyInvesta database.</p>
        </section>
      )}
    </StudioShell>
  );
}
