'use client';

import { useEffect, useState } from 'react';

// Date du jour (heure de Paris). Les pages de la Gazette sont préparées à l'avance :
// la date est donc recalculée dans le navigateur pour rester celle du jour de la visite.
function format(kind: 'long' | 'short') {
  const now = new Date();
  return kind === 'long'
    ? now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' })
    : now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/Paris' });
}

export default function EditionDate({ kind, initial, className }: { kind: 'long' | 'short'; initial: string; className?: string }) {
  const [text, setText] = useState(initial);
  useEffect(() => setText(format(kind)), [kind]);
  return (
    <span className={className} suppressHydrationWarning>
      {text}
    </span>
  );
}
