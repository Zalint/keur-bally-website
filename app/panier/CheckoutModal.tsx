'use client';

import { useState, useTransition } from 'react';
import { createOrder } from '@/app/actions/orders';
import type { CartItem } from '@/lib/types';

type Confirmed = { ref: string; whatsappUrl: string };

export default function CheckoutModal({
  open,
  onClose,
  items,
  totalFcfa,
  onValidated,
}: {
  open: boolean;
  onClose: () => void;
  items: CartItem[];
  totalFcfa: number;
  onValidated: (whatsappUrl: string, ref: string) => void;
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [confirmed, setConfirmed] = useState<Confirmed | null>(null);

  if (!open) return null;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await createOrder({
        customerName: name.trim(),
        customerPhone: phone.trim(),
        customerAddress: address.trim() || null,
        customerNote: note.trim() || null,
        items,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      // Affiche l'écran de confirmation au lieu d'ouvrir WhatsApp d'office.
      setConfirmed({ ref: res.ref, whatsappUrl: res.whatsappUrl });
    });
  };

  const onOpenWhatsApp = () => {
    if (!confirmed) return;
    window.open(confirmed.whatsappUrl, '_blank', 'noopener,noreferrer');
    onValidated(confirmed.whatsappUrl, confirmed.ref);
  };

  const onSkipWhatsApp = () => {
    if (!confirmed) return;
    onValidated(confirmed.whatsappUrl, confirmed.ref);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 p-4"
      onClick={confirmed ? undefined : onClose}
    >
      <div
        className="bg-cream w-full max-w-md rounded-card shadow-pack p-5 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {confirmed ? (
          <ConfirmStep
            refCode={confirmed.ref}
            onOpen={onOpenWhatsApp}
            onSkip={onSkipWhatsApp}
          />
        ) : (
          <>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="font-serif text-xl font-semibold text-kb-green">
                  Vos coordonnées
                </h2>
                <p className="text-xs text-kb-olive mt-1">
                  Total : {totalFcfa.toLocaleString('fr-FR')} FCFA · {items.length}{' '}
                  article{items.length > 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-kb-olive hover:text-kb-bordeaux text-2xl leading-none"
                aria-label="Fermer"
              >
                ×
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-3">
              <Field label="Votre nom *">
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  className={inputCls}
                  disabled={pending}
                />
              </Field>
              <Field label="Téléphone (WhatsApp) *">
                <input
                  required
                  type="tel"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+221 77 ..."
                  autoComplete="tel"
                  className={inputCls}
                  disabled={pending}
                />
              </Field>
              <Field label="Adresse de livraison (optionnel)">
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Liberté 5, immeuble..."
                  autoComplete="street-address"
                  className={inputCls}
                  disabled={pending}
                />
              </Field>
              <Field label="Note (optionnel)">
                <textarea
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Précisions, créneau de livraison..."
                  className={inputCls}
                  disabled={pending}
                />
              </Field>

              {error && (
                <p className="text-sm text-kb-bordeaux bg-kb-bordeaux/10 px-3 py-2 rounded-card">
                  {error}
                </p>
              )}

              <p className="text-[11px] text-kb-olive leading-snug">
                En validant, votre commande sera enregistrée. Vous pourrez ensuite
                ouvrir WhatsApp pour finaliser l&apos;envoi.
              </p>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={pending}
                  className="flex-1 h-11 border border-kb-olive/30 text-kb-olive rounded-card font-medium hover:bg-kb-olive/5"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="flex-1 h-11 bg-kb-bordeaux text-cream rounded-card font-semibold hover:bg-kb-bordeaux-dark disabled:opacity-50"
                >
                  {pending ? 'Envoi…' : 'Valider'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function ConfirmStep({
  refCode,
  onOpen,
  onSkip,
}: {
  refCode: string;
  onOpen: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="text-center py-2">
      <div className="w-14 h-14 rounded-full bg-kb-green/10 text-kb-green text-3xl flex items-center justify-center mx-auto mb-3">
        ✓
      </div>
      <h2 className="font-serif text-xl font-semibold text-kb-green">
        Commande enregistrée
      </h2>
      <p className="text-sm text-kb-olive mt-1">
        Référence : <strong className="font-mono">{refCode}</strong>
      </p>

      <div className="flex flex-col gap-2 mt-5">
        <button
          type="button"
          onClick={onOpen}
          className="h-11 bg-kb-bordeaux text-cream rounded-card font-semibold hover:bg-kb-bordeaux-dark"
        >
          Ouvrir WhatsApp
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="h-11 text-kb-olive hover:text-kb-ink underline text-sm"
        >
          Plus tard
        </button>
      </div>
    </div>
  );
}

const inputCls =
  'w-full h-10 px-3 rounded-card border border-cream-border bg-white focus:border-kb-green focus:outline-none focus:ring-1 focus:ring-kb-green';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="block font-medium text-kb-ink mb-1">{label}</span>
      {children}
    </label>
  );
}
