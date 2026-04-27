'use client';

import { useState, useTransition } from 'react';
import { updateProfil, changePassword } from './actions';

export default function ProfilForm({
  initial,
}: {
  initial: { email: string; nom: string; role: string };
}) {
  const [nom, setNom] = useState(initial.nom);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const onSaveNom = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    startTransition(async () => {
      const res = await updateProfil({ nom });
      setMsg(
        res.ok
          ? { ok: true, text: 'Profil mis à jour' }
          : { ok: false, text: res.error }
      );
    });
  };

  const onChangePwd = (formData: FormData) => {
    setMsg(null);
    startTransition(async () => {
      const res = await changePassword({
        currentPassword: String(formData.get('currentPassword')),
        newPassword: String(formData.get('newPassword')),
      });
      setMsg(
        res.ok
          ? { ok: true, text: 'Mot de passe changé' }
          : { ok: false, text: res.error }
      );
      if (res.ok) {
        (document.getElementById('pwd-form') as HTMLFormElement)?.reset();
      }
    });
  };

  return (
    <div className="space-y-6">
      {msg && (
        <p
          className={`text-sm px-3 py-2 rounded-card ${
            msg.ok
              ? 'text-kb-green bg-kb-green/10'
              : 'text-kb-bordeaux bg-kb-bordeaux/10'
          }`}
        >
          {msg.text}
        </p>
      )}

      <form onSubmit={onSaveNom} className="bg-white rounded-card border border-cream-border p-5 space-y-3">
        <h2 className="font-medium text-kb-ink">Informations</h2>
        <Field label="Email">
          <input
            value={initial.email}
            disabled
            className="w-full h-10 px-3 rounded-card border border-cream-border bg-cream/40"
          />
        </Field>
        <Field label="Rôle">
          <input
            value={initial.role}
            disabled
            className="w-full h-10 px-3 rounded-card border border-cream-border bg-cream/40"
          />
        </Field>
        <Field label="Nom">
          <input
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            required
            className="w-full h-10 px-3 rounded-card border border-cream-border"
          />
        </Field>
        <button
          type="submit"
          disabled={pending}
          className="h-10 px-4 bg-kb-green text-cream rounded-card font-semibold disabled:opacity-50"
        >
          Enregistrer
        </button>
      </form>

      <form
        id="pwd-form"
        action={onChangePwd}
        className="bg-white rounded-card border border-cream-border p-5 space-y-3"
      >
        <h2 className="font-medium text-kb-ink">Changer le mot de passe</h2>
        <Field label="Mot de passe actuel">
          <input
            name="currentPassword"
            type="password"
            required
            className="w-full h-10 px-3 rounded-card border border-cream-border"
          />
        </Field>
        <Field label="Nouveau mot de passe">
          <input
            name="newPassword"
            type="password"
            required
            minLength={8}
            className="w-full h-10 px-3 rounded-card border border-cream-border"
          />
        </Field>
        <button
          type="submit"
          disabled={pending}
          className="h-10 px-4 bg-kb-green text-cream rounded-card font-semibold disabled:opacity-50"
        >
          Changer
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="block font-medium text-kb-ink mb-1">{label}</span>
      {children}
    </label>
  );
}
