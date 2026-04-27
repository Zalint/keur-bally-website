'use client';

import { usePathname } from 'next/navigation';
import { helloLink } from '@/lib/whatsapp';

export default function WhatsAppFloatingButton() {
  const pathname = usePathname();
  if (pathname?.startsWith('/panier')) return null;

  return (
    <a
      href={helloLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Discuter sur WhatsApp"
      className="fixed bottom-5 right-5 z-40 w-14 h-14 rounded-full bg-kb-green text-cream shadow-pack flex items-center justify-center hover:bg-kb-green-dark transition-colors"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7" aria-hidden>
        <path d="M20.5 3.5A11 11 0 0 0 3.6 17.3L2 22l4.9-1.6a11 11 0 0 0 16.5-9.5 11 11 0 0 0-2.9-7.4Zm-8.5 17a9 9 0 0 1-4.6-1.3l-.3-.2-2.9.9.9-2.8-.2-.3a9 9 0 1 1 7.1 3.7Zm5.2-6.7c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1l-.9 1.1c-.2.2-.3.2-.6.1-.3-.1-1.2-.4-2.4-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.4-.4c.1-.1.2-.3.3-.5.1-.2.1-.4 0-.5L9 6.6c-.2-.4-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3c-.3.3-1 1-1 2.5s1 2.9 1.2 3.1c.1.2 2 3.1 4.9 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3Z" />
      </svg>
    </a>
  );
}
