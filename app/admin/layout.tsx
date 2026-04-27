import type { ReactNode } from 'react';
import { auth } from '@/auth';
import AdminShell from './AdminShell';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Admin — Keur Bally',
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  // /admin/login est public : pas de chrome
  // les autres routes : middleware garantit déjà la session
  if (!session) {
    return <>{children}</>;
  }
  return <AdminShell session={session}>{children}</AdminShell>;
}
