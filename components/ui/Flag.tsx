export default function Flag({ iso, size = 'sm' }: { iso: string | null | undefined; size?: 'sm' | 'md' | 'lg' }) {
  const cls = size === 'lg' ? 'w-12 h-8' : size === 'md' ? 'w-7 h-5' : 'w-5 h-3.5';
  if (!iso) return <span className={`${cls} inline-block rounded-sm bg-panel2 border border-border shrink-0`} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/w80/${iso.toLowerCase()}.png`}
      alt=""
      loading="lazy"
      className={`${cls} inline-block rounded-sm object-cover border border-border shrink-0`}
    />
  );
}
