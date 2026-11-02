import AppShell from '@/components/AppShell';

export default function Loading() {
  return (
    <AppShell active="">
      <div className="animate-pulse" aria-busy="true" aria-label="Loading">
        <div className="h-3 w-24 rounded bg-panel2 mb-3" />
        <div className="h-8 w-72 rounded bg-panel2 mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-panel" />
          ))}
        </div>
        <div className="h-[380px] rounded-xl bg-panel" />
      </div>
    </AppShell>
  );
}
