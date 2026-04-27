'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    cloudinary?: {
      createUploadWidget: (
        opts: Record<string, unknown>,
        cb: (err: unknown, result: { event?: string; info?: { secure_url?: string } }) => void
      ) => { open: () => void };
    };
  }
}

const SCRIPT_SRC = 'https://upload-widget.cloudinary.com/global/all.js';

let scriptPromise: Promise<void> | null = null;
function loadScript() {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('SSR'));
    if (window.cloudinary) return resolve();
    const s = document.createElement('script');
    s.src = SCRIPT_SRC;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Cloudinary widget script failed to load'));
    document.body.appendChild(s);
  });
  return scriptPromise;
}

export default function CloudinaryUploader({
  onUpload,
  buttonLabel = 'Uploader',
}: {
  onUpload: (url: string) => void;
  buttonLabel?: string;
}) {
  const widgetRef = useRef<{ open: () => void } | null>(null);
  const [ready, setReady] = useState(false);
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  useEffect(() => {
    if (!cloudName || !preset) return;
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !window.cloudinary) return;
        widgetRef.current = window.cloudinary.createUploadWidget(
          {
            cloudName,
            uploadPreset: preset,
            sources: ['local', 'camera', 'url'],
            multiple: false,
            folder: 'keur-bally',
            clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
            maxFileSize: 10_000_000,
            language: 'fr',
            text: { fr: { 'menu.files': 'Mes fichiers' } },
          },
          (err, result) => {
            if (err) {
              console.error('Upload error', err);
              return;
            }
            if (result?.event === 'success' && result.info?.secure_url) {
              onUpload(result.info.secure_url);
            }
          }
        );
        setReady(true);
      })
      .catch((e) => console.error(e));
    return () => {
      cancelled = true;
    };
  }, [cloudName, preset, onUpload]);

  if (!cloudName || !preset) {
    return (
      <span className="text-xs text-kb-bordeaux">
        Cloudinary non configuré (vérifier les variables d&apos;env)
      </span>
    );
  }

  return (
    <button
      type="button"
      disabled={!ready}
      onClick={() => widgetRef.current?.open()}
      className="h-8 px-3 bg-kb-green text-cream rounded text-xs font-medium hover:bg-kb-green/90 disabled:opacity-50"
    >
      {ready ? buttonLabel : 'Chargement…'}
    </button>
  );
}
