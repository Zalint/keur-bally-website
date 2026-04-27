import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { CatalogueItem } from './types';

// Parser CSV minimal : gère les cellules entre guillemets et les retours
// à la ligne échappés \n dans la composition des packs.
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        cell += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(cell);
      cell = '';
    } else if (c === '\n') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else if (c === '\r') {
      // ignore
    } else {
      cell += c;
    }
  }
  if (cell !== '' || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((v) => v.trim() !== ''));
}

function toBool(v: string): boolean {
  return v.trim().toLowerCase() === 'oui';
}

function toComposition(v: string): string[] {
  if (!v) return [];
  // Le CSV peut contenir des \n littéraux (deux caractères) ou de vrais retours.
  return v
    .split(/\\n|\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

function rowsToItems(rows: string[][]): CatalogueItem[] {
  if (rows.length === 0) return [];
  const headers = rows[0].map((h) => h.trim().toLowerCase());
  const idx = (name: string) => headers.indexOf(name);

  const I = {
    id: idx('id'),
    slug: idx('slug'),
    type: idx('type'),
    nom: idx('nom'),
    categorie: idx('categorie'),
    description: idx('description'),
    prix: idx('prix_fcfa'),
    unite: idx('unite'),
    image: idx('image_url'),
    image2: idx('image_url_2'),
    image3: idx('image_url_3'),
    dispo: idx('disponible'),
    ordre: idx('ordre'),
    composition: idx('composition'),
    livraison: idx('livraison_gratuite'),
    note: idx('note'),
  };

  return rows
    .slice(1)
    .map((r): CatalogueItem | null => {
      const id = r[I.id]?.trim();
      if (!id) return null;
      const type = (r[I.type]?.trim() === 'pack' ? 'pack' : 'produit') as
        | 'produit'
        | 'pack';
      return {
        id,
        slug: r[I.slug]?.trim() || id,
        type,
        nom: r[I.nom]?.trim() ?? '',
        categorie: r[I.categorie]?.trim() ?? '',
        description: r[I.description]?.trim() ?? '',
        prix_fcfa: Number(r[I.prix]?.replace(/\s/g, '') || 0),
        unite: r[I.unite]?.trim() ?? 'pièce',
        image_url: r[I.image]?.trim() ?? '',
        image_url_2: r[I.image2]?.trim() || undefined,
        image_url_3: r[I.image3]?.trim() || undefined,
        disponible: toBool(r[I.dispo] ?? 'oui'),
        ordre: Number(r[I.ordre] || 999),
        composition: type === 'pack' ? toComposition(r[I.composition] ?? '') : [],
        livraison_gratuite: toBool(r[I.livraison] ?? 'non'),
        note: r[I.note]?.trim() || undefined,
      };
    })
    .filter((x): x is CatalogueItem => x !== null)
    .sort((a, b) => a.ordre - b.ordre);
}

async function fetchSheetCsv(url: string): Promise<string> {
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Sheet fetch failed: ${res.status}`);
  return await res.text();
}

async function readLocalSampleCsv(): Promise<string> {
  const filePath = path.join(process.cwd(), 'data', 'sample.csv');
  return await fs.readFile(filePath, 'utf-8');
}

// Cache mémoire d'1 heure (aligné sur l'ISR) pour éviter les re-fetchs.
let cache: { at: number; items: CatalogueItem[] } | null = null;
const TTL_MS = 60 * 60 * 1000;

export async function getAllItems(): Promise<CatalogueItem[]> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.items;

  const url = process.env.GOOGLE_SHEET_CSV_URL?.trim();
  let csv: string;
  try {
    csv = url ? await fetchSheetCsv(url) : await readLocalSampleCsv();
  } catch (err) {
    console.warn('[sheets] fallback to sample.csv:', err);
    csv = await readLocalSampleCsv();
  }
  const items = rowsToItems(parseCsv(csv));
  cache = { at: Date.now(), items };
  return items;
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
