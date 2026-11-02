'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="font-serif text-[28px] text-white">Something went wrong</div>
        <p className="text-textSecondary text-[14px] mt-2">The data could not be loaded. This is usually temporary.</p>
        <div className="mt-6 flex justify-center gap-2">
          <button type="button" onClick={reset} className="rounded-md bg-accent px-4 py-2 text-[13px] text-white">
            Try again
          </button>
          <a href="/" className="rounded-md border border-border px-4 py-2 text-[13px] text-textSecondary hover:text-white">
            Overview
          </a>
        </div>
      </div>
    </div>
  );
}
