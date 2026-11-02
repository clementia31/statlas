import { redirect } from 'next/navigation';

// L'ancienne page « Analysis » est fusionnée dans The Gazette
export default function AnalysisPage() {
  redirect('/gazette');
}
