import Link from 'next/link';
import { notFound } from 'next/navigation';
import StudioShell from '@/components/studio/Shell';
import CopyButton from '@/components/studio/CopyButton';
import MediaUploader from '@/components/studio/MediaUploader';
import { savePost, setPublished } from '../../actions';
import { FORMATS, NETWORKS, PROJECTS, STATUS, dayKey, downloadHref, getPost, timeOf } from '@/lib/studio';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Publication · Studio', robots: { index: false, follow: false } };

const field = 'h-11 w-full rounded-lg border border-borderStrong bg-panel px-3 text-[16px]';
const lab = 'block text-[13px] text-textSecondary';

export default async function PublicationPage({ params, searchParams }: { params: { id: string }; searchParams: { upload?: string } }) {
  const p = await getPost(params.id);
  if (!p) notFound();
  const f = FORMATS[p.format ?? 'chart'] ?? FORMATS.chart;
  const file = p.media_name ?? 'media';
  const published = p.status === 'published';
  return (
    <StudioShell active="Publications">
      <Link href="/studio" className="inline-flex h-11 items-center text-[14px] text-textSecondary hover:text-text">← Calendar</Link>
      <div className="text-[11.5px] font-semibold uppercase tracking-[0.16em]" style={{ color: f.color }}>
        {f.label} · {PROJECTS[p.project].label}
      </div>
      <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-[30px] font-bold leading-tight sm:text-[40px]">{p.title}</h1>
        <div className="flex items-center gap-2">
          <span className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[13.5px] font-semibold ${published ? 'bg-[#E3F3EA] text-green' : 'bg-[#EDF2FE] text-accent'}`}>
            {published ? '✓' : '●'} {STATUS[p.status]}
          </span>
          <form action={setPublished}>
            <input type="hidden" name="id" value={p.id} />
            <input type="hidden" name="scheduled_at" value={p.scheduled_at ?? ''} />
            <input type="hidden" name="publish" value={published ? '0' : '1'} />
            <button className="h-11 rounded-lg border border-borderStrong bg-panel px-4 text-[14px] font-medium hover:border-text">
              {published ? 'Back to not published' : 'Mark as published'}
            </button>
          </form>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section>
          <div className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-textMuted">{p.kind === 'video' ? 'Video' : 'Image'}</div>
          <div className="mt-2 rounded-xl border border-border bg-panel p-3.5">
            {!p.media_url ? (
              <div className="flex aspect-[4/3] w-full items-center justify-center rounded-md bg-panel2 text-[14px] text-textMuted">No visual yet</div>
            ) : p.kind === 'video' ? (
              <video src={p.media_url} poster={p.poster_url ?? undefined} controls preload="metadata" playsInline className="max-h-[70vh] w-full rounded-md bg-text" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.media_url} alt={p.title} className="max-h-[70vh] w-full rounded-md border border-border object-contain" />
            )}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <span className="break-all font-mono text-[12.5px] text-textMuted">{p.media_url ? file : ''}</span>
              <div className="flex flex-wrap items-start gap-2">
                <MediaUploader postId={p.id} hasMedia={!!p.media_url} />
                {p.media_url && (
                  <a href={downloadHref(p.media_url, file)} download={file} className="inline-flex h-11 items-center rounded-lg bg-text px-4 text-[14px] font-semibold text-white hover:opacity-90">
                    ↓ Download {p.kind === 'video' ? 'video' : 'image'}
                  </a>
                )}
              </div>
            </div>
          </div>
          {searchParams.upload === 'failed' && !p.media_url && (
            <p role="alert" className="mt-2.5 rounded-lg bg-[#FBE9E7] px-3 py-2.5 text-[13.5px] text-red">The publication was created, but the file could not be sent. Add it again with the button above.</p>
          )}
          <p className="mt-2.5 text-[13px] text-textMuted">You post it yourself: download the file here on the day, then paste the caption.</p>
          <div className="mt-5 rounded-xl bg-panel2 px-5 py-4 text-[13.5px] text-textSecondary">
            <div className="font-semibold text-text">Check before posting</div>
            Source shown on the visual · no projection mixed with observed data · “Statlas Research” badge if we computed the figure · no country highlighted unless it is in the ranking
          </div>
        </section>

        <form action={savePost} className="space-y-5">
          <input type="hidden" name="id" value={p.id} />
          <input type="hidden" name="current_status" value={p.status} />
          <div className="rounded-xl border border-border bg-panel p-5">
            <div className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-textMuted">Schedule</div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className={`${lab} sm:col-span-2`}>Title<input name="title" defaultValue={p.title} className={`mt-1 ${field}`} /></label>
              <label className={lab}>Date<input type="date" name="date" defaultValue={p.scheduled_at ? dayKey(p.scheduled_at) : ''} className={`mt-1 ${field}`} /></label>
              <label className={lab}>Time, Paris<input type="time" name="time" defaultValue={p.scheduled_at ? timeOf(p.scheduled_at) : '12:00'} className={`mt-1 ${field}`} /></label>
              <label className={lab}>Project
                <select name="project" defaultValue={p.project} className={`mt-1 ${field}`}>{(Object.keys(PROJECTS) as (keyof typeof PROJECTS)[]).map((k) => <option key={k} value={k}>{PROJECTS[k].label}</option>)}</select>
              </label>
              <label className={lab}>Format
                <select name="format" defaultValue={p.format ?? 'chart'} className={`mt-1 ${field}`}>{Object.entries(FORMATS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select>
              </label>
            </div>
            <div className="mt-3 text-[13px] text-textSecondary">Networks</div>
            <div className="mt-1 flex flex-wrap gap-2">
              {Object.entries(NETWORKS).map(([k, v]) => (
                <label key={k} className="flex h-11 items-center gap-2 rounded-full border border-borderStrong px-4 text-[14px]">
                  <input type="checkbox" name="platforms" value={k} defaultChecked={p.platforms.includes(k)} className="h-5 w-5" />{v}
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-panel p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-textMuted">Caption</div>
              <CopyButton targetId="caption" />
            </div>
            <textarea id="caption" name="caption" defaultValue={p.caption ?? ''} rows={9} placeholder="Text of the post" className="mt-3 w-full rounded-lg border border-borderStrong bg-panel p-3 text-[16px] leading-relaxed" />
            <label className={`mt-3 ${lab}`}>Internal notes<input name="notes" defaultValue={p.notes ?? ''} className={`mt-1 ${field}`} /></label>
          </div>

          <div className="rounded-xl border border-border bg-panel p-5">
            <div className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-textMuted">Links once posted</div>
            <div className="mt-3 space-y-2">
              {Object.entries(NETWORKS).map(([k, v]) => (
                <label key={k} className={lab}>{v}<input name={`link_${k}`} type="url" defaultValue={p.links?.[k] ?? ''} placeholder="https://…" className={`mt-1 ${field}`} /></label>
              ))}
            </div>
          </div>
          <button className="h-11 rounded-lg bg-accent px-6 text-[14px] font-semibold text-white hover:opacity-90">Save</button>
        </form>
      </div>
    </StudioShell>
  );
}
