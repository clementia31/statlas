'use client';

import { useState } from 'react';

// Copie le contenu d'un champ (la légende, telle qu'elle est à l'écran, modifications comprises).
export default function CopyButton({ targetId }: { targetId: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        const el = document.getElementById(targetId) as HTMLTextAreaElement | null;
        if (!el) return;
        try {
          await navigator.clipboard.writeText(el.value);
        } catch {
          el.select();
          document.execCommand('copy');
        }
        setDone(true);
        setTimeout(() => setDone(false), 1800);
      }}
      className="inline-flex h-11 items-center rounded-lg border border-borderStrong bg-panel px-4 text-[14px] font-medium hover:border-text"
    >
      {done ? 'Copied' : 'Copy'}
    </button>
  );
}
