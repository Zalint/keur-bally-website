'use server';

import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';

async function requireOwner() {
  const session = await auth();
  if (!session?.user) throw new Error('Non authentifié');
  if (session.user.role !== 'OWNER') throw new Error('Accès refusé (OWNER requis)');
  return session;
}

const createSchema = z.object({
  email: z.string().email().transform((s) => s.toLowerCase()),
  nom: z.string().min(1),
  password: z.string().min(8),
  role: z.enum(['OWNER', 'EDITOR']),
});

export async function createUser(input: unknown) {
  await requireOwner();
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? 'Invalide' };
  }
  const exists = await prisma.adminUser.findUnique({
    where: { email: parsed.data.email },
  });
  if (exists) return { ok: false as const, error: 'Email déjà utilisé' };

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const user = await prisma.adminUser.create({
    data: {
      email: parsed.data.email,
      nom: parsed.data.nom,
      role: parsed.data.role,
      passwordHash,
    },
    select: {
      id: true,
      email: true,
      nom: true,
      role: true,
      createdAt: true,
      lastLoginAt: true,
    },
  });
  return {
    ok: true as const,
    user: {
      ...user,
      createdAt: user.createdAt.toISOString(),
      lastLoginAt: null,
    },
  };
}

export async function updateRole(id: string, role: 'OWNER' | 'EDITOR') {
  const session = await requireOwner();
  if (session.user.id === id) {
    return { ok: false as const, error: 'Vous ne pouvez pas changer votre propre rôle' };
  }
  await prisma.adminUser.update({ where: { id }, data: { role } });
  return { ok: true as const };
}

export async function deleteUser(id: string) {
  const session = await requireOwner();
  if (session.user.id === id) {
    return { ok: false as const, error: 'Vous ne pouvez pas vous supprimer vous-même' };
  }
  await prisma.adminUser.delete({ where: { id } });
  return { ok: true as const };
}
