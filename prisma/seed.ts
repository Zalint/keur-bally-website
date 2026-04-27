/**
 * Seed la table Item depuis le Google Sheet (si GOOGLE_SHEET_CSV_URL défini)
 * sinon depuis data/sample.csv.
 *
 * Usage : npm run db:seed
 *
 * Stratégie : upsert par id. Aucune ligne supprimée. Sûr à relancer.
 */
import 'dotenv/config';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { PrismaClient, ItemType } from '@prisma/client';

const prisma = new PrismaClient();

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
      // skip
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

const toBool = (v: string | undefined) => v?.trim().toLowerCase() === 'oui';

async function loadCsv(): Promise<string> {
  const url = process.env.GOOGLE_SHEET_CSV_URL?.trim();
  if (url) {
    console.log('→ Sheet:', url.slice(0, 80) + '...');
    const res = await fetch(url, { redirect: 'follow' });
    if (!res.ok) throw new Error(`Sheet fetch failed: ${res.status}`);
    return res.text();
  }
  const filePath = path.join(process.cwd(), 'data', 'sample.csv');
  console.log('→ Local CSV:', filePath);
  return fs.readFile(filePath, 'utf-8');
}

async function main() {
  const csv = await loadCsv();
  const rows = parseCsv(csv);
  if (rows.length === 0) throw new Error('CSV vide');

  const headers = rows[0].map((h) => h.trim().toLowerCase());
  const idx = (n: string) => headers.indexOf(n);
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

  let upserted = 0;
  for (const r of rows.slice(1)) {
    const id = r[I.id]?.trim();
    if (!id) continue;
    const slug = r[I.slug]?.trim() || id;
    const type: ItemType = r[I.type]?.trim() === 'pack' ? 'PACK' : 'PRODUIT';
    const data = {
      slug,
      type,
      nom: r[I.nom]?.trim() ?? '',
      categorie: r[I.categorie]?.trim() ?? '',
      description: r[I.description]?.trim() || null,
      prixFcfa: Number(r[I.prix]?.replace(/\s/g, '') || 0),
      unite: r[I.unite]?.trim() || 'pièce',
      imageUrl: r[I.image]?.trim() ?? '',
      imageUrl2: r[I.image2]?.trim() || null,
      imageUrl3: r[I.image3]?.trim() || null,
      disponible: toBool(r[I.dispo]),
      ordre: Number(r[I.ordre] || 999),
      composition: type === 'PACK' ? r[I.composition]?.trim() || null : null,
      livraisonGratuite: toBool(r[I.livraison]),
      note: r[I.note]?.trim() || null,
    };

    await prisma.item.upsert({
      where: { id },
      create: { id, ...data },
      update: data,
    });
    upserted++;
  }
  console.log(`✓ ${upserted} items upserted`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
