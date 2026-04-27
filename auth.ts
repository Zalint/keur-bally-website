import NextAuth, { type DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/db';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'OWNER' | 'EDITOR';
      nom: string;
    } & DefaultSession['user'];
  }
}


const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  pages: { signIn: '/admin/login' },
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      authorize: async (raw) => {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const user = await prisma.adminUser.findUnique({
          where: { email: email.toLowerCase() },
        });
        if (!user) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        await prisma.adminUser.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.nom,
          nom: user.nom,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.id = (user as { id: string }).id;
        token.role = (user as { role: 'OWNER' | 'EDITOR' }).role;
        token.nom = (user as { nom: string }).nom;
      }
      return token;
    },
    session: ({ session, token }) => {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'OWNER' | 'EDITOR';
        session.user.nom = token.nom as string;
      }
      return session;
    },
    authorized: ({ auth, request: { nextUrl } }) => {
      const isAdmin = nextUrl.pathname.startsWith('/admin');
      const isLogin = nextUrl.pathname === '/admin/login';
      if (isAdmin && !isLogin && !auth) return false;
      if (isLogin && auth) {
        return Response.redirect(new URL('/admin', nextUrl));
      }
      return true;
    },
  },
});
