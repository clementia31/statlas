'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { uploadPostMedia } from './PublicationComposer';

// Ajoute ou remplace le visuel d'une publication existante.
export default function MediaUploader({ postId, hasMedia }: { postId: string; hasMedia: boolean }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  return (
    <div>
      <input
        ref={input}
        id="media-file"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/webm"
        className="sr-only"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          setBusy(true);
          setError('');
          try {
            const problem = await uploadPostMedia(postId, f);
            if (problem) setError(problem);
            else router.refresh();
          } catch {
            setError('The file could not be sent. Try again.');
          } finally {
            setBusy(false);
            if (input.current) input.current.value = '';
          }
        }}
      />
      <label htmlFor="media-file" aria-disabled={busy} className={`inline-flex h-11 cursor-pointer items-center rounded-lg border border-borderStrong bg-panel px-4 text-[14px] font-medium hover:border-text ${busy ? 'pointer-events-none opacity-50' : ''}`}>
        {busy ? 'Sending…' : hasMedia ? 'Replace the visual' : '＋ Add the image or video'}
      </label>
      {error && <p role="alert" className="mt-2 rounded-lg bg-[#FBE9E7] px-3 py-2 text-[13.5px] text-red">{error}</p>}
    </div>
  );
}
