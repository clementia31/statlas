'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { attachPostMedia, createPost, signPostUpload } from '@/app/studio/actions';

type Opt = { value: string; label: string };
const field = 'h-11 w-full rounded-lg border border-borderStrong bg-panel px-3 text-[16px]';
const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/webm';
const BY_EXT: Record<string, string> = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif', mp4: 'video/mp4', mov: 'video/quicktime', webm: 'video/webm' };
const typeOf = (f: File) => f.type || BY_EXT[f.name.split('.').pop()?.toLowerCase() ?? ''] || 'application/octet-stream';
const size = (n: number) => (n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

// Envoie un fichier vers le stockage privé puis le rattache à la publication. Renvoie un message d'erreur, ou rien si tout va bien.
export async function uploadPostMedia(postId: string, f: File): Promise<string | null> {
  const meta = { name: f.name, type: typeOf(f), size: f.size };
  const s = await signPostUpload(postId, meta);
  if (s.error || !s.signedUrl || !s.path) return s.error ?? `${f.name}: could not be sent.`;
  const up = await fetch(s.signedUrl, { method: 'PUT', headers: { 'content-type': meta.type, 'x-upsert': 'false' }, body: f });
  if (!up.ok) return `${f.name}: the upload was refused (${up.status}).`;
  const a = await attachPostMedia(postId, s.path, meta);
  return a.error ?? null;
}

export default function PublicationComposer({ projects, formats, networks, initialTitle = '', initialProject }: { projects: Opt[]; formats: Opt[]; networks: Opt[]; initialTitle?: string; initialProject?: string }) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(initialTitle);
  const [project, setProject] = useState(initialProject ?? projects[0]?.value ?? 'statlas');
  const [format, setFormat] = useState('chart');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('12:00');
  const [nets, setNets] = useState<string[]>(networks.filter((n) => n.value !== 'gazette').map((n) => n.value));
  const [file, setFile] = useState<File | null>(null);
  const [mediaPath, setMediaPath] = useState('');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError('');
    try {
      setBusy('Creating…');
      const r = await createPost({ title, project, format, date, time, platforms: nets, mediaPath: file ? '' : mediaPath });
      if (r.error || !r.id) {
        setError(r.error ?? 'Could not create the publication.');
        return;
      }
      if (file) {
        setBusy('Sending the visual…');
        const problem = await uploadPostMedia(r.id, file);
        if (problem) {
          // La publication existe : on y va quand même, le visuel pourra être renvoyé depuis sa fiche.
          router.push(`/studio/publications/${r.id}?upload=failed`);
          return;
        }
      }
      router.push(`/studio/publications/${r.id}`);
    } catch {
      setError('Something went wrong. What you typed is still here: try again.');
    } finally {
      setBusy('');
    }
  }

  return (
    <form onSubmit={submit} className="mt-4 grid gap-3 sm:grid-cols-2">
      <label className="text-[13px] text-textSecondary sm:col-span-2">Title<input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} className={`mt-1 ${field}`} /></label>
      <label className="text-[13px] text-textSecondary">Project
        <select value={project} onChange={(e) => setProject(e.target.value)} className={`mt-1 ${field}`}>{projects.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
      </label>
      <label className="text-[13px] text-textSecondary">Format
        <select value={format} onChange={(e) => setFormat(e.target.value)} className={`mt-1 ${field}`}>{formats.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
      </label>
      <label className="text-[13px] text-textSecondary">Date (optional)<input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={`mt-1 ${field}`} /></label>
      <label className="text-[13px] text-textSecondary">Time, Paris<input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={`mt-1 ${field}`} /></label>
      <div className="flex flex-wrap gap-4 sm:col-span-2">
        {networks.map((n) => (
          <label key={n.value} className="flex min-h-11 items-center gap-2 text-[14px]">
            <input type="checkbox" checked={nets.includes(n.value)} onChange={(e) => setNets(e.target.checked ? [...nets, n.value] : nets.filter((x) => x !== n.value))} className="h-5 w-5" />{n.label}
          </label>
        ))}
      </div>

      <div className="sm:col-span-2">
        <div className="text-[13px] text-textSecondary">Image or video (optional — you can add it later)</div>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <input ref={fileInput} id="post-file" type="file" accept={ACCEPT} className="sr-only" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          <label htmlFor="post-file" className="inline-flex h-11 cursor-pointer items-center rounded-lg border border-dashed border-[#B9B3A4] bg-[#FBFAF6] px-4 text-[14px] hover:border-text">{file ? 'Choose another file' : '＋ Choose a file'}</label>
          {file ? (
            <span className="inline-flex items-center gap-2 font-mono text-[12.5px]">
              {file.name} · {size(file.size)}
              <button type="button" aria-label="Remove the file" onClick={() => { setFile(null); if (fileInput.current) fileInput.current.value = ''; }} className="flex h-7 w-7 items-center justify-center rounded text-textMuted hover:bg-panel2">×</button>
            </span>
          ) : (
            <span className="text-[12.5px] text-textMuted">JPG, PNG, WebP, GIF, MP4, MOV or WebM · 50 MB · kept private</span>
          )}
        </div>
        {!file && (
          <details className="mt-2">
            <summary className="cursor-pointer text-[13px] text-textSecondary">Or use a file already on the site</summary>
            <input value={mediaPath} onChange={(e) => setMediaPath(e.target.value)} placeholder="/social/my-chart.jpg" aria-label="Path of a file already on the site" className={`mt-2 font-mono ${field}`} />
          </details>
        )}
      </div>

      {error && <p role="alert" className="rounded-lg bg-[#FBE9E7] px-3 py-2.5 text-[13.5px] text-red sm:col-span-2">{error}</p>}
      <div className="sm:col-span-2"><button disabled={!!busy} className="h-11 rounded-lg bg-accent px-5 text-[14px] font-semibold text-white hover:opacity-90 disabled:opacity-50">{busy || 'Create'}</button></div>
    </form>
  );
}
