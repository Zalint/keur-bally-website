import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import ProductForm from '../ProductForm';

export const dynamic = 'force-dynamic';

export default async function EditProduitPage({
  params,
}: {
  params: { id: string };
}) {
  const item = await prisma.item.findUnique({ where: { id: params.id } });
  if (!item) notFound();

  const cats = await prisma.item.findMany({
    select: { categorie: true },
    distinct: ['categorie'],
    orderBy: { categorie: 'asc' },
  });

  return (
    <div className="max-w-4xl">
      <h1 className="font-serif text-2xl font-semibold text-kb-ink mb-6">
        Éditer : {item.nom}
      </h1>
      <ProductForm
        mode="edit"
        categories={cats.map((c) => c.categorie)}
        initial={{
          id: item.id,
          slug: item.slug,
          type: item.type,
          nom: item.nom,
          categorie: item.categorie,
          description: item.description ?? '',
          prixFcfa: item.prixFcfa,
          unite: item.unite,
          imageUrl: item.imageUrl,
          imageUrl2: item.imageUrl2 ?? '',
          imageUrl3: item.imageUrl3 ?? '',
          disponible: item.disponible,
          ordre: item.ordre,
          composition: item.composition ?? '',
          livraisonGratuite: item.livraisonGratuite,
          note: item.note ?? '',
        }}
      />
    </div>
  );
}
