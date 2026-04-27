import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import ProfilForm from './ProfilForm';

export const dynamic = 'force-dynamic';

export default async function ProfilPage() {
  const session = await auth();
  if (!session?.user) return null;

  const user = await prisma.adminUser.findUnique({
    where: { id: session.user.id },
    select: { email: true, nom: true, role: true },
  });
  if (!user) return null;

  return (
    <div className="max-w-md">
      <h1 className="font-serif text-2xl font-semibold text-kb-ink mb-6">Mon profil</h1>
      <ProfilForm initial={user} />
    </div>
  );
}
