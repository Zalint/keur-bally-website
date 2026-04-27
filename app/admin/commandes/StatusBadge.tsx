const STYLES: Record<string, string> = {
  NOUVEAU: 'bg-kb-bordeaux/10 text-kb-bordeaux',
  CONFIRME: 'bg-kb-green/10 text-kb-green',
  EN_LIVRAISON: 'bg-blue-100 text-blue-700',
  LIVRE: 'bg-emerald-100 text-emerald-700',
  ANNULE: 'bg-gray-200 text-gray-600 line-through',
};

const LABELS: Record<string, string> = {
  NOUVEAU: 'Nouveau',
  CONFIRME: 'Confirmé',
  EN_LIVRAISON: 'En livraison',
  LIVRE: 'Livré',
  ANNULE: 'Annulé',
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
        STYLES[status] ?? 'bg-gray-100 text-gray-600'
      }`}
    >
      {LABELS[status] ?? status}
    </span>
  );
}
