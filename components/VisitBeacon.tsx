'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

// Signale chaque page vue au compteur du site. Pas de cookie, rien n'est stocké dans le navigateur.
// Respecte le réglage « ne pas me pister » du navigateur.
export default function VisitBeacon() {
  const pathname = usePathname();
  const first = useRef(true);
  useEffect(() => {
    if (!pathname || pathname === '/studio' || pathname.startsWith('/studio/')) return;
    const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
    if (nav.doNotTrack === '1' || nav.globalPrivacyControl === true) return;
    const entry = first.current;
    first.current = false;
    let tag = '';
    try {
      tag = entry ? new URLSearchParams(window.location.search).get('utm_source') ?? '' : '';
    } catch {}
    const body = JSON.stringify({ p: pathname, r: entry ? document.referrer : '', u: tag, e: entry });
    try {
      if (!navigator.sendBeacon?.('/api/visit', new Blob([body], { type: 'application/json' }))) {
        fetch('/api/visit', { method: 'POST', body, headers: { 'content-type': 'application/json' }, keepalive: true }).catch(() => {});
      }
    } catch {}
  }, [pathname]);
  return null;
}
