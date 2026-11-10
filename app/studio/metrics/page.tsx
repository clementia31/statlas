import Link from 'next/link';
import StudioShell, { Eyebrow, Notice } from '@/components/studio/Shell';
import { addReading } from '../actions';
import { PROJECTS, Reading, getPosts, getReadings, isProject, todayKey } from '@/lib/studio';

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

export default async function MetricsPage({ searchParams }: { searchParams: { p?: string } }) {
  const project = isProject(searchParams.p) ? searchParams.p : 'statlas';
  const [{ readings, error }, { posts }] = await Promise.all([getReadings(), getPosts()]);
  const mine = readings.filter((r) => r.project === project);
  const of = (m: string) => mine.filter((r) => r.metric === m);
  const pub = posts.filter((p) => p.project === project);
  const count = (s: string) => pub.filter((p) => p.status === s).length;
  return (
    <StudioShell active="Metrics">
      <Eyebrow>Metrics</Eyebrow>
      <h1 className="mt-1 font-serif text-[34px] font-bold leading-tight sm:text-[40px]">Audience</h1>
      <Notice>
        No visit counter is connected yet, so nothing here is measured automatically. The figures below are the ones you enter by hand; an empty tile means no reading has been entered.
      </Notice>
      {error && <Notice>{error}</Notice>}

      <div className="mt-6 flex gap-1 border-b border-border">
        {(Object.keys(PROJECTS) as (keyof typeof PROJECTS)[]).map((k) => (
          <Link key={k} href={`/studio/metrics?p=${k}`} className={`flex h-11 items-center px-4 text-[14.5px] ${project === k ? 'border-b-2 border-text font-semibold' : 'text-textSecondary hover:text-text'}`}>
            {PROJECTS[k].label}
          </Link>
        ))}
      </div>

      <div className="mt-6 grid border-t-2 border-text sm:grid-cols-2 lg:grid-cols-4">
        <Tile label="Visitors" rows={of('visitors')} sub="no reading yet" />
        <Tile label="Page views" rows={of('page_views')} sub="no reading yet" />
        <Tile label="From Google" rows={of('google_clicks')} sub="clicks · Search Console" />
        <div className="border-r border-border px-4 py-4">
          <div className="text-[13px] text-textSecondary">Followers</div>
          <div className="mt-1 font-serif text-[30px] font-semibold leading-none">
            {of('followers_instagram')[0] || of('followers_x')[0] ? nf.format(Number(of('followers_instagram')[0]?.value ?? 0) + Number(of('followers_x')[0]?.value ?? 0)) : '—'}
          </div>
          <div className="mt-2 text-[12.5px] text-textMuted">Instagram + X, latest readings</div>
        </div>
      </div>

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
              <select name="metric" className={`mt-1 ${field}`}>{Object.entries(METRICS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
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
