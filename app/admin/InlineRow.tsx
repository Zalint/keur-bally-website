'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { updateQuickFields } from './produits/actions';

export default function InlineRow({
  id,
  nom,
  slug,
  categorie,
  type,
  prixFcfa,
  disponible,
  imageUrl,
}: {
  id: string;
  nom: string;
  slug: string;
  categorie: string;
  type: 'PRODUIT' | 'PACK';
  prixFcfa: number;
  disponible: boolean;
  imageUrl: string;
}) {
  const [editingPrice, setEditingPrice] = useState(false);
  const [price, setPrice] = useState(prixFcfa);
  const [dispo, setDispo] = useState(disponible);
  const [pending, startTransition] = useTransition();

  const savePrice = () => {
    startTransition(async () => {
      const res = await updateQuickFields(id, { prixFcfa: price });
      if (!res.ok) {
        alert(res.error ?? 'Erreur');
        setPrice(prixFcfa);
      }
      setEditingPrice(false);
    });
  };

  const toggleDispo = () => {
    const next = !dispo;
    setDispo(next);
    startTransition(async () => {
      const res = await updateQuickFields(id, { disponible: next });
      if (!res.ok) {
        alert(res.error ?? 'Erreur');
        setDispo(!next);
      }
    });
  };

  return (
    <tr className="border-t border-cream-border hover:bg-cream/30">
      <td className="px-3 py-2">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={nom}
            width={48}
            height={48}
            className="w-12 h-12 object-cover rounded"
            unoptimized
          />
        ) : (
          <div className="w-12 h-12 bg-cream rounded" />
        )}
      </td>
      <td className="px-3 py-2">
        <div className="font-medium text-kb-ink">{nom}</div>
        <div className="text-xs text-kb-olive">{slug}</div>
      </td>
      <td className="px-3 py-2 text-kb-olive">{categorie}</td>
      <td className="px-3 py-2">
        <span
          className={`inline-block text-xs px-2 py-0.5 rounded-full ${
            type === 'PACK'
              ? 'bg-kb-bordeaux/10 text-kb-bordeaux'
              : 'bg-kb-green/10 text-kb-green'
          }`}
        >
          {type === 'PACK' ? 'Pack' : 'Produit'}
        </span>
      </td>
      <td className="px-3 py-2 text-right">
        {editingPrice ? (
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            onBlur={savePrice}
            onKeyDown={(e) => {
              if (e.key === 'Enter') savePrice();
              if (e.key === 'Escape') {
                setPrice(prixFcfa);
                setEditingPrice(false);
              }
            }}
            disabled={pending}
            autoFocus
            className="w-24 text-right border border-kb-green rounded px-2 py-0.5"
          />
        ) : (
          <button
            onClick={() => setEditingPrice(true)}
            className="hover:bg-kb-green/10 px-2 py-0.5 rounded font-mono"
          >
            {price.toLocaleString('fr-FR')}
          </button>
        )}
      </td>
      <td className="px-3 py-2 text-center">
        <button
          onClick={toggleDispo}
          disabled={pending}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
            dispo ? 'bg-kb-green' : 'bg-gray-300'
          }`}
          aria-label={dispo ? 'Disponible' : 'Indisponible'}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              dispo ? 'translate-x-4' : 'translate-x-0.5'
            }`}
          />
        </button>
      </td>
      <td className="px-3 py-2 text-right">
        <Link
          href={`/admin/produits/${id}`}
          className="text-kb-green hover:underline text-sm"
        >
          Éditer
        </Link>
      </td>
    </tr>
  );
}
