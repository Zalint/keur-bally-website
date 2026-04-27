'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { sendOrderNotification } from '@/lib/notify';
import { buildCartMessage } from '@/lib/whatsapp';
import type { CartItem } from '@/lib/types';

const cartItemSchema = z.object({
  productId: z.string(),
  slug: z.string(),
  nom: z.string(),
  type: z.enum(['produit', 'pack']),
  prix_fcfa: z.number().int().min(0),
  unite: z.string(),
  quantite: z.number().min(0),
  image_url: z.string(),
  livraison_gratuite: z.boolean(),
  disponible: z.boolean().optional(),
});

const createOrderSchema = z.object({
  customerName: z.string().min(2, 'Nom trop court'),
  customerPhone: z
    .string()
    .min(8, 'Téléphone invalide')
    .regex(/^[+\d\s-]+$/, 'Téléphone invalide'),
  customerAddress: z.string().optional().nullable(),
  customerNote: z.string().optional().nullable(),
  items: z.array(cartItemSchema).min(1, 'Panier vide'),
});

function generateRef() {
  // 6 caractères alphanumériques majuscules
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `KB-${s}`;
}

export async function createOrder(input: unknown): Promise<
  | { ok: true; ref: string; whatsappUrl: string }
  | { ok: false; error: string }
> {
  const parsed = createOrderSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Données invalides' };
  }
  const { customerName, customerPhone, customerAddress, customerNote, items } =
    parsed.data;

  // Filtrer les indisponibles
  const valid = items.filter((i) => i.disponible !== false);
  if (valid.length === 0) {
    return { ok: false, error: 'Aucun article disponible dans le panier' };
  }

  const totalFcfa = valid.reduce((s, i) => s + Math.round(i.prix_fcfa * i.quantite), 0);
  const itemsCount = valid.length;

  // Construit le message WhatsApp avec la référence en haut
  const baseMessage = buildCartMessage(valid as CartItem[]);

  // Génération ref avec retry sur collision (très improbable mais propre)
  let ref = generateRef();
  for (let attempt = 0; attempt < 5; attempt++) {
    const exists = await prisma.order.findUnique({ where: { ref } });
    if (!exists) break;
    ref = generateRef();
  }

  const noteFooter = [
    customerAddress ? `Adresse : ${customerAddress}` : null,
    customerNote ? `Note : ${customerNote}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  const finalMessage =
    `Réf commande : ${ref}\nClient : ${customerName} — ${customerPhone}\n\n` +
    baseMessage +
    (noteFooter ? `\n\n${noteFooter}` : '');

  const order = await prisma.order.create({
    data: {
      ref,
      customerName,
      customerPhone,
      customerAddress: customerAddress || null,
      customerNote: customerNote || null,
      totalFcfa,
      itemsCount,
      rawMessage: finalMessage,
      items: {
        create: valid.map((i) => ({
          itemId: i.productId,
          nom: i.nom,
          type: i.type === 'pack' ? 'PACK' : 'PRODUIT',
          unite: i.unite,
          quantite: i.quantite,
          prixFcfa: i.prix_fcfa,
          totalLine: Math.round(i.prix_fcfa * i.quantite),
        })),
      },
    },
    include: { items: true },
  });

  // Notification email — non bloquante
  sendOrderNotification(order).catch((err) => {
    console.error('[orders] notification failed', err);
  });

  revalidatePath('/admin/commandes');

  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim() || '221770000000';
  const whatsappUrl = `https://wa.me/${number}?text=${encodeURIComponent(finalMessage)}`;
  return { ok: true, ref, whatsappUrl };
}

const statusSchema = z.enum(['NOUVEAU', 'CONFIRME', 'EN_LIVRAISON', 'LIVRE', 'ANNULE']);

export async function updateOrderStatus(id: string, status: unknown) {
  const { auth } = await import('@/auth');
  const session = await auth();
  if (!session?.user) throw new Error('Non authentifié');

  const parsed = statusSchema.safeParse(status);
  if (!parsed.success) return { ok: false as const, error: 'Statut invalide' };

  await prisma.order.update({ where: { id }, data: { status: parsed.data } });
  revalidatePath('/admin/commandes');
  revalidatePath(`/admin/commandes/${id}`);
  return { ok: true as const };
}

export async function deleteOrder(id: string) {
  const { auth } = await import('@/auth');
  const session = await auth();
  if (session?.user?.role !== 'OWNER') throw new Error('Accès refusé');

  await prisma.order.delete({ where: { id } });
  revalidatePath('/admin/commandes');
  return { ok: true as const };
}
