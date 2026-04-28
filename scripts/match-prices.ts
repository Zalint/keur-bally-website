/**
 * Match les produits du catalogue avec un fichier de prix externe.
 * Affiche un tableau diff sans rien modifier.
 *
 * Usage: tsx scripts/match-prices.ts <csv-path>
 */
import 'dotenv/config';
import { promises as fs } from 'node:fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // accents
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
  a.forEach((t) => {
    if (b.has(t)) inter++;
  });
  return inter / new Set([...a, ...b]).size;
}

// Score : Jaccard sur tokens + bonus si mots-clés communs distinctifs
function score(dbName: string, csvName: string): number {
  const a = tokenize(dbName);
  const b = tokenize(csvName);
  let s = jaccard(a, b);
  // bonus si tokens significatifs en commun
  const keywords = ['huile', 'riz', 'lait', 'sucre', 'lipton', 'nesquik', 'moringa',
    'tomate', 'lentilles', 'haricots', 'petit', 'plomb', 'kayna', 'cornichons',
    'lasagne', 'paprika', 'curcuma', 'chips', 'noodles', 'fruity', 'orsetto',
    'agneau', 'boeuf', 'veau', 'poulet', 'merguez', 'foie', 'yell', 'oignons',
    'pommes', 'piment', 'madar', 'lave', 'vitre', 'noura', 'sangomar', 'gloria',
    'beghin', 'vanilline', 'mocitos', 'corn', 'ginny', 'tomatina', 'diegboudiar',
    'sunquick', 'bonjourne', 'larroche', 'avril', 'teranga', 'victoria', 'casa',
    'renzo', 'javel', 'actiff', 'epices', 'pack', 'simple', 'complet', 'premium'];
  for (const kw of keywords) {
    if (a.has(kw) && b.has(kw)) s += 0.05;
  }
  return s;
}

type CsvEntry = { name: string; price: number };

async function main() {
  const csvPath = process.argv[2];
  if (!csvPath) {
    console.error('Usage: tsx scripts/match-prices.ts <csv-path>');
    process.exit(1);
  }

  const raw = await fs.readFile(csvPath, 'utf-8');
  const csvEntries: CsvEntry[] = raw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const parts = l.split(',');
      const price = Number(parts[1]?.trim() || 0);
      return { name: parts[0]?.trim() || '', price };
    })
    .filter((e) => e.name && e.price > 0);

  console.log(`→ ${csvEntries.length} entrées dans le fichier de prix\n`);

  const items = await prisma.item.findMany({
    orderBy: [{ type: 'asc' }, { categorie: 'asc' }, { nom: 'asc' }],
  });

  const rows: {
    slug: string;
    nom: string;
    type: string;
    oldPrice: number;
    matchName: string | null;
    matchScore: number;
    newPrice: number | null;
    diff: number | null;
  }[] = [];

  for (const item of items) {
    let best: { entry: CsvEntry; score: number } | null = null;
    for (const e of csvEntries) {
      const s = score(item.nom, e.name);
      if (s > 0 && (!best || s > best.score)) {
        best = { entry: e, score: s };
      }
    }
    rows.push({
      slug: item.slug,
      nom: item.nom,
      type: item.type,
      oldPrice: item.prixFcfa,
      matchName: best?.entry.name ?? null,
      matchScore: best?.score ?? 0,
      newPrice: best?.entry.price ?? null,
      diff: best ? best.entry.price - item.prixFcfa : null,
    });
  }

  // Affichage
  const fmt = (n: number | null) => (n == null ? '—' : n.toLocaleString('fr-FR'));
  const pad = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + '…' : s.padEnd(n));

  console.log(
    pad('Produit catalogue', 35),
    '|',
    pad('Match prix_produits', 35),
    '|',
    'score',
    '|',
    pad('Old', 8),
    '|',
    pad('New', 8),
    '|',
    'Diff'
  );
  console.log('-'.repeat(120));

  const HIGH = 0.5;
  const MED = 0.25;
  let high = 0, med = 0, low = 0;

  for (const r of rows) {
    const tag =
      r.matchScore >= HIGH ? '✓' : r.matchScore >= MED ? '?' : '✗';
    if (r.matchScore >= HIGH) high++;
    else if (r.matchScore >= MED) med++;
    else low++;

    console.log(
      tag,
      pad(r.nom, 33),
      '|',
      pad(r.matchName ?? '—', 35),
      '|',
      r.matchScore.toFixed(2),
      ' |',
      pad(fmt(r.oldPrice), 8),
      '|',
      pad(fmt(r.newPrice), 8),
      '|',
      r.diff == null ? '—' : (r.diff > 0 ? '+' : '') + r.diff.toLocaleString('fr-FR')
    );
  }

  console.log('-'.repeat(120));
  console.log(`✓ Confiance haute (>= ${HIGH}): ${high}`);
  console.log(`? Confiance moyenne (>= ${MED}): ${med}  → à valider à la main`);
  console.log(`✗ Pas de match (<${MED}): ${low}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
