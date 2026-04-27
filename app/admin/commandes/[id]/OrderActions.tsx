'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateOrderStatus, deleteOrder } from '@/app/actions/orders';

const TRANSITIONS: Record<string, string[]> = {
  NOUVEAU: ['CONFIRME', 'ANNULE'],
  CONFIRME: ['EN_LIVRAISON', 'ANNULE'],
  EN_LIVRAISON: ['LIVRE', 'ANNULE'],
  LIVRE: [],
  ANNULE: ['NOUVEAU'],
};

const LABELS: Record<string, string> = {
  NOUVEAU: 'Marquer Nouveau',
  CONFIRME: 'Confirmer',
  EN_LIVRAISON: 'Marquer en livraison',
  LIVRE: 'Marquer livrée',
  ANNULE: 'Annuler',
};

const COLORS: Record<string, string> = {
  CONFIRME: 'bg-kb-green text-cream',
  EN_LIVRAISON: 'bg-blue-600 text-white',
  LIVRE: 'bg-emerald-600 text-white',
  ANNULE: 'bg-gray-200 text-gray-800',
  NOUVEAU: 'bg-kb-bordeaux text-cream',
};

export default function OrderActions({
  id,
  currentStatus,
  canDelete,
}: {
  id: string;
  currentStatus: string;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const change = (next: string) => {
    startTransition(async () => {
      const res = await updateOrderStatus(id, next);
      if (!res.ok) {
        alert(res.error ?? 'Erreur');
        return;
      }
      router.refresh();
    });
  };

  const onDelete = () => {
    if (!confirm('Supprimer définitivement cette commande ?')) return;
    startTransition(async () => {
      try {
        await deleteOrder(id);
        router.push('/admin/commandes');
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Erreur');
      }
    });
  };

  const next = TRANSITIONS[currentStatus] ?? [];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {next.map((s) => (
        <button
          key={s}
          onClick={() => change(s)}
          disabled={pending}
          className={`h-10 px-4 rounded-card font-medium text-sm disabled:opacity-50 ${COLORS[s]}`}
        >
          {LABELS[s]}
        </button>
      ))}
      {canDelete && (
        <button
          onClick={onDelete}
          disabled={pending}
          className="h-10 px-4 rounded-card font-medium text-sm border border-kb-bordeaux text-kb-bordeaux hover:bg-kb-bordeaux/5 ml-auto"
        >
          Supprimer
        </button>
      )}
    </div>
  );
}
