import type { Metadata } from 'next';
import WhatsAppFloatingButton from '@/components/WhatsAppFloatingButton';

export const metadata: Metadata = {
  title: 'Comment commander',
  description:
    'Quatre étapes pour commander chez Keur Bally : choisissez, validez vos coordonnées, confirmez sur WhatsApp, recevez à domicile.',
};

const FAQ = [
  {
    q: 'Quelles zones livrez-vous ?',
    r: 'Dakar et banlieue proche, en priorité autour du Rond-point Liberté 5. Pour les zones plus éloignées, contactez-nous sur WhatsApp avant la commande.',
  },
  {
    q: 'Quels sont les frais de livraison ?',
    r: 'Variables selon la zone. Certains packs sont livrés gratuitement (badge « Livraison gratuite »).',
  },
  {
    q: 'Quels délais ?',
    r: "En général le jour même ou le lendemain, selon votre zone et l'heure de commande.",
  },
  {
    q: 'Comment payer ?',
    r: 'À la livraison : en espèces, par Wave ou Orange Money. À confirmer avec le livreur.',
  },
  {
    q: 'Que se passe-t-il si un produit est en rupture ?',
    r: "Nous vous contactons par WhatsApp pour proposer un équivalent de gamme similaire, ou retirer l'article de la commande.",
  },
];

export default function CommandPage() {
  return (
    <>
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="font-serif text-3xl md:text-4xl font-semibold text-kb-ink">
          Comment commander
        </h1>
        <p className="mt-2 text-kb-olive">Quatre étapes simples, zéro friction.</p>

        <ol className="mt-8 space-y-5">
          {[
            {
              t: 'Choisissez vos articles',
              d: 'Naviguez dans le catalogue ou les packs, ajoutez ce que vous voulez à votre panier.',
            },
            {
              t: 'Validez vos coordonnées',
              d: 'Cliquez sur « Commander » et renseignez votre nom et votre numéro de téléphone. L\'adresse de livraison et une note sont optionnelles.',
            },
            {
              t: 'Confirmez sur WhatsApp',
              d: 'Votre commande reçoit une référence (ex. KB-A3F2). Ouvrez WhatsApp depuis le bouton, le message est pré-rempli, il suffit d\'appuyer sur Envoyer.',
            },
            {
              t: 'Recevez la livraison',
              d: 'Nous confirmons la disponibilité, le créneau et l\'adresse. Paiement à la livraison.',
            },
          ].map((s, i) => (
            <li
              key={s.t}
              className="flex gap-4 bg-white rounded-card p-5 border border-cream-border"
            >
              <span className="flex-shrink-0 w-10 h-10 rounded-full bg-kb-green text-cream font-serif font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <div>
                <h3 className="font-serif text-lg text-kb-ink">{s.t}</h3>
                <p className="mt-1 text-sm text-kb-olive">{s.d}</p>
              </div>
            </li>
          ))}
        </ol>

        <h2 className="mt-12 font-serif text-2xl text-kb-ink">Questions fréquentes</h2>
        <dl className="mt-5 space-y-4">
          {FAQ.map((f) => (
            <div key={f.q} className="bg-white rounded-card p-5 border border-cream-border">
              <dt className="font-medium text-kb-ink">{f.q}</dt>
              <dd className="mt-1 text-sm text-kb-olive leading-relaxed">{f.r}</dd>
            </div>
          ))}
        </dl>
      </div>
      <WhatsAppFloatingButton />
    </>
  );
}
