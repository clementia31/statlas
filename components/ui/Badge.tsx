export default function Badge({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'warn' | 'accent' }) {
  const cls =
    tone === 'warn'
      ? 'border-yellow/40 text-yellow bg-yellow/10'
      : tone === 'accent'
        ? 'border-accent/40 text-accent bg-accent/10'
        : 'border-border text-textSecondary bg-panel2';
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10.5px] font-medium ${cls}`}>{children}</span>;
}
