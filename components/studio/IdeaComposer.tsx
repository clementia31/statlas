'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { addIdeaNote, attachIdeaFile, createIdea, signIdeaUpload } from '@/app/studio/actions';

type Opt = { value: string; label: string };
const field = 'h-11 w-full rounded-lg border border-borderStrong bg-panel px-3 text-[16px]';
const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif,application/pdf,text/plain,text/markdown,text/csv,.md,.doc,.docx,.odt,.rtf';
// Certains navigateurs n'indiquent pas le type des fichiers .md, .heic ou .csv : on le déduit alors de l'extension.
const BY_EXT: Record<string, string> = {
  md: 'text/markdown', txt: 'text/plain', csv: 'text/csv', pdf: 'application/pdf', rtf: 'application/rtf',
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif', heic: 'image/heic', heif: 'image/heif',
  doc: 'application/msword', odt: 'application/vnd.oasis.opendocument.text',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};
const typeOf = (f: File) => f.type || BY_EXT[f.name.split('.').pop()?.toLowerCase() ?? ''] || 'application/octet-stream';
const size = (n: number) => (n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

// Saisie d'une idée (mode « new ») ou ajout d'une note et de fichiers à une idée existante (mode « add »).
// Les fichiers partent directement du navigateur vers le stockage privé, avec une adresse à usage unique donnée par le serveur.
export default function IdeaComposer({ ideaId, kinds, projects }: { ideaId?: string; kinds?: Opt[]; projects?: Opt[] }) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [kind, setKind] = useState(kinds?.[0]?.value ?? 'article');
  const [project, setProject] = useState(projects?.[0]?.value ?? 'gazette');
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const isNew = !ideaId;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    const problems: string[] = [];
    setErrors([]);
    try {
      let id = ideaId;
      if (isNew) {
        setBusy('Saving…');
        const r = await createIdea({ title, body: text, kind, project });
        if (r.error || !r.id) {
          setErrors([r.error ?? 'Could not save.']);
          return;
        }
        id = r.id;
      } else if (text.trim()) {
        setBusy('Saving…');
        const r = await addIdeaNote(id!, text);
        if (r.error) problems.push(r.error);
      }
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        setBusy(`Sending file ${i + 1} of ${files.length}…`);
        const meta = { name: f.name, type: typeOf(f), size: f.size };
        const s = await signIdeaUpload(id!, meta);
        if (s.error || !s.signedUrl || !s.path) {
          problems.push(s.error ?? `${f.name}: could not be sent.`);
          continue;
        }
        const up = await fetch(s.signedUrl, { method: 'PUT', headers: { 'content-type': meta.type, 'x-upsert': 'false' }, body: f });
        if (!up.ok) {
          problems.push(`${f.name}: the upload was refused (${up.status}).`);
          continue;
        }
        const a = await attachIdeaFile(id!, s.path, meta);
        if (a.error) problems.push(a.error);
      }
      setTitle('');
      setText('');
      setFiles([]);
      if (fileInput.current) fileInput.current.value = '';
      setErrors(problems);
      router.refresh();
    } catch {
      setErrors([...problems, 'Something went wrong. What you typed is still here: try again.']);
    } finally {
      setBusy('');
    }
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-border bg-panel p-5">
      <div className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-textMuted">{isNew ? 'Note an idea' : 'Add to this idea'}</div>
      {isNew && (
        <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px_180px]">
          <input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} aria-label="Title" placeholder="Title — what is the idea?" className={field} />
          <select value={kind} onChange={(e) => setKind(e.target.value)} aria-label="Type" className={field}>{kinds?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
          <select value={project} onChange={(e) => setProject(e.target.value)} aria-label="Project" className={field}>{projects?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
        </div>
      )}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={isNew ? 4 : 3}
        aria-label={isNew ? 'Details' : 'New note'}
        placeholder={isNew ? 'Write freely: the angle, a figure you saw, a link, a question to check…' : 'A new note, a link, a figure, a paragraph for the article…'}
        className="mt-3 w-full rounded-lg border border-borderStrong bg-panel p-3 text-[16px] leading-relaxed"
      />
      {files.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-2">
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`} className="inline-flex items-center gap-2 rounded-lg border border-border px-2.5 py-1.5 font-mono text-[12.5px]">
              {f.name} · {size(f.size)}
              <button type="button" aria-label={`Remove ${f.name}`} onClick={() => setFiles(files.filter((_, j) => j !== i))} className="flex h-7 w-7 items-center justify-center rounded text-textMuted hover:bg-panel2">×</button>
            </li>
          ))}
        </ul>
      )}
      {errors.length > 0 && (
        <ul role="alert" className="mt-3 space-y-1 rounded-lg bg-[#FBE9E7] px-3 py-2.5 text-[13.5px] text-red">{errors.map((x, i) => <li key={i}>{x}</li>)}</ul>
      )}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <input ref={fileInput} type="file" multiple accept={ACCEPT} className="sr-only" id={`files-${ideaId ?? 'new'}`} onChange={(e) => setFiles([...files, ...Array.from(e.target.files ?? [])])} />
          <label htmlFor={`files-${ideaId ?? 'new'}`} className="inline-flex h-11 cursor-pointer items-center rounded-lg border border-dashed border-[#B9B3A4] bg-[#FBFAF6] px-4 text-[14px] hover:border-text">＋ Add a photo or a file</label>
          <span className="text-[12.5px] text-textMuted">Photo, screenshot, PDF or text file · 20 MB each · kept private</span>
        </div>
        <button disabled={!!busy || (!isNew && !text.trim() && files.length === 0)} className="h-11 rounded-lg bg-accent px-5 text-[14px] font-semibold text-white hover:opacity-90 disabled:opacity-50">
          {busy || (isNew ? 'Save idea' : 'Add')}
        </button>
      </div>
    </form>
  );
}
