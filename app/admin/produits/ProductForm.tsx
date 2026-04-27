'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import CloudinaryUploader from '@/components/CloudinaryUploader';
import { createItem, updateItem, deleteItemAndRedirect } from './actions';

type FormData = {
  id: string;
  slug: string;
  type: 'PRODUIT' | 'PACK';
  nom: string;
  categorie: string;
  description: string;
  prixFcfa: number;
  unite: string;
  imageUrl: string;
  imageUrl2: string;
  imageUrl3: string;
  disponible: boolean;
  ordre: number;
  composition: string;
  livraisonGratuite: boolean;
  note: string;
};

const UNITES = ['sac', 'kg', 'L', 'pièce', 'lot', 'pack', 'boîte', 'bouteille'];

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function ProductForm({
  mode,
  initial,
  categories,
}: {
  mode: 'create' | 'edit';
  initial: FormData;
  categories: string[];
}) {
  const [data, setData] = useState<FormData>(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setData((d) => ({ ...d, [key]: value }));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const payload = {
        ...data,
        description: data.description || null,
        imageUrl2: data.imageUrl2 || null,
        imageUrl3: data.imageUrl3 || null,
        composition: data.composition || null,
        note: data.note || null,
      };
      const res =
        mode === 'create'
          ? await createItem(payload)
          : await updateItem(initial.id, payload);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push('/admin');
      router.refresh();
    });
  };

  const onDelete = () => {
    if (!confirm(`Supprimer définitivement « ${initial.nom} » ?`)) return;
    startTransition(async () => {
      try {
        await deleteItemAndRedirect(initial.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur');
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="bg-white rounded-card border border-cream-border p-5 space-y-4">
        <h2 className="font-semibold text-kb-ink">Informations générales</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Nom *">
            <input
              required
              value={data.nom}
              onChange={(e) => {
                const nom = e.target.value;
                setData((d) => ({
                  ...d,
                  nom,
                  ...(mode === 'create'
                    ? { slug: slugify(nom), id: d.id || slugify(nom) }
                    : {}),
                }));
              }}
              className={inputCls}
            />
          </Field>
          <Field label="Catégorie *">
            <input
              required
              list="categories"
              value={data.categorie}
              onChange={(e) => set('categorie', e.target.value)}
              className={inputCls}
            />
            <datalist id="categories">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>
          <Field label="Identifiant (id) *">
            <input
              required
              disabled={mode === 'edit'}
              value={data.id}
              onChange={(e) => set('id', slugify(e.target.value))}
              className={`${inputCls} ${mode === 'edit' ? 'bg-cream/40' : ''}`}
            />
          </Field>
          <Field label="Slug *">
            <input
              required
              value={data.slug}
              onChange={(e) => set('slug', slugify(e.target.value))}
              className={inputCls}
            />
          </Field>
          <Field label="Type *">
            <select
              value={data.type}
              onChange={(e) => set('type', e.target.value as 'PRODUIT' | 'PACK')}
              className={inputCls}
            >
              <option value="PRODUIT">Produit</option>
              <option value="PACK">Pack</option>
            </select>
          </Field>
          <Field label="Unité *">
            <select
              value={data.unite}
              onChange={(e) => set('unite', e.target.value)}
              className={inputCls}
            >
              {UNITES.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Prix FCFA *">
            <input
              type="number"
              required
              min={0}
              value={data.prixFcfa}
              onChange={(e) => set('prixFcfa', Number(e.target.value))}
              className={inputCls}
            />
          </Field>
          <Field label="Ordre d'affichage">
            <input
              type="number"
              value={data.ordre}
              onChange={(e) => set('ordre', Number(e.target.value))}
              className={inputCls}
            />
          </Field>
          <Field label="Description" full>
            <textarea
              rows={3}
              value={data.description}
              onChange={(e) => set('description', e.target.value)}
              className={inputCls}
            />
          </Field>
          {data.type === 'PACK' && (
            <Field label="Composition (1 ligne par produit)" full>
              <textarea
                rows={6}
                placeholder="Sac de riz 25 kg&#10;Huile 5 L&#10;Petits pois 800 g (ou équivalent)"
                value={data.composition}
                onChange={(e) => set('composition', e.target.value)}
                className={inputCls + ' font-mono text-sm'}
              />
              <p className="text-xs text-kb-olive mt-1">
                Ajoute &laquo;&nbsp;(ou équivalent)&nbsp;&raquo; pour signaler une substitution possible.
              </p>
            </Field>
          )}
          <Field label="Note">
            <input
              value={data.note}
              onChange={(e) => set('note', e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>

        <div className="flex flex-wrap gap-6 pt-2">
          <Toggle
            label="Disponible"
            checked={data.disponible}
            onChange={(v) => set('disponible', v)}
          />
          <Toggle
            label="Livraison gratuite"
            checked={data.livraisonGratuite}
            onChange={(v) => set('livraisonGratuite', v)}
          />
        </div>
      </div>

      <div className="bg-white rounded-card border border-cream-border p-5 space-y-4">
        <h2 className="font-semibold text-kb-ink">Photos</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <ImageSlot
            label="Photo principale *"
            value={data.imageUrl}
            onChange={(url) => set('imageUrl', url)}
          />
          <ImageSlot
            label="Photo 2"
            value={data.imageUrl2}
            onChange={(url) => set('imageUrl2', url)}
          />
          <ImageSlot
            label="Photo 3"
            value={data.imageUrl3}
            onChange={(url) => set('imageUrl3', url)}
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-kb-bordeaux bg-kb-bordeaux/10 px-3 py-2 rounded-card">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => router.push('/admin')}
          className="text-kb-olive hover:underline"
        >
          ← Annuler
        </button>
        <div className="flex gap-3">
          {mode === 'edit' && (
            <button
              type="button"
              onClick={onDelete}
              disabled={pending}
              className="h-10 px-4 border border-kb-bordeaux text-kb-bordeaux rounded-card font-medium hover:bg-kb-bordeaux/5"
            >
              Supprimer
            </button>
          )}
          <button
            type="submit"
            disabled={pending}
            className="h-10 px-5 bg-kb-green text-cream rounded-card font-semibold hover:bg-kb-green/90 disabled:opacity-50"
          >
            {pending ? 'Enregistrement…' : mode === 'create' ? 'Créer' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </form>
  );
}

const inputCls =
  'w-full h-10 px-3 rounded-card border border-cream-border focus:border-kb-green focus:outline-none focus:ring-1 focus:ring-kb-green';

function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <label className={`block text-sm ${full ? 'sm:col-span-2' : ''}`}>
      <span className="block font-medium text-kb-ink mb-1">{label}</span>
      {children}
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
          checked ? 'bg-kb-green' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </button>
      {label}
    </label>
  );
}

function ImageSlot({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-kb-ink mb-1">{label}</p>
      {value ? (
        <div className="relative group">
          <Image
            src={value}
            alt=""
            width={300}
            height={300}
            className="w-full aspect-square object-cover rounded-card border border-cream-border"
            unoptimized
          />
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <CloudinaryUploader onUpload={onChange} buttonLabel="Remplacer" />
            <button
              type="button"
              onClick={() => onChange('')}
              className="h-8 px-2 bg-white/90 rounded text-xs text-kb-bordeaux hover:bg-white"
            >
              Retirer
            </button>
          </div>
        </div>
      ) : (
        <div className="aspect-square rounded-card border-2 border-dashed border-cream-border flex items-center justify-center">
          <CloudinaryUploader onUpload={onChange} buttonLabel="Uploader une photo" />
        </div>
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="ou collez une URL"
        className="mt-2 w-full h-8 px-2 text-xs rounded border border-cream-border"
      />
    </div>
  );
}
