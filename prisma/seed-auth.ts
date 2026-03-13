// Seed Authentication Users with Hashed Passwords
// Run: npm run seed:auth

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Hash a password using bcrypt
 * @param password - Plain text password
 * @param saltRounds - Number of salt rounds (default: 10)
 * @returns Hashed password
 */
export async function hashPassword(password: string, saltRounds: number = 10): Promise<string> {
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Create a test user with hashed password
 * @param email - User email
 * @param password - Plain text password
 * @param name - User name (optional)
 */
export async function createTestUser(
  email: string,
  password: string,
  name?: string
) {
  const hashedPassword = await hashPassword(password, 10);
  
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      name: name || email.split('@')[0],
    },
    create: {
      email,
      password: hashedPassword,
      name: name || email.split('@')[0],
      emailVerified: new Date(),
    },
  });
  
  return user;
}

async function main() {
  console.log('🔐 Seeding authentication users...');

  // Create test user
  const testUser = await createTestUser(
    'test@ceoclaw.com',
    'password123',
    'Test User'
  );

  console.log('✅ Created test user:', {
    id: testUser.id,
    email: testUser.email,
    name: testUser.name,
    emailVerified: testUser.emailVerified,
  });

  console.log('\n📝 Test credentials:');
  console.log('  Email: test@ceoclaw.com');
  console.log('  Password: password123');
  console.log('\n⚠️  WARNING: Change these credentials in production!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding auth users:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
