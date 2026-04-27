'use server';

import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';

async function requireAuth() {
  const session = await auth();
  if (!session?.user) throw new Error('Non authentifié');
  return session;
}

export async function updateProfil(input: { nom: string }) {
  const session = await requireAuth();
  const parsed = z.object({ nom: z.string().min(1) }).safeParse(input);
  if (!parsed.success) return { ok: false as const, error: 'Nom invalide' };
  await prisma.adminUser.update({
    where: { id: session.user.id },
    data: { nom: parsed.data.nom },
  });
  return { ok: true as const };
}

export async function changePassword(input: {
  currentPassword: string;
  newPassword: string;
}) {
  const session = await requireAuth();
  const parsed = z
    .object({
      currentPassword: z.string().min(1),
      newPassword: z.string().min(8),
    })
    .safeParse(input);
  if (!parsed.success) return { ok: false as const, error: 'Mot de passe invalide (8 car. minimum)' };

  const user = await prisma.adminUser.findUnique({ where: { id: session.user.id } });
  if (!user) return { ok: false as const, error: 'Utilisateur introuvable' };

  const ok = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!ok) return { ok: false as const, error: 'Mot de passe actuel incorrect' };

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await prisma.adminUser.update({
    where: { id: session.user.id },
    data: { passwordHash },
  });
  return { ok: true as const };
}
