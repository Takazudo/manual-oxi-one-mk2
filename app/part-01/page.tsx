import { redirect } from 'next/navigation';
import { getPagePath } from '@/lib/manual-config';

export default function Part01Page() {
  // Redirect old part-based URL to new continuous page structure
  redirect(getPagePath(1));
}
