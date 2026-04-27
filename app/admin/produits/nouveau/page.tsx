import { prisma } from '@/lib/db';
import ProductForm from '../ProductForm';

export const dynamic = 'force-dynamic';

export default async function NewProduitPage() {
  const cats = await prisma.item.findMany({
    select: { categorie: true },
    distinct: ['categorie'],
    orderBy: { categorie: 'asc' },
  });

  return (
    <div className="max-w-4xl">
      <h1 className="font-serif text-2xl font-semibold text-kb-ink mb-6">
        Nouveau produit
      </h1>
      <ProductForm
        mode="create"
        categories={cats.map((c) => c.categorie)}
        initial={{
          id: '',
          slug: '',
          type: 'PRODUIT',
          nom: '',
          categorie: '',
          description: '',
          prixFcfa: 0,
          unite: 'pièce',
          imageUrl: '',
          imageUrl2: '',
          imageUrl3: '',
          disponible: true,
          ordre: 100,
          composition: '',
          livraisonGratuite: false,
          note: '',
        }}
      />
    </div>
  );
}
