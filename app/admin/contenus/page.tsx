import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

// L'ancien écran « Contenus & calendrier » est remplacé par le Studio.
export default function ContentsPage() {
  redirect('/studio');
}
