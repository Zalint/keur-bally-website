import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import UsersClient from './UsersClient';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const session = await auth();
  if (session?.user?.role !== 'OWNER') redirect('/admin');

  const users = await prisma.adminUser.findMany({
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      email: true,
      nom: true,
      role: true,
      createdAt: true,
      lastLoginAt: true,
    },
  });

  return (
    <div className="max-w-4xl">
      <h1 className="font-serif text-2xl font-semibold text-kb-ink mb-6">
        Administrateurs
      </h1>
      <UsersClient
        users={users.map((u) => ({
          ...u,
          createdAt: u.createdAt.toISOString(),
          lastLoginAt: u.lastLoginAt?.toISOString() ?? null,
        }))}
        currentUserId={session.user.id}
      />
    </div>
  );
}
