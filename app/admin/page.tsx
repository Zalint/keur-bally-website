import Link from 'next/link';
import Image from 'next/image';
import { listItemsAdmin } from '@/lib/items';
import InlineRow from './InlineRow';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const items = await listItemsAdmin();

  const total = items.length;
  const dispo = items.filter((i) => i.disponible).length;
  const indispo = total - dispo;
  const packs = items.filter((i) => i.type === 'PACK').length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-kb-ink">Catalogue</h1>
          <p className="text-sm text-kb-olive">
            {total} items · {dispo} disponibles · {indispo} indisponibles · {packs} packs
          </p>
        </div>
        <Link
          href="/admin/produits/nouveau"
          className="inline-flex h-10 items-center px-4 bg-kb-green text-cream rounded-card text-sm font-semibold hover:bg-kb-green/90"
        >
          + Nouveau produit
        </Link>
      </div>

      <div className="bg-white rounded-card border border-cream-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream/60 text-kb-olive uppercase text-xs">
              <tr>
                <th className="text-left px-3 py-2 w-14"></th>
                <th className="text-left px-3 py-2">Nom</th>
                <th className="text-left px-3 py-2">Catégorie</th>
                <th className="text-left px-3 py-2">Type</th>
                <th className="text-right px-3 py-2">Prix (FCFA)</th>
                <th className="text-center px-3 py-2">Dispo</th>
                <th className="text-right px-3 py-2 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <InlineRow
                  key={item.id}
                  id={item.id}
                  nom={item.nom}
                  slug={item.slug}
                  categorie={item.categorie}
                  type={item.type}
                  prixFcfa={item.prixFcfa}
                  disponible={item.disponible}
                  imageUrl={item.imageUrl}
                />
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-kb-olive">
                    Aucun item. Lancez{' '}
                    <code className="bg-cream px-1 rounded">npm run db:seed</code>{' '}
                    ou créez un nouveau produit.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
