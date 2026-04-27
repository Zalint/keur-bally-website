/**
 * Crée (ou met à jour) un administrateur.
 *
 * Usage :
 *   npm run create-admin -- --email=x@y.com --nom="Saliou" --password="secret" [--role=OWNER]
 */
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient, AdminRole } from '@prisma/client';

const prisma = new PrismaClient();

function arg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const found = process.argv.find((a) => a.startsWith(prefix));
  return found ? found.slice(prefix.length) : undefined;
}

async function main() {
  const email = arg('email');
  const nom = arg('nom');
  const password = arg('password');
  const roleArg = arg('role')?.toUpperCase() ?? 'EDITOR';

  if (!email || !nom || !password) {
    console.error(
      'Usage: npm run create-admin -- --email=x@y.com --nom="Nom" --password="..." [--role=OWNER|EDITOR]'
    );
    process.exit(1);
  }
  if (roleArg !== 'OWNER' && roleArg !== 'EDITOR') {
    console.error('--role doit être OWNER ou EDITOR');
    process.exit(1);
  }
  if (password.length < 8) {
    console.error('Mot de passe trop court (8 caractères minimum)');
    process.exit(1);
  }

  const role = roleArg as AdminRole;
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.adminUser.upsert({
    where: { email },
    create: { email, nom, role, passwordHash },
    update: { nom, role, passwordHash },
  });

  console.log(`✓ Admin ${user.email} (${user.role}) prêt`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
