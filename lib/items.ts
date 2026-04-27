import { unstable_cache } from 'next/cache';
import type { Item as PrismaItem } from '@prisma/client';
import { prisma } from './db';
import type { CatalogueItem, ItemType } from './types';

export const ITEMS_CACHE_TAG = 'items';

function toComposition(v: string | null | undefined): string[] {
  if (!v) return [];
  return v
    .split(/\\n|\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

function toCatalogueItem(p: PrismaItem): CatalogueItem {
  return {
    id: p.id,
    slug: p.slug,
    type: p.type === 'PACK' ? 'pack' : 'produit',
    nom: p.nom,
    categorie: p.categorie,
    description: p.description ?? '',
    prix_fcfa: p.prixFcfa,
    unite: p.unite,
    image_url: p.imageUrl,
    image_url_2: p.imageUrl2 ?? undefined,
    image_url_3: p.imageUrl3 ?? undefined,
    disponible: p.disponible,
    ordre: p.ordre,
    composition: p.type === 'PACK' ? toComposition(p.composition) : [],
    livraison_gratuite: p.livraisonGratuite,
    note: p.note ?? undefined,
  };
}

async function fetchAllFromDb(): Promise<CatalogueItem[]> {
  const rows = await prisma.item.findMany({
    orderBy: [{ categorie: 'asc' }, { ordre: 'asc' }],
  });
  return rows.map(toCatalogueItem);
}

const cachedAll = unstable_cache(fetchAllFromDb, ['items-all'], {
  tags: [ITEMS_CACHE_TAG],
  revalidate: 3600,
});

export async function getAllItems(): Promise<CatalogueItem[]> {
  return cachedAll();
}

export async function getAvailableItems(): Promise<CatalogueItem[]> {
  return (await getAllItems()).filter((i) => i.disponible);
}

export async function getItemBySlug(slug: string): Promise<CatalogueItem | null> {
  const items = await getAllItems();
  return items.find((i) => i.slug === slug) ?? null;
}

export async function getPacks(): Promise<CatalogueItem[]> {
  return (await getAvailableItems()).filter((i) => i.type === 'pack');
}

export async function getProduits(): Promise<CatalogueItem[]> {
  return (await getAvailableItems()).filter((i) => i.type === 'produit');
}

export async function getCategories(): Promise<string[]> {
  const items = await getAvailableItems();
  return Array.from(new Set(items.map((i) => i.categorie))).sort();
}

// ---------- Helpers admin (côté serveur uniquement) ----------

export type AdminItemInput = {
  id: string;
  slug: string;
  type: ItemType;
  nom: string;
  categorie: string;
  description?: string;
  prix_fcfa: number;
  unite: string;
  image_url: string;
  image_url_2?: string;
  image_url_3?: string;
  disponible: boolean;
  ordre: number;
  composition?: string;
  livraison_gratuite: boolean;
  note?: string;
};

export async function getItemByIdAdmin(id: string) {
  return prisma.item.findUnique({ where: { id } });
}

export async function listItemsAdmin() {
  return prisma.item.findMany({
    orderBy: [{ categorie: 'asc' }, { ordre: 'asc' }],
  });
}
