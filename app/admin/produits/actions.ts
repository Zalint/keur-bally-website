'use server';

import { revalidateTag, revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { ItemType } from '@prisma/client';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { ITEMS_CACHE_TAG } from '@/lib/items';

type Result = { ok: true } | { ok: false; error: string };

async function requireAuth() {
  const session = await auth();
  if (!session?.user) throw new Error('Non authentifié');
  return session;
}

const itemSchema = z.object({
  id: z.string().min(1).regex(/^[a-z0-9-]+$/, 'minuscules, chiffres et tirets uniquement'),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  type: z.enum(['PRODUIT', 'PACK']),
  nom: z.string().min(1),
  categorie: z.string().min(1),
  description: z.string().optional().nullable(),
  prixFcfa: z.number().int().min(0),
  unite: z.string().min(1),
  imageUrl: z.string().url(),
  imageUrl2: z.string().url().optional().nullable(),
  imageUrl3: z.string().url().optional().nullable(),
  disponible: z.boolean(),
  ordre: z.number().int().min(0),
  composition: z.string().optional().nullable(),
  livraisonGratuite: z.boolean(),
  note: z.string().optional().nullable(),
});

function invalidate() {
  revalidateTag(ITEMS_CACHE_TAG);
  revalidatePath('/');
  revalidatePath('/catalogue');
  revalidatePath('/packs');
  revalidatePath('/admin');
}

export async function createItem(input: unknown): Promise<Result> {
  await requireAuth();
  const parsed = itemSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalide' };

  const exists = await prisma.item.findFirst({
    where: { OR: [{ id: parsed.data.id }, { slug: parsed.data.slug }] },
  });
  if (exists) return { ok: false, error: 'id ou slug déjà utilisé' };

  await prisma.item.create({ data: parsed.data });
  invalidate();
  return { ok: true };
}

export async function updateItem(id: string, input: unknown): Promise<Result> {
  await requireAuth();
  const parsed = itemSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalide' };

  const { id: newId, slug, ...rest } = parsed.data;
  if (newId !== id) return { ok: false, error: "L'identifiant ne peut pas être changé" };

  // Vérifier unicité du slug si changé
  const slugConflict = await prisma.item.findFirst({
    where: { slug, NOT: { id } },
  });
  if (slugConflict) return { ok: false, error: 'Ce slug est déjà utilisé' };

  await prisma.item.update({ where: { id }, data: { slug, ...rest } });
  invalidate();
  return { ok: true };
}

export async function deleteItem(id: string): Promise<Result> {
  await requireAuth();
  await prisma.item.delete({ where: { id } });
  invalidate();
  return { ok: true };
}

export async function deleteItemAndRedirect(id: string) {
  const res = await deleteItem(id);
  if (!res.ok) throw new Error(res.error);
  redirect('/admin');
}

const quickSchema = z.object({
  prixFcfa: z.number().int().min(0).optional(),
  disponible: z.boolean().optional(),
});

export async function updateQuickFields(
  id: string,
  patch: { prixFcfa?: number; disponible?: boolean }
): Promise<Result> {
  await requireAuth();
  const parsed = quickSchema.safeParse(patch);
  if (!parsed.success) return { ok: false, error: 'Données invalides' };
  if (Object.keys(parsed.data).length === 0) return { ok: false, error: 'Rien à mettre à jour' };

  await prisma.item.update({ where: { id }, data: parsed.data });
  invalidate();
  return { ok: true };
}
