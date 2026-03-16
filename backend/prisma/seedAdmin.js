const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const hashed = await bcrypt.hash('Admin@123', 10);

  const admin = await prisma.admin.upsert({
    where:  { email: 'admin@mediconnect.com' },
    update: {},
    create: { name: 'MediConnect Admin', email: 'admin@mediconnect.com', password: hashed }
  });

  console.log('✅ Admin seeded:', admin.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());