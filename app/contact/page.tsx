import type { Metadata } from 'next';
import { helloLink } from '@/lib/whatsapp';
import WhatsAppFloatingButton from '@/components/WhatsAppFloatingButton';

const NAME = process.env.NEXT_PUBLIC_BUSINESS_NAME ?? 'Keur Bally';
const LOCATION =
  process.env.NEXT_PUBLIC_BUSINESS_LOCATION ?? 'Rond-point Liberté 5, Dakar';
const RAW_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '221770000000';

function formatPhone(num: string): string {
  // 221771234567 -> +221 77 123 45 67
  if (num.startsWith('221') && num.length === 12) {
    return `+221 ${num.slice(3, 5)} ${num.slice(5, 8)} ${num.slice(8, 10)} ${num.slice(10)}`;
  }
  return `+${num}`;
}

export const metadata: Metadata = {
  title: 'Contact',
  description: `Contacter ${NAME}. Adresse, téléphone, WhatsApp, horaires.`,
};

export default function ContactPage() {
  return (
    <>
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="font-serif text-3xl md:text-4xl font-semibold text-kb-ink">
          Nous contacter
        </h1>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="bg-white rounded-card p-5 border border-cream-border">
            <h2 className="font-serif text-lg text-kb-ink">Adresse</h2>
            <p className="mt-1 text-sm text-kb-olive">{LOCATION}</p>
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(LOCATION)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-sm text-kb-bordeaux underline"
            >
              Ouvrir dans Google Maps
            </a>
          </div>

          <div className="bg-white rounded-card p-5 border border-cream-border">
            <h2 className="font-serif text-lg text-kb-ink">Horaires</h2>
            <p className="mt-1 text-sm text-kb-olive">
              Lundi – Samedi : 8h – 21h
              <br />
              Dimanche : 9h – 14h
            </p>
          </div>

          <div className="bg-white rounded-card p-5 border border-cream-border">
            <h2 className="font-serif text-lg text-kb-ink">Téléphone</h2>
            <a
              href={`tel:+${RAW_NUMBER}`}
              className="mt-1 inline-block font-medium text-kb-green hover:text-kb-bordeaux tnum"
            >
              {formatPhone(RAW_NUMBER)}
            </a>
          </div>

          <div className="bg-white rounded-card p-5 border border-cream-border">
            <h2 className="font-serif text-lg text-kb-ink">WhatsApp Business</h2>
            <a
              href={helloLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 h-11 leading-[2.75rem] px-5 bg-kb-green text-cream font-semibold rounded-card hover:bg-kb-green-dark"
            >
              Discuter maintenant
            </a>
          </div>
        </div>
      </div>
      <WhatsAppFloatingButton />
    </>
  );
}
