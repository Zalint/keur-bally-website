import Link from 'next/link';
import { prisma } from '@/lib/db';
import OrdersFilters from './OrdersFilters';
import StatusBadge from './StatusBadge';

export const dynamic = 'force-dynamic';

const PERIODES = {
  today: { label: "Aujourd'hui", days: 1 },
  '7d': { label: '7 jours', days: 7 },
  '30d': { label: '30 jours', days: 30 },
  all: { label: 'Tout', days: null },
} as const;

type PeriodeKey = keyof typeof PERIODES;

const ALL_STATUSES = ['NOUVEAU', 'CONFIRME', 'EN_LIVRAISON', 'LIVRE', 'ANNULE'] as const;

function fmtFcfa(n: number) {
  return n.toLocaleString('fr-FR') + ' FCFA';
}

function fmtDate(d: Date) {
  return d.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default async function CommandesPage({
  searchParams,
}: {
  searchParams?: { p?: string; s?: string; q?: string };
}) {
  const periodeKey = (searchParams?.p as PeriodeKey) ?? '7d';
  const periode = PERIODES[periodeKey] ?? PERIODES['7d'];
  const statusFilter = searchParams?.s ?? '';
  const q = searchParams?.q?.trim() ?? '';

  const where: Record<string, unknown> = {};
  if (periode.days) {
    const since = new Date();
    since.setDate(since.getDate() - periode.days);
    where.createdAt = { gte: since };
  }
  if (statusFilter && (ALL_STATUSES as readonly string[]).includes(statusFilter)) {
    where.status = statusFilter;
  }
  if (q) {
    where.OR = [
      { ref: { contains: q, mode: 'insensitive' } },
      { customerName: { contains: q, mode: 'insensitive' } },
      { customerPhone: { contains: q } },
    ];
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: { _count: { select: { items: true } } },
  });

  // Stats today (indépendant des filtres)
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const todayOrders = await prisma.order.findMany({
    where: { createdAt: { gte: startOfDay } },
    select: { totalFcfa: true, status: true },
  });
  const todayCount = todayOrders.length;
  const todayTotal = todayOrders
    .filter((o) => o.status !== 'ANNULE')
    .reduce((s, o) => s + o.totalFcfa, 0);
  const nouveauCount = await prisma.order.count({ where: { status: 'NOUVEAU' } });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-kb-ink">Commandes</h1>
          <p className="text-sm text-kb-olive">
            {orders.length} commande{orders.length > 1 ? 's' : ''} affichée
            {orders.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <Stat label="Aujourd'hui" value={todayCount} />
        <Stat label="CA jour" value={fmtFcfa(todayTotal)} />
        <Stat label="À traiter" value={nouveauCount} highlight={nouveauCount > 0} />
      </div>

      <OrdersFilters
        periodes={Object.entries(PERIODES).map(([k, v]) => ({ key: k, label: v.label }))}
        statuses={ALL_STATUSES as unknown as string[]}
        currentPeriode={periodeKey}
        currentStatus={statusFilter}
        currentQuery={q}
      />

      <div className="bg-white rounded-card border border-cream-border overflow-hidden mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream/60 text-kb-olive uppercase text-xs">
              <tr>
                <th className="text-left px-3 py-2">Date</th>
                <th className="text-left px-3 py-2">Réf</th>
                <th className="text-left px-3 py-2">Client</th>
                <th className="text-right px-3 py-2">Total</th>
                <th className="text-center px-3 py-2">Articles</th>
                <th className="text-center px-3 py-2">Statut</th>
                <th className="text-right px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-cream-border hover:bg-cream/30">
                  <td className="px-3 py-2 text-kb-olive whitespace-nowrap">
                    {fmtDate(o.createdAt)}
                  </td>
                  <td className="px-3 py-2 font-mono">{o.ref}</td>
                  <td className="px-3 py-2">
                    <div className="font-medium">{o.customerName}</div>
                    <div className="text-xs text-kb-olive">{o.customerPhone}</div>
                  </td>
                  <td className="px-3 py-2 text-right font-mono">
                    {fmtFcfa(o.totalFcfa)}
                  </td>
                  <td className="px-3 py-2 text-center text-kb-olive">
                    {o._count.items}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Link
                      href={`/admin/commandes/${o.id}`}
                      className="text-kb-green hover:underline"
                    >
                      Détails
                    </Link>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-kb-olive">
                    Aucune commande pour ces filtres.
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

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`bg-white rounded-card border p-4 ${
        highlight ? 'border-kb-bordeaux' : 'border-cream-border'
      }`}
    >
      <div className="text-xs uppercase text-kb-olive">{label}</div>
      <div
        className={`text-xl font-semibold ${
          highlight ? 'text-kb-bordeaux' : 'text-kb-ink'
        }`}
      >
        {value}
      </div>
    </div>
  );
}
