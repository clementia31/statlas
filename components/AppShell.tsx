import Nav from './Nav';

export default function AppShell({ active, children }: { active: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen lg:flex">
      <Nav active={active} />
      <main className="flex-1 min-w-0">
        <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8 py-6 lg:py-8">{children}</div>
      </main>
    </div>
  );
}
