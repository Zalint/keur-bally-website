import { notFound } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import StatusBadge from '../StatusBadge';
import OrderActions from './OrderActions';

export const dynamic = 'force-dynamic';

function fmtFcfa(n: number) {
  return n.toLocaleString('fr-FR') + ' FCFA';
}

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true },
  });
  if (!order) notFound();

  const phoneClean = order.customerPhone.replace(/\D/g, '');

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/commandes"
        className="text-sm text-kb-olive hover:text-kb-ink"
      >
        ← Toutes les commandes
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3 mt-2 mb-6">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-kb-ink">
            Commande {order.ref}
          </h1>
          <div className="text-sm text-kb-olive mt-1">
            {order.createdAt.toLocaleString('fr-FR')}
          </div>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="bg-white rounded-card border border-cream-border p-5 mb-5">
        <h2 className="font-medium text-kb-ink mb-3">Client</h2>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <Info label="Nom" value={order.customerName} />
          <Info
            label="Téléphone"
            value={
              <a
                href={`https://wa.me/${phoneClean}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-kb-green hover:underline"
              >
                {order.customerPhone}
              </a>
            }
          />
          {order.customerAddress && (
            <Info label="Adresse" value={order.customerAddress} full />
          )}
          {order.customerNote && <Info label="Note" value={order.customerNote} full />}
        </div>
      </div>

      <div className="bg-white rounded-card border border-cream-border p-5 mb-5">
        <h2 className="font-medium text-kb-ink mb-3">Articles</h2>
        <table className="w-full text-sm">
          <thead className="text-kb-olive text-xs uppercase">
            <tr>
              <th className="text-left py-1">Article</th>
              <th className="text-right py-1">Qté</th>
              <th className="text-right py-1">PU</th>
              <th className="text-right py-1">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((it) => (
              <tr key={it.id} className="border-t border-cream-border">
                <td className="py-2">
                  {it.nom}
                  <span className="text-xs text-kb-olive ml-1">({it.unite})</span>
                </td>
                <td className="py-2 text-right">{it.quantite}</td>
                <td className="py-2 text-right font-mono">{fmtFcfa(it.prixFcfa)}</td>
                <td className="py-2 text-right font-mono font-semibold">
                  {fmtFcfa(it.totalLine)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-cream-border">
              <td colSpan={3} className="text-right py-3 font-medium">
                Total
              </td>
              <td className="text-right py-3 font-mono font-bold text-kb-green">
                {fmtFcfa(order.totalFcfa)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="bg-white rounded-card border border-cream-border p-5 mb-5">
        <h2 className="font-medium text-kb-ink mb-2">Message WhatsApp envoyé</h2>
        <pre className="text-xs whitespace-pre-wrap font-sans bg-cream/40 p-3 rounded">
          {order.rawMessage}
        </pre>
        <p className="text-xs text-kb-olive mt-2">
          Notification email :{' '}
          {order.notifSentAt ? (
            <span className="text-kb-green">
              envoyée le {order.notifSentAt.toLocaleString('fr-FR')}
            </span>
          ) : order.notifError ? (
            <span className="text-kb-bordeaux">échec — {order.notifError}</span>
          ) : (
            <span>en attente</span>
          )}
        </p>
      </div>

      <OrderActions
        id={order.id}
        currentStatus={order.status}
        canDelete={session?.user?.role === 'OWNER'}
      />
    </div>
  );
}

function Info({
  label,
  value,
  full,
}: {
  label: string;
  value: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <div className="text-xs uppercase text-kb-olive">{label}</div>
      <div className="text-kb-ink">{value}</div>
    </div>
  );
}
