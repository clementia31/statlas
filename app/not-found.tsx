import Link from 'next/link';
import AppShell from '@/components/AppShell';

export default function NotFound() {
  return (
    <AppShell active="">
      <div className="py-20 text-center">
        <div className="font-serif text-[40px] text-white">404</div>
        <p className="text-textSecondary mt-2">This page does not exist.</p>
        <Link href="/" className="mt-6 inline-block rounded-md bg-accent px-4 py-2 text-[13px] text-white">
          Back to overview
        </Link>
      </div>
    </AppShell>
  );
}
