'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

export async function signInAction(formData: FormData): Promise<{ error?: string } | void> {
  try {
    await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirect: false,
    });
  } catch (err) {
    if (err instanceof AuthError) {
      if (err.type === 'CredentialsSignin') {
        return { error: 'Email ou mot de passe incorrect' };
      }
      return { error: 'Erreur de connexion' };
    }
    throw err;
  }
}

export async function signOutAction() {
  const { signOut } = await import('@/auth');
  await signOut({ redirectTo: '/admin/login' });
}
