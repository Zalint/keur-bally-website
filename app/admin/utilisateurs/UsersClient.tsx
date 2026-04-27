'use client';

import { useState, useTransition } from 'react';
import { createUser, deleteUser, updateRole } from './actions';

type User = {
  id: string;
  email: string;
  nom: string;
  role: 'OWNER' | 'EDITOR';
  createdAt: string;
  lastLoginAt: string | null;
};

export default function UsersClient({
  users: initialUsers,
  currentUserId,
}: {
  users: User[];
  currentUserId: string;
}) {
  const [users, setUsers] = useState(initialUsers);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const refreshFromForm = (u: User) => setUsers((s) => [...s, u]);

  const onCreate = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const res = await createUser({
        email: String(formData.get('email')),
        nom: String(formData.get('nom')),
        password: String(formData.get('password')),
        role: formData.get('role') as 'OWNER' | 'EDITOR',
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      refreshFromForm(res.user);
      setShowForm(false);
    });
  };

  const onChangeRole = (id: string, role: 'OWNER' | 'EDITOR') => {
    setError(null);
    startTransition(async () => {
      const res = await updateRole(id, role);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setUsers((s) => s.map((u) => (u.id === id ? { ...u, role } : u)));
    });
  };

  const onDelete = (id: string, email: string) => {
    if (!confirm(`Supprimer l'admin ${email} ?`)) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteUser(id);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setUsers((s) => s.filter((u) => u.id !== id));
    });
  };

  return (
    <div className="space-y-4">
      {error && (
        <p className="text-sm text-kb-bordeaux bg-kb-bordeaux/10 px-3 py-2 rounded-card">
          {error}
        </p>
      )}

      <div className="bg-white rounded-card border border-cream-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cream/60 text-kb-olive uppercase text-xs">
            <tr>
              <th className="text-left px-3 py-2">Nom</th>
              <th className="text-left px-3 py-2">Email</th>
              <th className="text-left px-3 py-2">Rôle</th>
              <th className="text-left px-3 py-2">Dernière connexion</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-cream-border">
                <td className="px-3 py-2">
                  {u.nom}
                  {u.id === currentUserId && (
                    <span className="ml-2 text-xs text-kb-olive">(vous)</span>
                  )}
                </td>
                <td className="px-3 py-2 text-kb-olive">{u.email}</td>
                <td className="px-3 py-2">
                  <select
                    value={u.role}
                    disabled={u.id === currentUserId || pending}
                    onChange={(e) =>
                      onChangeRole(u.id, e.target.value as 'OWNER' | 'EDITOR')
                    }
                    className="h-8 px-2 rounded border border-cream-border text-sm"
                  >
                    <option value="EDITOR">EDITOR</option>
                    <option value="OWNER">OWNER</option>
                  </select>
                </td>
                <td className="px-3 py-2 text-kb-olive">
                  {u.lastLoginAt
                    ? new Date(u.lastLoginAt).toLocaleString('fr-FR')
                    : '—'}
                </td>
                <td className="px-3 py-2 text-right">
                  {u.id !== currentUserId && (
                    <button
                      onClick={() => onDelete(u.id, u.email)}
                      disabled={pending}
                      className="text-kb-bordeaux hover:underline text-sm"
                    >
                      Supprimer
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm ? (
        <form
          action={onCreate}
          className="bg-white rounded-card border border-cream-border p-4 space-y-3"
        >
          <h2 className="font-medium">Nouvel admin</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              name="nom"
              required
              placeholder="Nom"
              className="h-10 px-3 rounded-card border border-cream-border"
            />
            <input
              name="email"
              type="email"
              required
              placeholder="email@exemple.com"
              className="h-10 px-3 rounded-card border border-cream-border"
            />
            <input
              name="password"
              type="password"
              required
              minLength={8}
              placeholder="Mot de passe (8+ car.)"
              className="h-10 px-3 rounded-card border border-cream-border"
            />
            <select
              name="role"
              defaultValue="EDITOR"
              className="h-10 px-3 rounded-card border border-cream-border"
            >
              <option value="EDITOR">EDITOR</option>
              <option value="OWNER">OWNER</option>
            </select>
          </div>
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="h-10 px-4 text-kb-olive"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={pending}
              className="h-10 px-4 bg-kb-green text-cream rounded-card font-semibold disabled:opacity-50"
            >
              Créer
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="h-10 px-4 bg-kb-green text-cream rounded-card font-semibold hover:bg-kb-green/90"
        >
          + Nouvel admin
        </button>
      )}
    </div>
  );
}
