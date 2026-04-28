/**
 * Génère un CSV de propositions de mise à jour de prix.
 * Sortie : ../price-proposals.csv (à la racine du repo)
 *
 * Usage: tsx scripts/export-price-proposals.ts <csv-path>
 */
import 'dotenv/config';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(s: string): Set<string> {
  return new Set(normalize(s).split(' ').filter((t) => t.length >= 2));
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  a.forEach((t) => { if (b.has(t)) inter++; });
  return inter / new Set([...a, ...b]).size;
}

const KEYWORDS = [
  'huile', 'riz', 'lait', 'sucre', 'lipton', 'nesquik', 'moringa',
  'tomate', 'lentilles', 'haricots', 'petit', 'plomb', 'kayna', 'cornichons',
  'lasagne', 'paprika', 'curcuma', 'chips', 'noodles', 'fruity', 'orsetto',
  'agneau', 'boeuf', 'veau', 'poulet', 'merguez', 'foie', 'yell', 'oignons',
  'pommes', 'piment', 'madar', 'lave', 'vitre', 'noura', 'sangomar', 'gloria',
  'beghin', 'vanilline', 'mocitos', 'corn', 'ginny', 'tomatina', 'diegboudiar',
  'sunquick', 'bonjourne', 'larroche', 'avril', 'teranga', 'victoria', 'casa',
  'renzo', 'javel', 'actiff', 'epices', 'pack', 'simple', 'complet', 'premium',
];

function score(dbName: string, csvName: string): number {
  const a = tokenize(dbName);
  const b = tokenize(csvName);
  let s = jaccard(a, b);
  for (const kw of KEYWORDS) if (a.has(kw) && b.has(kw)) s += 0.05;
  return s;
}

// Quelques jugements humains pour le commentaire automatique
function comment(dbName: string, matchName: string | null, score: number, oldPrice: number, newPrice: number | null): { reco: string; comment: string } {
  if (!matchName || newPrice == null) {
    return { reco: 'NON', comment: 'Aucun produit similaire dans le fichier de prix. Garder le prix actuel.' };
  }
  const dn = normalize(dbName);
  const mn = normalize(matchName);

  // Cas exact ou quasi-identique sur tokens
  if (score >= 0.9) {
    if (oldPrice === newPrice) return { reco: 'NON', comment: 'Match identique, prix déjà à jour.' };
    return { reco: 'OUI', comment: 'Match très fiable.' };
  }

  // Format différent (kg, L, taille)
  const sizeRegex = /(\d+(?:[.,]\d+)?)\s*(kg|g|l|ml|cl|sachet|pi[èe]ces?)/g;
  const dSize = [...dn.matchAll(sizeRegex)].map((m) => m[0]);
  const mSize = [...mn.matchAll(sizeRegex)].map((m) => m[0]);
  if (dSize.length && mSize.length && dSize.join(' ') !== mSize.join(' ')) {
    return { reco: '?', comment: `Formats différents (${dSize.join(',')} vs ${mSize.join(',')}). Vérifier qu'il s'agit du même conditionnement.` };
  }

  // Faux amis fréquents (boeuf vs veau)
  const dHasBoeuf = dn.includes('boeuf') || dn.includes('bœuf');
  const dHasVeau = dn.includes('veau');
  const mHasBoeuf = mn.includes('boeuf') || mn.includes('bœuf');
  const mHasVeau = mn.includes('veau');
  if ((dHasBoeuf && mHasVeau) || (dHasVeau && mHasBoeuf)) {
    return { reco: 'NON', comment: 'Animal différent (bœuf ≠ veau). Faux match.' };
  }
  if (dn.includes('foie') && !mn.includes('foie')) {
    return { reco: 'NON', comment: 'Match perdu (le foie est un abat, pas un morceau).' };
  }

  // Match « partie pour le tout » (Poulet vs Pilon Poulet)
  if (dn === 'poulet' && mn.includes('pilon')) {
    return { reco: 'NON', comment: 'Pilon ≠ poulet entier. Faux match.' };
  }

  // Mots-clés très distinctifs
  const distinct = ['nutella', 'kit kat', 'biscrem', 'beurre', 'orsetto', 'actiff'];
  for (const d of distinct) {
    if (dn.includes(d) !== mn.includes(d)) {
      return { reco: 'NON', comment: `Marques/produits différents (${d}).` };
    }
  }

  if (score >= 0.5) return { reco: 'OUI', comment: 'Match probable. Vérifier rapidement.' };
  if (score >= 0.3) return { reco: '?', comment: 'Match incertain. Inspecter manuellement.' };
  return { reco: 'NON', comment: 'Match faible, probablement faux.' };
}

function csvEscape(s: string | number | null): string {
  if (s == null) return '';
  const str = String(s);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

async function main() {
  const csvPath = process.argv[2];
  if (!csvPath) {
    console.error('Usage: tsx scripts/export-price-proposals.ts <csv-path>');
    process.exit(1);
  }

  const raw = await fs.readFile(csvPath, 'utf-8');
  const csvEntries = raw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const parts = l.split(',');
      return { name: parts[0]?.trim() || '', price: Number(parts[1]?.trim() || 0) };
    })
    .filter((e) => e.name && e.price > 0);

  const items = await prisma.item.findMany({
    orderBy: [{ type: 'asc' }, { categorie: 'asc' }, { ordre: 'asc' }],
  });

  const lines: string[] = [];
  lines.push(
    'valider_O_N,slug,nom_keur_bally,categorie,prix_actuel,match_propose,prix_propose,diff,score,recommandation,commentaire'
  );

  for (const item of items) {
    let best: { entry: typeof csvEntries[number]; score: number } | null = null;
    for (const e of csvEntries) {
      const s = score(item.nom, e.name);
      if (s > 0 && (!best || s > best.score)) best = { entry: e, score: s };
    }
    const newPrice = best?.entry.price ?? null;
    const matchName = best?.entry.name ?? null;
    const sc = best?.score ?? 0;
    const { reco, comment: cmt } = comment(item.nom, matchName, sc, item.prixFcfa, newPrice);
    const diff = newPrice != null ? newPrice - item.prixFcfa : null;

    lines.push(
      [
        reco,
        item.slug,
        item.nom,
        item.categorie,
        item.prixFcfa,
        matchName,
        newPrice,
        diff,
        sc.toFixed(2),
        '', // colonne reco vide pour réutiliser celle du commentaire
        cmt,
      ]
        .map(csvEscape)
        .join(',')
    );
  }

  // Petit nettoyage : remettre la reco dans la bonne colonne
  // (On la met directement comme première colonne ci-dessus.)

  const outPath = path.join(process.cwd(), 'price-proposals.csv');
  await fs.writeFile(outPath, lines.join('\n') + '\n', 'utf-8');
  console.log(`✓ ${lines.length - 1} lignes écrites dans ${outPath}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
